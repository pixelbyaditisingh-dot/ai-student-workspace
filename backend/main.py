import os
import io
from pathlib import Path
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, Header, Form, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from backend.models import (
    DocumentAnalysisResponse,
    TextExtractionResponse,
    GenerateRequest,
    QuizSubmission,
    QuizEvaluationResult
)
from backend.parser import extract_text_from_file
from backend.ai_service import (
    generate_study_pack,
    evaluate_quiz_submission,
    get_gemini_client
)

# Load environment variables strictly from .env
load_dotenv()

app = FastAPI(
    title="Learnly API",
    description="AI-Powered Student Learning Workspace Backend",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
SAMPLES_DIR = BASE_DIR / "samples"

# In-memory storage for saved lecture packs and quiz history
SAVED_LECTURES: List[Dict[str, Any]] = []
SAVED_QUIZ_HISTORY: List[Dict[str, Any]] = []


@app.get("/api/health")
async def health_check():
    """Returns server status and whether server-side Gemini API key is configured."""
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    gemini_ready = bool(gemini_key and "your_gemini_api_key_here" not in gemini_key)
    return {
        "status": "healthy",
        "app": "Learnly AI Workspace",
        "version": "1.0.0",
        "gemini_env_configured": gemini_ready
    }


@app.post("/api/extract-text", response_model=TextExtractionResponse)
async def extract_text_endpoint(file: UploadFile = File(...)):
    """Extracts raw text, word count, and reading time from a PDF or TXT file."""
    allowed_extensions = (".pdf", ".txt", ".md", ".rtf")
    filename = file.filename or "lecture_document.txt"
    
    if not any(filename.lower().endswith(ext) for ext in allowed_extensions):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{filename}'. Learnly supports PDF and TXT files."
        )

    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail=f"The uploaded file '{filename}' is empty (0 bytes).")
            
        if len(content) > 25 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds the 25MB limit.")

        text, word_count, reading_time = extract_text_from_file(content, filename)
        return TextExtractionResponse(
            success=True,
            filename=filename,
            text=text,
            word_count=word_count,
            reading_time_mins=reading_time
        )
    except HTTPException as he:
        raise he
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract text: {str(e)}")


@app.post("/api/generate", response_model=DocumentAnalysisResponse)
async def generate_from_text(
    payload: GenerateRequest,
    x_gemini_api_key: Optional[str] = Header(default=None, alias="X-Gemini-API-Key")
):
    """Generates revision notes and a 5-question quiz from text string."""
    text = payload.text.strip()
    if len(text) < 30:
        raise HTTPException(status_code=400, detail="Text is too short for AI study synthesis.")

    filename = payload.filename or "lecture_notes.txt"
    effective_api_key = x_gemini_api_key or os.getenv("GEMINI_API_KEY")
    study_pack = generate_study_pack(text, filename, effective_api_key)
    
    word_count = len(text.split())
    reading_time = max(1, round(word_count / 220))

    response_data = DocumentAnalysisResponse(
        success=True,
        filename=filename,
        word_count=word_count,
        reading_time_mins=reading_time,
        raw_text_preview=text[:3000] + ("\n\n[... Truncated for preview ...]" if len(text) > 3000 else ""),
        notes=study_pack["notes"],
        concepts=study_pack["concepts"],
        quiz=study_pack["quiz"],
        is_mock=study_pack.get("is_mock", False),
        message=study_pack.get("message")
    )
    
    # Save into in-memory store
    SAVED_LECTURES.insert(0, response_data.model_dump())
    return response_data


@app.post("/api/process", response_model=DocumentAnalysisResponse)
@app.post("/api/upload", response_model=DocumentAnalysisResponse)
async def process_document(
    file: UploadFile = File(...),
    x_gemini_api_key: Optional[str] = Header(default=None, alias="X-Gemini-API-Key"),
    api_key_override: Optional[str] = Form(default=None)
):
    """
    Uploads and processes a lecture PDF or TXT file to produce
    revision notes, key concepts, and a 5-question quiz.
    """
    effective_api_key = api_key_override or x_gemini_api_key or os.getenv("GEMINI_API_KEY")
    
    # Validate file format
    allowed_extensions = (".pdf", ".txt", ".md", ".rtf")
    filename = file.filename or "lecture_document.txt"
    if not any(filename.lower().endswith(ext) for ext in allowed_extensions):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Please upload a PDF or TXT file (received: {filename})"
        )

    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail=f"The uploaded file '{filename}' is empty (0 bytes).")
            
        if len(content) > 25 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds the 25MB limit.")

        # Extract text and stats
        text, word_count, reading_time = extract_text_from_file(content, filename)
        
        if len(text.strip()) < 30:
            raise HTTPException(
                status_code=400,
                detail="The document does not contain enough extractable text. Please ensure it has readable lecture content."
            )

        # Generate structured study pack
        study_pack = generate_study_pack(text, filename, effective_api_key)

        response_data = DocumentAnalysisResponse(
            success=True,
            filename=filename,
            word_count=word_count,
            reading_time_mins=reading_time,
            raw_text_preview=text[:3000] + ("\n\n[... Remaining text truncated for preview ...]" if len(text) > 3000 else ""),
            notes=study_pack["notes"],
            concepts=study_pack["concepts"],
            quiz=study_pack["quiz"],
            is_mock=study_pack.get("is_mock", False),
            message=study_pack.get("message")
        )

        SAVED_LECTURES.insert(0, response_data.model_dump())
        return response_data
    except HTTPException as he:
        raise he
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing lecture: {str(e)}")


@app.post("/api/process-sample", response_model=DocumentAnalysisResponse)
async def process_sample_lecture(
    payload: dict,
    x_gemini_api_key: Optional[str] = Header(default=None, alias="X-Gemini-API-Key")
):
    """Processes a preloaded lecture sample for instant testing."""
    sample_id = payload.get("sample_id", "machine_learning")
    sample_map = {
        "machine_learning": ("machine_learning_intro.txt", "CS480_Machine_Learning_Lecture4.txt"),
        "cellular_biology": ("cellular_respiration_biology.txt", "BIO110_Cellular_Respiration_ATP.txt")
    }

    if sample_id not in sample_map:
        raise HTTPException(status_code=404, detail="Sample lecture not found.")

    file_name, display_name = sample_map[sample_id]
    sample_path = SAMPLES_DIR / file_name

    if not sample_path.exists():
        raise HTTPException(status_code=404, detail=f"Sample file {file_name} missing on server.")

    with open(sample_path, "rb") as f:
        content = f.read()

    text, word_count, reading_time = extract_text_from_file(content, display_name)
    effective_api_key = x_gemini_api_key or os.getenv("GEMINI_API_KEY")
    study_pack = generate_study_pack(text, display_name, effective_api_key)

    response_data = DocumentAnalysisResponse(
        success=True,
        filename=display_name,
        word_count=word_count,
        reading_time_mins=reading_time,
        raw_text_preview=text[:3000] + ("\n\n[... Remaining text truncated for preview ...]" if len(text) > 3000 else ""),
        notes=study_pack["notes"],
        concepts=study_pack["concepts"],
        quiz=study_pack["quiz"],
        is_mock=study_pack.get("is_mock", False),
        message=study_pack.get("message")
    )
    
    SAVED_LECTURES.insert(0, response_data.model_dump())
    return response_data


@app.get("/api/notes")
async def get_notes_list():
    """Returns all synthesized study packs in current workspace."""
    return {"success": True, "count": len(SAVED_LECTURES), "lectures": SAVED_LECTURES}


@app.get("/api/notes/{filename}")
async def get_note_by_filename(filename: str):
    """Retrieves a specific lecture study pack by filename."""
    found = next((l for l in SAVED_LECTURES if l.get("filename") == filename), None)
    if not found:
        raise HTTPException(status_code=404, detail=f"Note pack '{filename}' not found.")
    return found


@app.post("/api/quiz/evaluate", response_model=QuizEvaluationResult)
async def evaluate_quiz(submission: QuizSubmission):
    """Grades student answers, calculates mastery score, and provides diagnostic advice."""
    try:
        result = evaluate_quiz_submission(submission)
        SAVED_QUIZ_HISTORY.insert(0, result.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error evaluating quiz: {str(e)}")


@app.get("/api/quiz/history")
async def get_quiz_history():
    """Returns history of all completed quizzes in current session."""
    return {"success": True, "count": len(SAVED_QUIZ_HISTORY), "history": SAVED_QUIZ_HISTORY}


# Serve static files if frontend folder exists
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

    @app.get("/")
    async def serve_index():
        return FileResponse(str(FRONTEND_DIR / "index.html"))
