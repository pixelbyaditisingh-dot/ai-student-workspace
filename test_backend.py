import os
import sys

# Ensure UTF-8 output encoding for test logs
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from fastapi.testclient import TestClient
from backend.main import app

def test_endpoints():
    client = TestClient(app)

    # 1. Health check
    res = client.get("/api/health")
    print("Health Check:", res.status_code, res.json())
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

    # 2. Text Extraction endpoint
    txt_content = b"Lecture 1: Quantum Computing Foundations\n\nQuantum bits or qubits can exist in superposition. Superposition allows quantum algorithms to process exponentially large state spaces simultaneously."
    res_ext = client.post(
        "/api/extract-text",
        files={"file": ("quantum_lecture.txt", txt_content, "text/plain")}
    )
    print("Extract Text Endpoint:", res_ext.status_code)
    assert res_ext.status_code == 200
    ext_data = res_ext.json()
    assert ext_data["success"] is True
    assert ext_data["word_count"] > 10
    print("[OK] Extracted word count:", ext_data["word_count"])

    # 3. Generate from Text endpoint
    res_gen = client.post(
        "/api/generate",
        json={"text": ext_data["text"], "filename": "quantum_lecture.txt"}
    )
    print("Generate from Text Endpoint:", res_gen.status_code)
    assert res_gen.status_code == 200
    gen_data = res_gen.json()
    assert gen_data["success"] is True
    assert len(gen_data["quiz"]) == 5
    print("[OK] Generated title:", gen_data["notes"]["title"])

    # 4. Sample processing
    res = client.post("/api/process-sample", json={"sample_id": "machine_learning"})
    print("Process Sample (ML):", res.status_code)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["concepts"]) >= 4
    assert len(data["quiz"]) == 5
    assert len(data["notes"]["core_topics"]) >= 2
    print("[OK] Notes title:", data["notes"]["title"])
    print("[OK] Number of concepts:", len(data["concepts"]))
    print("[OK] Number of quiz questions:", len(data["quiz"]))

    # 5. Quiz Evaluation
    quiz_questions = data["quiz"]
    answers = {
        str(quiz_questions[0]["id"]): quiz_questions[0]["correct_option"],
        str(quiz_questions[1]["id"]): quiz_questions[1]["correct_option"],
        str(quiz_questions[2]["id"]): quiz_questions[2]["correct_option"],
        str(quiz_questions[3]["id"]): "D" if quiz_questions[3]["correct_option"] != "D" else "A",
        str(quiz_questions[4]["id"]): "D" if quiz_questions[4]["correct_option"] != "D" else "A"
    }
    eval_res = client.post("/api/quiz/evaluate", json={"answers": answers, "quiz": quiz_questions})
    print("Quiz Evaluation:", eval_res.status_code)
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    assert eval_data["score"] == 3
    assert eval_data["total"] == 5
    assert eval_data["percentage"] == 60.0
    print("[OK] Evaluated score:", eval_data["score"], "/", eval_data["total"], f"({eval_data['percentage']}%)")
    print("[OK] Grade label:", eval_data["grade_label"])

    # 6. Upload / Process Endpoint
    res_upload = client.post(
        "/api/upload",
        files={"file": ("quantum_lecture.txt", txt_content, "text/plain")}
    )
    print("Upload Endpoint (/api/upload):", res_upload.status_code)
    assert res_upload.status_code == 200
    upload_data = res_upload.json()
    assert upload_data["success"] is True
    assert len(upload_data["quiz"]) == 5

    # 7. Notes and Quiz History retrieval
    notes_res = client.get("/api/notes")
    print("Notes List (/api/notes):", notes_res.status_code)
    assert notes_res.status_code == 200
    assert notes_res.json()["count"] > 0

    history_res = client.get("/api/quiz/history")
    print("Quiz History List (/api/quiz/history):", history_res.status_code)
    assert history_res.status_code == 200
    assert history_res.json()["count"] > 0

    print("\nALL BACKEND ENDPOINTS & COMPREHENSIVE TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_endpoints()
