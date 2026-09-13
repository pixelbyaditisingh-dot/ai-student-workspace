from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class TopicSection(BaseModel):
    topic_title: str = Field(description="Sub-topic or chapter title")
    summary: str = Field(description="2-3 sentence overview of this section")
    bullet_points: List[str] = Field(description="Concise, high-yield bullet points")


class RevisionNotes(BaseModel):
    title: str = Field(description="High-level descriptive title of the lecture")
    overview: str = Field(description="Executive summary of the lecture material")
    core_topics: List[TopicSection] = Field(description="Breakdown of key sub-topics")
    key_takeaways: List[str] = Field(description="Top high-yield takeaways for rapid exam revision")


class KeyConcept(BaseModel):
    id: int = Field(description="Sequential concept ID")
    term: str = Field(description="Name of the concept, term, or law")
    definition: str = Field(description="Clear, student-friendly definition")
    context_or_example: str = Field(description="Real-world example or practical context")
    category: str = Field(default="Core Concept", description="Category badge (e.g., Core Concept, Mechanism, Law, Formula)")


class QuizOption(BaseModel):
    id: str = Field(description="A, B, C, or D")
    text: str = Field(description="Option text")


class QuizQuestion(BaseModel):
    id: int = Field(description="Question number 1 to 5")
    question: str = Field(description="The multiple-choice question")
    options: List[QuizOption] = Field(description="Exactly 4 distinct choices (A, B, C, D)")
    correct_option: str = Field(description="The correct choice ID: 'A', 'B', 'C', or 'D'")
    explanation: str = Field(description="Detailed explanation of why the correct answer is right and why others are wrong")
    concept_tested: str = Field(description="Which key concept or topic is being assessed")


class StudyPack(BaseModel):
    title: str
    notes: RevisionNotes
    concepts: List[KeyConcept]
    quiz: List[QuizQuestion]


class DocumentAnalysisResponse(BaseModel):
    success: bool
    filename: str
    word_count: int
    reading_time_mins: int
    raw_text_preview: str
    notes: RevisionNotes
    concepts: List[KeyConcept]
    quiz: List[QuizQuestion]
    is_mock: bool = False
    message: Optional[str] = None


class TextExtractionResponse(BaseModel):
    success: bool
    filename: str
    text: str
    word_count: int
    reading_time_mins: int


class GenerateRequest(BaseModel):
    text: str
    filename: Optional[str] = "lecture_notes.txt"


class QuizSubmission(BaseModel):
    answers: Dict[str, str] = Field(description="Map of question ID (as string) to selected option ID ('A','B','C','D')")
    quiz: List[QuizQuestion] = Field(description="The quiz questions being graded")


class QuestionResult(BaseModel):
    question_id: int
    question: str
    selected_option: Optional[str]
    correct_option: str
    is_correct: bool
    explanation: str
    concept_tested: str


class QuizEvaluationResult(BaseModel):
    score: int
    total: int
    percentage: float
    grade_label: str
    breakdown: List[QuestionResult]
    study_recommendations: List[str]
