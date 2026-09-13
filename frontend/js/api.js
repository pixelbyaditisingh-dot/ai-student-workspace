/**
 * Learnly API Client Module
 * Communicates with backend endpoints for text extraction, AI study pack synthesis, and quiz evaluation.
 */
const API = {
  getApiKey() {
    return localStorage.getItem("learnly_gemini_api_key") || "";
  },

  setApiKey(key) {
    if (!key || !key.trim()) {
      localStorage.removeItem("learnly_gemini_api_key");
    } else {
      localStorage.setItem("learnly_gemini_api_key", key.trim());
    }
  },

  async checkHealth() {
    try {
      const res = await fetch("/api/health");
      return await res.json();
    } catch (e) {
      console.warn("API health check failed:", e);
      return { status: "offline", gemini_env_configured: false };
    }
  },

  async processFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    const apiKey = this.getApiKey();
    const headers = {};
    if (apiKey) {
      headers["X-Gemini-API-Key"] = apiKey;
    }

    const response = await fetch("/api/process", {
      method: "POST",
      headers: headers,
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Failed to process document." }));
      throw new Error(errorData.detail || "Server error occurred during processing.");
    }

    return await response.json();
  },

  async extractText(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/extract-text", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Failed to extract text from file." }));
      throw new Error(errorData.detail || "Server error extracting text.");
    }

    return await response.json();
  },

  async generateFromText(text, filename = "lecture_notes.txt") {
    const apiKey = this.getApiKey();
    const headers = { "Content-Type": "application/json" };
    if (apiKey) {
      headers["X-Gemini-API-Key"] = apiKey;
    }

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ text, filename })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Failed to synthesize study pack." }));
      throw new Error(errorData.detail || "Server error generating study notes.");
    }

    return await response.json();
  },

  async processSample(sampleId) {
    const apiKey = this.getApiKey();
    const headers = { "Content-Type": "application/json" };
    if (apiKey) {
      headers["X-Gemini-API-Key"] = apiKey;
    }

    const response = await fetch("/api/process-sample", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ sample_id: sampleId })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Failed to load sample lecture." }));
      throw new Error(errorData.detail || "Server error occurred while loading sample.");
    }

    return await response.json();
  },

  async evaluateQuiz(answers, quiz) {
    const response = await fetch("/api/quiz/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, quiz })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Failed to evaluate quiz." }));
      throw new Error(errorData.detail || "Server error evaluating quiz.");
    }

    return await response.json();
  },

  async getNotes() {
    try {
      const response = await fetch("/api/notes");
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn("Could not fetch notes from server:", e);
    }
    return { success: false, lectures: [] };
  },

  async getQuizHistory() {
    try {
      const response = await fetch("/api/quiz/history");
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn("Could not fetch quiz history from server:", e);
    }
    return { success: false, history: [] };
  }
};
