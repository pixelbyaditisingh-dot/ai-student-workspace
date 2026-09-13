import os
import json
import re
from typing import Optional, Dict, Any
from backend.models import (
    StudyPack,
    RevisionNotes,
    TopicSection,
    KeyConcept,
    QuizQuestion,
    QuizOption,
    QuizSubmission,
    QuizEvaluationResult,
    QuestionResult
)


def get_gemini_client(api_key: Optional[str] = None):
    """Initializes Google GenAI client if an API key is available."""
    key = api_key or os.getenv("GEMINI_API_KEY")
    if not key or key.strip() == "" or "your_gemini_api_key_here" in key:
        return None
    
    try:
        from google import genai
        return genai.Client(api_key=key.strip())
    except Exception as e:
        print(f"Failed to initialize GenAI client: {e}")
        return None


def generate_study_pack(
    text_content: str,
    filename: str,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generates structured revision notes, key concepts, and 5 quiz questions.
    Uses Gemini API if key is available; falls back to the heuristic synthesizer.
    """
    client = get_gemini_client(api_key)
    
    # If text is too long for prompt, limit to first ~30k chars with clear notice
    truncated_text = text_content[:30000]
    if len(text_content) > 30000:
        truncated_text += "\n\n[... Lecture content truncated for optimal processing ...]"

    if client:
        try:
            return call_gemini_api(client, truncated_text, filename)
        except Exception as err:
            print(f"Gemini API generation failed ({err}), falling back to heuristic engine.")
            mock_pack = generate_heuristic_study_pack(text_content, filename)
            mock_pack["is_mock"] = True
            mock_pack["message"] = f"AI API note: Switched to intelligent fallback mode ({str(err)}). You can enter a valid Gemini API Key in Settings."
            return mock_pack
    else:
        mock_pack = generate_heuristic_study_pack(text_content, filename)
        mock_pack["is_mock"] = True
        mock_pack["message"] = "Demo Mode: Generated using Learnly's intelligent local synthesizer. Add your free Gemini API Key in Settings for live LLM generation!"
        return mock_pack


def call_gemini_api(client, text_content: str, filename: str) -> Dict[str, Any]:
    """Invokes Gemini 2.5 Flash with structured JSON output."""
    from google.genai import types

    system_instruction = (
        "You are Learnly AI, an elite university tutor and learning specialist. "
        "Your goal is to transform student lecture material into an organized, high-retention study workspace. "
        "Analyze the provided lecture text and return a comprehensive JSON object matching the exact schema."
    )

    prompt = f"""
Analyze the following lecture content extracted from the file '{filename}'.

Generate:
1. 'notes': A structured revision notes object containing:
   - 'title': Clear, academic, descriptive title.
   - 'overview': A concise, high-impact 2-4 sentence executive summary.
   - 'core_topics': 2 to 4 key topic sections, each with a 'topic_title', 2-3 sentence 'summary', and 3-5 high-yield 'bullet_points'.
   - 'key_takeaways': 4 to 6 critical bullet takeaways for rapid pre-exam review.
2. 'concepts': 4 to 6 key concepts/definitions/formulas with:
   - 'id': integer starting from 1
   - 'term': Concept or term name
   - 'definition': Student-friendly, crystal-clear definition
   - 'context_or_example': Practical application or real-world example
   - 'category': e.g., 'Core Principle', 'Mechanism', 'Definition', 'Equation/Rule', 'Application'
3. 'quiz': Exactly 5 high-quality multiple choice questions testing different cognitive levels (definitions, concept application, distinction between ideas) with:
   - 'id': integer from 1 to 5
   - 'question': The question text
   - 'options': An array of 4 choices with 'id' ('A', 'B', 'C', 'D') and 'text'
   - 'correct_option': The single correct choice letter ('A', 'B', 'C', or 'D')
   - 'explanation': Clear explanation of why the correct option is right and why the distractors are wrong
   - 'concept_tested': Name of the concept or topic being evaluated

Lecture text:
---
{text_content}
---

Return ONLY valid JSON adhering to the StudyPack structure.
"""

    models_to_try = ["gemini-2.5-flash", "gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"]
    last_error = None

    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    response_schema=StudyPack,
                    temperature=0.2,
                ),
            )
            result_json = json.loads(response.text)
            return {
                "title": result_json.get("title", filename),
                "notes": result_json["notes"],
                "concepts": result_json["concepts"],
                "quiz": result_json["quiz"],
                "is_mock": False,
                "message": f"Generated with {model_name}"
            }
        except Exception as e:
            last_error = e
            continue

    raise last_error



def generate_heuristic_study_pack(text_content: str, filename: str) -> Dict[str, Any]:
    """
    Intelligent fallback parser that builds realistic, high-quality notes,
    flashcards, and quizzes directly from the lecture text.
    """
    # Extract candidate title
    lines = [l.strip() for l in text_content.split("\n") if l.strip()]
    doc_title = lines[0].replace("#", "").strip() if lines else filename.replace(".txt", "").replace(".pdf", "")
    if len(doc_title) > 70 or len(doc_title) < 4:
        doc_title = filename.rsplit(".", 1)[0].replace("_", " ").replace("-", " ").title()

    # Paragraphs
    paragraphs = [p.strip() for p in text_content.split("\n\n") if len(p.strip()) > 40]
    if not paragraphs:
        paragraphs = [text_content[i:i+300] for i in range(0, min(len(text_content), 1200), 300)]

    # Heuristic topic extraction
    topic_sections = []
    num_sections = min(max(2, len(paragraphs) // 2), 4)
    chunk_size = max(1, len(paragraphs) // num_sections)

    for i in range(num_sections):
        chunk = paragraphs[i * chunk_size : (i + 1) * chunk_size]
        combined = " ".join(chunk)
        # Extract title from first sentence
        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", combined) if s.strip()]
        first_sentence = sentences[0] if sentences else f"Section {i+1}"
        section_title = first_sentence[:50] + ("..." if len(first_sentence) > 50 else "")
        if ":" in first_sentence:
            section_title = first_sentence.split(":")[0].strip()

        # Bullets
        bullets = []
        for s in sentences[1:5]:
            if len(s) > 25:
                bullets.append(s)
        if not bullets and sentences:
            bullets = [s for s in sentences[:3]]

        topic_sections.append({
            "topic_title": section_title or f"Key Area {i+1}: Foundations",
            "summary": " ".join(sentences[:2]) if len(sentences) >= 2 else combined[:200],
            "bullet_points": bullets[:4] if bullets else ["Core takeaway focused on lecture fundamentals and exam preparation."]
        })

    # Heuristic key concepts extraction
    # Look for patterns like "Term: definition" or "Term is..." or capitalized nouns
    concepts = []
    concept_candidates = re.findall(r"([A-Z][A-Za-z0-9\s\-]{2,30}):\s*([^.\n]+(?:\.[^.\n]+)?)", text_content)
    
    if not concept_candidates:
        # Fallback to key terms from paragraphs
        words = re.findall(r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b", text_content)
        unique_terms = []
        for w in words:
            if w not in unique_terms and len(w) > 3 and w not in ["The", "This", "There", "Chapter", "Lecture", "Page"]:
                unique_terms.append(w)
        
        for idx, term in enumerate(unique_terms[:5]):
            concepts.append({
                "id": idx + 1,
                "term": term,
                "definition": f"A foundational concept in {doc_title} representing {term.lower()} in student coursework.",
                "context_or_example": f"Applied when analyzing system interactions and theoretical problems in this unit.",
                "category": "Core Principle" if idx % 2 == 0 else "Mechanism"
            })
    else:
        for idx, (term, defn) in enumerate(concept_candidates[:5]):
            concepts.append({
                "id": idx + 1,
                "term": term.strip(),
                "definition": defn.strip() + ("." if not defn.strip().endswith(".") else ""),
                "context_or_example": f"Observed in primary operational workflows and problem-solving scenarios.",
                "category": "Definition" if idx % 2 == 0 else "Core Concept"
            })

    if len(concepts) < 4:
        default_concepts = [
            ("Core Paradigm", "The overarching theoretical framework guiding this lecture topic.", "Used to establish baseline assumptions during analysis.", "Foundational"),
            ("Primary Variable", "The critical input or parameter affecting outcomes in the system.", "Measured experimentally to evaluate changes.", "Mechanism"),
            ("Systemic Constraint", "The boundary conditions or limits under which the process operates.", "Checked when designing solutions or testing edge cases.", "Rule/Law"),
            ("Practical Application", "The translation of lecture theory into tangible industry or research workflows.", "Implemented in standard lab setups and case studies.", "Application")
        ]
        for idx, (term, defn, ctx, cat) in enumerate(default_concepts[len(concepts):]):
            concepts.append({
                "id": len(concepts) + 1,
                "term": term,
                "definition": defn,
                "context_or_example": ctx,
                "category": cat
            })

    # Heuristic 5 Quiz Questions
    quiz_questions = []
    # Question 1: Topic Overview
    quiz_questions.append({
        "id": 1,
        "question": f"What is the primary focus of the lecture '{doc_title}'?",
        "options": [
            {"id": "A", "text": f"Understanding the foundational mechanisms and principles of {doc_title}."},
            {"id": "B", "text": "Proving that classical historical theories are entirely obsolete."},
            {"id": "C", "text": "Listing unrelated terminology without theoretical grounding."},
            {"id": "D", "text": "Conducting purely commercial market sales forecasting."}
        ],
        "correct_option": "A",
        "explanation": f"Option A accurately encapsulates the primary educational objective of '{doc_title}', focusing on core principles and mechanisms.",
        "concept_tested": "High-Level Overview"
    })

    # Question 2: First Concept
    c1 = concepts[0]["term"]
    quiz_questions.append({
        "id": 2,
        "question": f"In the context of this material, what does '{c1}' primarily refer to?",
        "options": [
            {"id": "A", "text": "A temporary anomaly that can be safely disregarded in practical applications."},
            {"id": "B", "text": concepts[0]["definition"]},
            {"id": "C", "text": "An obsolete mathematical notation with no modern relevance."},
            {"id": "D", "text": "A hardware component used exclusively in quantum physics laboratories."}
        ],
        "correct_option": "B",
        "explanation": f"Option B directly matches the definition of {c1}: {concepts[0]['definition']}",
        "concept_tested": c1
    })

    # Question 3: Second Concept
    c2 = concepts[1]["term"] if len(concepts) > 1 else "Primary Variable"
    quiz_questions.append({
        "id": 3,
        "question": f"How is '{c2}' typically applied or evaluated in practical problem solving?",
        "options": [
            {"id": "A", "text": "By completely isolating it from all dependent variables."},
            {"id": "B", "text": "By randomly assigning arbitrary constants without empirical data."},
            {"id": "C", "text": concepts[1]["context_or_example"] if len(concepts) > 1 else "Through controlled testing and parameter analysis."},
            {"id": "D", "text": "By replacing all qualitative observations with speculative guesses."}
        ],
        "correct_option": "C",
        "explanation": f"Option C represents the correct application context for {c2}.",
        "concept_tested": c2
    })

    # Question 4: Third Concept
    c3 = concepts[2]["term"] if len(concepts) > 2 else "Systemic Constraint"
    quiz_questions.append({
        "id": 4,
        "question": f"Which of the following best characterizes '{c3}'?",
        "options": [
            {"id": "A", "text": concepts[2]["definition"] if len(concepts) > 2 else "The boundary conditions under which the system operates."},
            {"id": "B", "text": "A factor that only exists in hypothetical simulations and never in reality."},
            {"id": "C", "text": "An external noise source that has zero correlation with system state."},
            {"id": "D", "text": "A static value that never changes regardless of environmental parameters."}
        ],
        "correct_option": "A",
        "explanation": f"Option A correctly identifies the core characteristics of {c3}.",
        "concept_tested": c3
    })

    # Question 5: Synthesis / Exam Application
    quiz_questions.append({
        "id": 5,
        "question": "When preparing for an exam on this lecture, which strategy will maximize concept retention?",
        "options": [
            {"id": "A", "text": "Memorizing disconnected terms without understanding their causal relationships."},
            {"id": "B", "text": "Connecting the core principles, testing with active recall quiz questions, and reviewing flashcard definitions."},
            {"id": "C", "text": "Skimming the lecture once immediately before entering the exam room."},
            {"id": "D", "text": "Focusing solely on formatting and font styles rather than theoretical content."}
        ],
        "correct_option": "B",
        "explanation": "Active recall, spaced review of key concepts, and continuous self-quizzing are empirically proven to maximize long-term retention and exam performance.",
        "concept_tested": "Synthesis & Active Recall"
    })

    overview_text = (
        f"This lecture provides an essential study guide on {doc_title}. "
        "It covers fundamental definitions, core theoretical foundations, and practical problem-solving applications. "
        "Mastering these sections will enable you to excel in upcoming coursework assessments and exams."
    )

    takeaways = [
        f"Master the core definitions of {', '.join([c['term'] for c in concepts[:3]])}.",
        "Review the structured topic breakdowns before attempting practice problem sets.",
        "Understand the practical relationships between input constraints and expected outputs.",
        "Use the 5-question practice quiz to verify your recall and address conceptual gaps."
    ]

    return {
        "title": doc_title,
        "notes": {
            "title": doc_title,
            "overview": overview_text,
            "core_topics": topic_sections,
            "key_takeaways": takeaways
        },
        "concepts": concepts,
        "quiz": quiz_questions,
        "is_mock": True
    }


def evaluate_quiz_submission(submission: QuizSubmission) -> QuizEvaluationResult:
    """Evaluates student quiz answers and generates diagnostic study advice."""
    total = len(submission.quiz)
    correct_count = 0
    breakdown = []
    missed_concepts = []

    for q in submission.quiz:
        selected = submission.answers.get(str(q.id))
        is_correct = (selected == q.correct_option)
        if is_correct:
            correct_count += 1
        else:
            missed_concepts.append(q.concept_tested)

        breakdown.append(QuestionResult(
            question_id=q.id,
            question=q.question,
            selected_option=selected,
            correct_option=q.correct_option,
            is_correct=is_correct,
            explanation=q.explanation,
            concept_tested=q.concept_tested
        ))

    score_pct = round((correct_count / total) * 100, 1) if total > 0 else 0.0

    if score_pct == 100:
        grade_label = "🌟 Outstanding! Perfect Mastery"
    elif score_pct >= 80:
        grade_label = "🎉 Great Job! Solid Grasp"
    elif score_pct >= 60:
        grade_label = "👍 Good Effort! Review Recommended"
    else:
        grade_label = "📚 Needs Revision! Revisit Key Concepts"

    recommendations = []
    if score_pct == 100:
        recommendations.append("You have mastered this lecture! Try teaching the key concepts to a peer or moving on to advanced problem sets.")
    else:
        if missed_concepts:
            unique_missed = list(dict.fromkeys(missed_concepts))
            recommendations.append(f"Focus your revision on: **{', '.join(unique_missed)}**.")
        recommendations.append("Flip through the Key Concepts flashcards to reinforce definitions.")
        recommendations.append("Re-read the high-yield bullet points in the Revision Notes tab and retry the quiz.")

    return QuizEvaluationResult(
        score=correct_count,
        total=total,
        percentage=score_pct,
        grade_label=grade_label,
        breakdown=breakdown,
        study_recommendations=recommendations
    )
