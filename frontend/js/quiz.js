/**
 * Learnly Quiz Controller Module
 */
class QuizManager {
  constructor(containerElement) {
    this.container = containerElement;
    this.quiz = [];
    this.currentIndex = 0;
    this.userAnswers = {};
    this.isEvaluated = false;
  }

  loadQuiz(quizQuestions) {
    this.quiz = quizQuestions || [];
    this.currentIndex = 0;
    this.userAnswers = {};
    this.isEvaluated = false;
    this.render();
  }

  render() {
    if (!this.quiz || this.quiz.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 3rem;">
          <p style="color: var(--text-muted);">No quiz questions generated for this document.</p>
        </div>
      `;
      return;
    }

    if (this.isEvaluated) {
      // Summary rendered separately via showSummary()
      return;
    }

    const q = this.quiz[this.currentIndex];
    const total = this.quiz.length;
    const currentQNumber = this.currentIndex + 1;
    const selected = this.userAnswers[String(q.id)];
    const answeredCount = Object.keys(this.userAnswers).length;

    // Build options HTML
    const optionsHtml = q.options.map(opt => {
      const isSelected = selected === opt.id;
      let extraClass = isSelected ? "selected" : "";
      
      // If student has chosen an answer, reveal correctness immediately
      let statusIcon = "";
      if (selected) {
        if (opt.id === q.correct_option) {
          extraClass += " correct";
          statusIcon = `<span style="margin-left: auto; color: var(--success); font-weight: 700;">✓ Correct</span>`;
        } else if (isSelected && opt.id !== q.correct_option) {
          extraClass += " incorrect";
          statusIcon = `<span style="margin-left: auto; color: var(--danger); font-weight: 700;">✕ Incorrect</span>`;
        }
      }

      return `
        <button class="option-btn ${extraClass}" data-qid="${q.id}" data-opt="${opt.id}" ${selected ? "disabled" : ""}>
          <span class="option-letter">${opt.id}</span>
          <span class="option-text">${this.escapeHtml(opt.text)}</span>
          ${statusIcon}
        </button>
      `;
    }).join("");

    // Explanation panel
    let explanationHtml = "";
    if (selected) {
      const isCorrect = selected === q.correct_option;
      explanationHtml = `
        <div class="explanation-panel show ${isCorrect ? 'correct-exp' : 'incorrect-exp'}">
          <div class="explanation-title" style="color: ${isCorrect ? 'var(--success)' : 'var(--danger)'};">
            ${isCorrect ? '✨ Excellent! That is correct.' : '💡 Not quite. Here is the breakdown:'}
          </div>
          <div class="explanation-text">${this.escapeHtml(q.explanation)}</div>
        </div>
      `;
    }

    const isLast = this.currentIndex === total - 1;
    const canFinish = answeredCount === total;

    this.container.innerHTML = `
      <div class="quiz-progress-header">
        <span class="quiz-progress-text">Question ${currentQNumber} of ${total}</span>
        <span class="quiz-score-live">${answeredCount} of ${total} Answered</span>
      </div>

      <div class="progress-track" style="margin-top: -0.5rem; margin-bottom: 1.5rem;">
        <div class="progress-bar-fill" style="width: ${(currentQNumber / total) * 100}%;"></div>
      </div>

      <div class="question-box">
        <div class="question-meta">
          <span class="question-tag">${this.escapeHtml(q.concept_tested || 'Concept Test')}</span>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Q${q.id}</span>
        </div>

        <h3 class="question-title">${this.escapeHtml(q.question)}</h3>

        <div class="options-list">
          ${optionsHtml}
        </div>

        ${explanationHtml}

        <div class="quiz-actions" style="margin-top: 1.5rem;">
          <button class="btn btn-secondary btn-sm" id="btn-quiz-prev" ${this.currentIndex === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
            ← Previous
          </button>
          
          ${!isLast ? `
            <button class="btn btn-secondary btn-sm" id="btn-quiz-next">
              Next →
            </button>
          ` : `
            <button class="btn btn-primary btn-sm" id="btn-quiz-finish" ${!canFinish ? 'disabled style="opacity: 0.6; cursor: not-allowed;"' : ''}>
              Complete & View Score 🎯
            </button>
          `}
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Option click
    const optionBtns = this.container.querySelectorAll(".option-btn");
    optionBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const qid = btn.getAttribute("data-qid");
        const optId = btn.getAttribute("data-opt");
        this.userAnswers[qid] = optId;
        this.render();
      });
    });

    // Navigation
    const prevBtn = this.container.querySelector("#btn-quiz-prev");
    if (prevBtn && this.currentIndex > 0) {
      prevBtn.addEventListener("click", () => {
        this.currentIndex--;
        this.render();
      });
    }

    const nextBtn = this.container.querySelector("#btn-quiz-next");
    if (nextBtn && this.currentIndex < this.quiz.length - 1) {
      nextBtn.addEventListener("click", () => {
        this.currentIndex++;
        this.render();
      });
    }

    const finishBtn = this.container.querySelector("#btn-quiz-finish");
    if (finishBtn) {
      finishBtn.addEventListener("click", () => this.evaluateAndShowResults());
    }
  }

  async evaluateAndShowResults() {
    try {
      const results = await API.evaluateQuiz(this.userAnswers, this.quiz);
      this.showSummary(results);
    } catch (e) {
      console.error("Evaluation error:", e);
      // Client-side fallback evaluation
      let correctCount = 0;
      this.quiz.forEach(q => {
        if (this.userAnswers[String(q.id)] === q.correct_option) {
          correctCount++;
        }
      });
      const scorePct = Math.round((correctCount / this.quiz.length) * 100);
      this.showSummary({
        score: correctCount,
        total: this.quiz.length,
        percentage: scorePct,
        grade_label: scorePct >= 80 ? "🎉 Outstanding Mastery!" : "👍 Good Effort!",
        breakdown: this.quiz.map(q => ({
          question_id: q.id,
          question: q.question,
          selected_option: this.userAnswers[String(q.id)],
          correct_option: q.correct_option,
          is_correct: this.userAnswers[String(q.id)] === q.correct_option,
          explanation: q.explanation,
          concept_tested: q.concept_tested
        })),
        study_recommendations: [
          "Review the Key Concepts flashcards to reinforce core terms.",
          "Re-read the high-yield bullet points in the Revision Notes tab."
        ]
      });
    }
  }

  showSummary(results) {
    this.isEvaluated = true;
    
    // Breakdown items HTML
    const breakdownHtml = (results.breakdown || []).map((b, idx) => `
      <div style="background: var(--bg-surface); border: 1px solid ${b.is_correct ? 'var(--success-border)' : 'var(--danger-border)'}; border-radius: var(--radius-md); padding: 1rem; margin-bottom: 0.75rem; text-align: left;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
          <span style="font-weight: 700; font-size: 0.85rem; color: ${b.is_correct ? 'var(--success)' : 'var(--danger)'};">
            ${b.is_correct ? '✓ Question ' + (idx + 1) + ' Correct' : '✕ Question ' + (idx + 1) + ' Incorrect'}
          </span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${this.escapeHtml(b.concept_tested)}</span>
        </div>
        <p style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">${this.escapeHtml(b.question)}</p>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.4rem;">
          Your Answer: <strong>Option ${b.selected_option || 'None'}</strong> | Correct: <strong>Option ${b.correct_option}</strong>
        </p>
        <p style="font-size: 0.82rem; color: var(--text-muted);">${this.escapeHtml(b.explanation)}</p>
      </div>
    `).join("");

    const recsHtml = (results.study_recommendations || []).map(r => `
      <li>${this.escapeHtml(r)}</li>
    `).join("");

    this.container.innerHTML = `
      <div class="quiz-summary-card">
        <div class="score-circle">
          <span class="score-num">${results.score}</span>
          <span class="score-max">/ ${results.total}</span>
        </div>

        <h2 class="summary-grade">${this.escapeHtml(results.grade_label)}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
          You achieved a score of <strong>${results.percentage}%</strong> on this lecture mastery quiz.
        </p>

        <div class="recommendations-box">
          <div class="recommendations-title">💡 Tailored Revision Recommendations</div>
          <ul class="recommendations-list">
            ${recsHtml}
          </ul>
        </div>

        <div style="margin: 2rem 0; text-align: left;">
          <h3 style="font-size: 1.1rem; margin-bottom: 1rem;">Question Review Breakdown</h3>
          ${breakdownHtml}
        </div>

        <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 2rem;">
          <button class="btn btn-primary" id="btn-retake-quiz">
            🔄 Retake Quiz
          </button>
        </div>
      </div>
    `;

    const retakeBtn = this.container.querySelector("#btn-retake-quiz");
    if (retakeBtn) {
      retakeBtn.addEventListener("click", () => {
        this.loadQuiz(this.quiz);
      });
    }
  }

  escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
