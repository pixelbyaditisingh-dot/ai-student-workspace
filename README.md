# Learnly

> **Turn lectures into smarter learning.**

Learnly is an AI-powered student workspace where students upload lecture PDFs or TXT files and receive concise revision notes, key concepts, and a 5-question practice quiz.

---

## 🌟 Key Features

- **Concise Revision Notes**: High-yield summaries, structured core topic breakdowns, and exam takeaways.
- **Important Key Concepts**: Categorized definitions, formulas, and real-world examples.
- **5-Question Practice Quiz**: Interactive assessment engine with immediate feedback, detailed answer explanations, and score diagnostics.
- **Study Dashboard & History**: Performance metrics, study streaks, and recent lecture activity.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- (Optional) Google Gemini API Key

### Installation & Run

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure API Key** (optional, fallback engine active by default):
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY to .env
   ```

3. **Start the application**:
   ```bash
   python -m uvicorn backend.main:app --port 8000
   ```

4. Open your browser at `http://localhost:8000`.
