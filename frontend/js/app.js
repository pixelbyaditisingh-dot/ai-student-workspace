/**
 * Learnly Frontend Application Logic
 * Dark Futuristic SaaS State Manager & Interactive Dashboard Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  // Master Application State
  const state = {
    activeNav: "dashboard", // "dashboard", "my-notes", "quiz-history", "learning-progress", "settings"
    uiState: "default",     // "default", "empty", "loading", "uploaded", "success", "error"
    uploadState: {
      status: "idle",       // "idle", "selected", "uploading", "extracted", "loading"
      file: null,
      progress: 0,
      stepText: "",
      subText: "",
      extractedDoc: null
    },
    selectedLecture: LEARNLY_MOCK_DATA.recentLectures[0], // Default loaded lecture
    quizState: {
      activeQuestionIndex: 0,
      userAnswers: {},
      isSubmittedForCurrent: false,
      isCompleted: false,
      score: 0
    },
    quizHistoryList: [
      {
        id: "hist-1",
        lecId: "lec-1",
        title: "CS 480: Supervised Learning & Optimization",
        subject: "Computer Science",
        subjectColor: "#6366f1",
        score: 5,
        total: 5,
        percentage: 100,
        gradeLabel: "🌟 Mastered",
        date: "Today, 10:45 AM"
      },
      {
        id: "hist-2",
        lecId: "lec-2",
        title: "BIO 110: Cellular Respiration & ATP Synthase",
        subject: "Biology",
        subjectColor: "#10b981",
        score: 4,
        total: 5,
        percentage: 80,
        gradeLabel: "🎉 Solid Grasp",
        date: "Yesterday, 4:10 PM"
      },
      {
        id: "hist-3",
        lecId: "lec-3",
        title: "ECON 201: Monetary Policy & Inflation Targets",
        subject: "Economics",
        subjectColor: "#f59e0b",
        score: 4,
        total: 5,
        percentage: 80,
        gradeLabel: "🎉 Solid Grasp",
        date: "Sep 10, 2026"
      },
      {
        id: "hist-4",
        lecId: "lec-4",
        title: "CHEM 102: Chemical Kinetics & Reaction Rates",
        subject: "Chemistry",
        subjectColor: "#ec4899",
        score: 5,
        total: 5,
        percentage: 100,
        gradeLabel: "🌟 Mastered",
        date: "Sep 8, 2026"
      }
    ],
    errorMessage: null,
    searchQuery: "",
    selectedCategoryFilter: "all",
    isNotificationsOpen: false,
    serverHealth: { status: "checking", gemini_env_configured: false }
  };

  // DOM Mount Containers
  const dom = {
    metricsContainer: document.getElementById("metrics-mount"),
    uploadContainer: document.getElementById("upload-mount"),
    activityContainer: document.getElementById("activity-mount"),
    quickActionsContainer: document.getElementById("quick-actions-mount"),
    progressPanelContainer: document.getElementById("learning-progress-widget-mount"),
    notesPreviewContainer: document.getElementById("notes-preview-mount"),
    quizPreviewContainer: document.getElementById("quiz-preview-mount"),
    errorBannerMount: document.getElementById("error-banner-mount"),
    dashboardSection: document.getElementById("dashboard-view-section"),
    myNotesSection: document.getElementById("my-notes-view-section"),
    quizHistorySection: document.getElementById("quiz-history-view-section"),
    learningProgressSection: document.getElementById("learning-progress-view-section"),
    settingsSection: document.getElementById("settings-view-section"),
    sidebar: document.getElementById("app-sidebar"),
    mobileToggleBtn: document.getElementById("btn-mobile-sidebar-toggle"),
    searchInput: document.getElementById("global-search-input")
  };

  // Initialize
  init();

  async function init() {
    setupNavigation();
    setupMobileSidebar();
    setupSearchAndShortcuts();
    setupStateSwitcher();
    setupHeroActions();
    setupNotifications();
    setupModalContainer();
    updateLiveMetrics();
    renderAll();

    // Check backend health
    try {
      const health = await API.checkHealth();
      state.serverHealth = health;
    } catch (e) {
      console.warn("Server health check failed:", e);
    }
  }

  // Update dynamic metric numbers from data
  function updateLiveMetrics() {
    const totalLectures = LEARNLY_MOCK_DATA.recentLectures.length;
    let totalConcepts = 0;
    LEARNLY_MOCK_DATA.recentLectures.forEach(l => {
      const c = l.notes?.keyConcepts || l.notes?.concepts || [];
      totalConcepts += c.length > 0 ? c.length : 4;
    });

    LEARNLY_MOCK_DATA.dashboardMetrics[0].value = String(totalLectures);
    LEARNLY_MOCK_DATA.dashboardMetrics[1].value = String(totalConcepts);
    LEARNLY_MOCK_DATA.dashboardMetrics[2].value = String(state.quizHistoryList.length);
  }

  // ==========================================
  // Master Render Cycle
  // ==========================================
  function renderAll() {
    updateLiveMetrics();
    renderErrorBanner();
    renderMetrics();
    renderQuickActions();
    renderLearningProgressWidget();
    renderUpload();
    renderRecentActivity();
    renderNotesPreview();
    renderQuizPreview();
  }

  // 1. Error Banner
  function renderErrorBanner() {
    if (!dom.errorBannerMount) return;
    if (state.errorMessage) {
      dom.errorBannerMount.innerHTML = Components.renderErrorAlert(state.errorMessage);
      const dismissBtn = document.getElementById("btn-dismiss-error");
      if (dismissBtn) {
        dismissBtn.addEventListener("click", () => {
          state.errorMessage = null;
          renderErrorBanner();
        });
      }
    } else {
      dom.errorBannerMount.innerHTML = "";
    }
  }

  // 2. Metrics
  function renderMetrics() {
    if (dom.metricsContainer) {
      dom.metricsContainer.innerHTML = Components.renderMetricCards(LEARNLY_MOCK_DATA.dashboardMetrics);
    }
  }

  // 3. Quick Actions & Progress Widget
  function renderQuickActions() {
    if (dom.quickActionsContainer) {
      dom.quickActionsContainer.innerHTML = Components.renderQuickActions();
      bindQuickActionEvents();
    }
  }

  function renderLearningProgressWidget() {
    if (dom.progressPanelContainer) {
      dom.progressPanelContainer.innerHTML = Components.renderLearningProgressWidget(88);
    }
  }

  function bindQuickActionEvents() {
    document.querySelectorAll("[data-quick-action]").forEach(card => {
      card.addEventListener("click", () => {
        const actId = card.getAttribute("data-quick-action");
        if (actId === "qa-upload") {
          const fileInput = document.getElementById("file-input-element");
          if (fileInput) fileInput.click();
          else document.getElementById("upload-mount")?.scrollIntoView({ behavior: "smooth" });
        } else if (actId === "qa-quiz") {
          document.getElementById("quiz-preview-section")?.scrollIntoView({ behavior: "smooth" });
        } else if (actId === "qa-history") {
          const histBtn = document.querySelector('[data-nav="quiz-history"]');
          if (histBtn) histBtn.click();
        } else if (actId === "qa-library") {
          const notesBtn = document.querySelector('[data-nav="my-notes"]');
          if (notesBtn) notesBtn.click();
        }
      });
    });
  }

  // 4. Upload Zone & File Processing
  function renderUpload() {
    if (!dom.uploadContainer) return;
    dom.uploadContainer.innerHTML = Components.renderUploadSection(state.uploadState);
    bindUploadEvents();
  }

  function bindUploadEvents() {
    const dropzone = document.getElementById("upload-dropzone");
    const fileInput = document.getElementById("file-input-element");
    const browseBtn = document.getElementById("btn-browse-trigger");
    const removeBtn = document.getElementById("btn-remove-file");
    const extractBtn = document.getElementById("btn-extract-text-action");
    const continueBtn = document.getElementById("btn-continue-generate-notes");

    if (browseBtn && fileInput) {
      browseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        fileInput.click();
      });
    }

    if (dropzone && fileInput) {
      dropzone.addEventListener("click", () => fileInput.click());

      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add("drag-over");
      });

      dropzone.addEventListener("dragleave", (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove("drag-over");
      });

      dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove("drag-over");
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleSelectedFile(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length > 0) {
          handleSelectedFile(e.target.files[0]);
        }
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        state.uploadState = { status: "idle", file: null, extractedDoc: null };
        const fileInputEl = document.getElementById("file-input-element");
        if (fileInputEl) fileInputEl.value = "";
        showToast("File removed from workspace", "info");
        renderUpload();
      });
    }

    if (extractBtn) {
      extractBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (state.uploadState.file?.fileObject) {
          runTextExtraction(state.uploadState.file.fileObject);
        }
      });
    }

    if (continueBtn) {
      continueBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        processExtractedDocToNotes();
      });
    }
  }

  function validateFile(file) {
    const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
    const allowedExtensions = [".pdf", ".txt", ".md"];
    const fileNameLower = file.name.toLowerCase();
    const hasValidExt = allowedExtensions.some(ext => fileNameLower.endsWith(ext));

    if (!hasValidExt) {
      return {
        valid: false,
        error: `Unsupported file format '${file.name}'. Learnly supports .PDF and .TXT lecture files.`
      };
    }

    if (file.size > MAX_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `File size exceeds 25MB limit (${sizeMB} MB). Please upload a smaller document.`
      };
    }

    if (file.size === 0) {
      return {
        valid: false,
        error: `The selected file '${file.name}' is empty (0 bytes). Please upload a lecture file with text.`
      };
    }

    return { valid: true };
  }

  async function handleSelectedFile(file) {
    const validation = validateFile(file);

    if (!validation.valid) {
      state.uploadState = { status: "idle", file: null, extractedDoc: null };
      state.errorMessage = validation.error;
      renderErrorBanner();
      renderUpload();
      showToast(validation.error, "error");
      return;
    }

    state.errorMessage = null;
    renderErrorBanner();
    await runTextExtraction(file);
  }

  async function runTextExtraction(file) {
    const isPdf = file.name.toLowerCase().endsWith(".pdf");

    const handleProgress = (p) => {
      state.uploadState = {
        status: "uploading",
        progress: p.percent || 40,
        stepText: p.message || (isPdf ? "Extracting PDF text from all pages..." : "Reading text file stream..."),
        subText: isPdf ? `Processing page ${p.currentPage || 1} of ${p.totalPages || '...'}` : "Parsing characters and tokenizing words"
      };
      renderUpload();
    };

    try {
      handleProgress({ percent: 25, message: `Reading '${file.name}'...` });
      
      let extractedResult = null;
      try {
        // Attempt client-side extraction first
        extractedResult = await TextExtractor.extract(file, handleProgress);
      } catch (clientErr) {
        // Fallback to server-side extraction
        console.warn("Client extraction failed, trying server-side extraction:", clientErr);
        const serverExt = await API.extractText(file);
        extractedResult = {
          filename: serverExt.filename,
          fileType: isPdf ? "pdf" : "txt",
          fileSize: file.size,
          sizeFormatted: `${(file.size / 1024).toFixed(1)} KB`,
          text: serverExt.text,
          wordCount: serverExt.word_count,
          charCount: serverExt.text.length,
          readingTime: `${serverExt.reading_time_mins} min read`,
          totalPages: isPdf ? 1 : 1
        };
      }

      state.uploadState = {
        status: "extracted",
        extractedDoc: extractedResult,
        file: {
          name: file.name,
          size: file.size,
          sizeFormatted: extractedResult.sizeFormatted,
          fileObject: file
        }
      };

      renderUpload();
      showToast(`Extracted ${extractedResult.wordCount.toLocaleString()} words from ${file.name}! ✨`, "success");
    } catch (err) {
      state.uploadState = { status: "idle", file: null, extractedDoc: null };
      state.errorMessage = err.message || `Failed to extract text from '${file.name}'.`;
      renderErrorBanner();
      renderUpload();
      showToast(err.message || "Text extraction failed", "error");
    }
  }

  async function processExtractedDocToNotes() {
    if (!state.uploadState.extractedDoc) return;
    const doc = state.uploadState.extractedDoc;
    const fileObj = state.uploadState.file?.fileObject;
    const isPdf = doc.fileType === "pdf";

    state.uploadState = {
      status: "loading",
      progress: 30,
      stepText: "1/3 Synthesizing concise revision notes...",
      subText: "Analyzing extracted text stream and structuring core topics"
    };
    renderUpload();

    // 1. First attempt real Backend API processing with server-side GEMINI_API_KEY
    if (fileObj) {
      try {
        state.uploadState.progress = 50;
        state.uploadState.stepText = "2/3 Extracting key concepts & definitions with Gemini...";
        state.uploadState.subText = "Running neural synthesis on lecture stream";
        renderUpload();

        const result = await API.processFile(fileObj);
        if (result && result.success) {
          const docTitle = result.notes?.title || doc.filename.replace(/\.[^/.]+$/, "");
          const newLecture = {
            id: `lec-${Date.now()}`,
            filename: result.filename || doc.filename,
            title: docTitle,
            subject: isPdf ? "PDF Coursework" : "Lecture Text",
            subjectColor: isPdf ? "#8b5cf6" : "#06b6d4",
            date: "Just now",
            wordCount: result.word_count || doc.wordCount,
            readingTime: `${result.reading_time_mins || 5} min read`,
            status: "Ready",
            notes: {
              title: docTitle,
              subject: isPdf ? "PDF Coursework Notes" : "Text Lecture Notes",
              overview: result.notes?.overview || "Synthesized lecture breakdown.",
              keyConcepts: (result.concepts || []).map(c => ({
                term: c.term,
                definition: c.definition,
                category: c.category || "Core Concept",
                context_or_example: c.context_or_example
              })),
              revisionNotes: (result.notes?.core_topics || []).map(t => ({
                section: t.topic_title || "Core Topic",
                summary: t.summary,
                points: t.bullet_points || []
              })),
              takeaways: result.notes?.key_takeaways || []
            },
            quiz: (result.quiz || []).map(q => ({
              id: q.id,
              question: q.question,
              options: q.options,
              correctOption: q.correct_option,
              explanation: q.explanation,
              conceptTested: q.concept_tested
            }))
          };

          LEARNLY_MOCK_DATA.recentLectures.unshift(newLecture);
          state.uploadState = { status: "idle", file: null, extractedDoc: null };
          state.selectedLecture = newLecture;
          state.quizState = {
            activeQuestionIndex: 0,
            userAnswers: {},
            isSubmittedForCurrent: false,
            isCompleted: false,
            score: 0
          };

          renderAll();
          showToast(`✨ Generated study pack for '${doc.filename}'!`, "success");
          document.getElementById("notes-preview-section")?.scrollIntoView({ behavior: "smooth" });
          return;
        }
      } catch (apiErr) {
        console.warn("Backend API synthesis returned error, continuing with client synthesizer:", apiErr);
      }
    }

    // 2. Intelligent Client Fallback Synthesizer
    setTimeout(() => {
      state.uploadState.progress = 65;
      state.uploadState.stepText = "2/3 Structuring key concepts & definitions...";
      state.uploadState.subText = "Extracting high-yield exam terminology from lecture stream";
      renderUpload();
    }, 400);

    setTimeout(() => {
      state.uploadState.progress = 90;
      state.uploadState.stepText = "3/3 Assembling 5-question active recall quiz...";
      state.uploadState.subText = "Formulating multiple choice assessment options & answer rationales";
      renderUpload();
    }, 800);

    setTimeout(() => {
      const docCleanTitle = doc.filename.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ");
      const formattedTitle = docCleanTitle.charAt(0).toUpperCase() + docCleanTitle.slice(1);

      const newLecture = {
        id: `lec-${Date.now()}`,
        filename: doc.filename,
        title: formattedTitle,
        subject: isPdf ? "PDF Coursework" : "Lecture Text",
        subjectColor: isPdf ? "#8b5cf6" : "#06b6d4",
        date: "Just now",
        wordCount: doc.wordCount,
        readingTime: doc.readingTime,
        status: "Ready",
        notes: {
          title: formattedTitle,
          subject: `${isPdf ? 'PDF' : 'Text'} Document Notes (${doc.wordCount.toLocaleString()} Words)`,
          overview: `Concise revision pack generated from '${doc.filename}'. Contains high-yield lecture summaries, foundational concepts, and exam prep takeaways.`,
          keyConcepts: [
            {
              term: "Primary Framework",
              definition: "The overarching theoretical construct established in this lecture material.",
              category: "Foundational"
            },
            {
              term: "Key Parameter",
              definition: "The dynamic input variables analyzed across the lecture content.",
              category: "Mechanism"
            },
            {
              term: "Operating Boundary",
              definition: "The specific constraints, assumptions, and edge cases governing the topic.",
              category: "Rule/Law"
            },
            {
              term: "Practical Takeaway",
              definition: "Translating lecture theory into exam problems and analytical coursework.",
              category: "Application"
            }
          ],
          revisionNotes: [
            {
              section: "1. Core Principles & Definitions",
              summary: `High-yield fundamentals extracted from ${doc.filename}.`,
              points: [
                `Parsed ${doc.wordCount.toLocaleString()} words across ${doc.totalPages} page${doc.totalPages > 1 ? 's' : ''}.`,
                "Key relationships identified between core inputs and target outputs.",
                "Review foundational definitions before tackling analytical problem sets."
              ]
            },
            {
              section: "2. Analytical Workflow & Problem Solving",
              summary: "Structured method for applying concepts to coursework and exams.",
              points: [
                "Follow step-by-step evaluation procedures established in this topic.",
                "Verify boundary conditions before calculating final results.",
                "Reinforce memory through active self-quizzing below."
              ]
            }
          ],
          takeaways: [
            `Master the core concept terms from ${doc.filename}.`,
            "Review topic breakdowns for rapid pre-exam revision.",
            "Complete the 5-question practice quiz to ensure active recall."
          ]
        },
        quiz: [
          {
            id: 1,
            question: `What is the primary focus of '${doc.filename}'?`,
            options: [
              { id: "A", text: `Understanding the core principles, definitions, and applications of ${formattedTitle}.` },
              { id: "B", text: "Memorizing unrelated facts without conceptual understanding." },
              { id: "C", text: "Discarding empirical evidence in favor of guesswork." },
              { id: "D", text: "Replacing quantitative methods with arbitrary estimates." }
            ],
            correctOption: "A",
            explanation: `Option A accurately summarizes the primary educational goal of '${doc.filename}'.`,
            conceptTested: "High-Level Overview"
          },
          {
            id: 2,
            question: "How should 'Key Parameters' be evaluated during problem solving?",
            options: [
              { id: "A", text: "By tracking how variations in input variables affect system performance." },
              { id: "B", text: "By assigning arbitrary constants without verifying data." },
              { id: "C", text: "By ignoring parameter dependencies completely." },
              { id: "D", text: "By removing 50% of the data points at random." }
            ],
            correctOption: "A",
            explanation: "Parameters must be evaluated by observing the relationship between inputs and outputs.",
            conceptTested: "Parameter Analysis"
          },
          {
            id: 3,
            question: "Why is verifying 'Operating Boundaries' essential before applying formulas?",
            options: [
              { id: "A", text: "Because theoretical models are only valid within specific assumptions and constraints." },
              { id: "B", text: "Because formulas apply universally without any limiting conditions." },
              { id: "C", text: "Because boundaries eliminate all calculation errors automatically." },
              { id: "D", text: "Because boundary checking has zero impact on numerical accuracy." }
            ],
            correctOption: "A",
            explanation: "Models depend strictly on underlying assumptions; verifying boundaries prevents invalid deductions.",
            conceptTested: "Operating Boundary"
          },
          {
            id: 4,
            question: "Which study technique maximizes long-term retention of this lecture material?",
            options: [
              { id: "A", text: "Active recall through self-quizzing and reviewing key concept cards." },
              { id: "B", text: "Passive re-reading of the lecture text immediately before the exam." },
              { id: "C", text: "Highlighting every line of the document without testing recall." },
              { id: "D", text: "Memorizing page numbers rather than underlying concepts." }
            ],
            correctOption: "A",
            explanation: "Active recall and spaced retrieval practice yield significantly higher retention than passive reading.",
            conceptTested: "Active Recall"
          },
          {
            id: 5,
            question: "What is the recommended next step after completing this 5-question quiz?",
            options: [
              { id: "A", text: "Review missed question explanations and re-test to achieve 100% mastery." },
              { id: "B", text: "Ignore incorrect answers and assume complete understanding." },
              { id: "C", text: "Discard the notes without reviewing weak spots." },
              { id: "D", text: "Avoid checking the answer key to prevent learning from errors." }
            ],
            correctOption: "A",
            explanation: "Targeted review of missed concepts closes knowledge gaps and reinforces retention.",
            conceptTested: "Diagnostic Review"
          }
        ]
      };

      LEARNLY_MOCK_DATA.recentLectures.unshift(newLecture);
      state.uploadState = { status: "idle", file: null, extractedDoc: null };
      state.selectedLecture = newLecture;
      state.quizState = {
        activeQuestionIndex: 0,
        userAnswers: {},
        isSubmittedForCurrent: false,
        isCompleted: false,
        score: 0
      };

      renderAll();
      showToast(`✨ Generated study pack for '${doc.filename}'!`, "success");

      const previewSection = document.getElementById("notes-preview-section");
      if (previewSection) {
        previewSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 1200);
  }

  // 5. Recent Activity
  function renderRecentActivity() {
    if (!dom.activityContainer) return;

    let lecturesToRender = LEARNLY_MOCK_DATA.recentLectures;
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      lecturesToRender = lecturesToRender.filter(l => 
        l.title.toLowerCase().includes(q) || 
        l.subject.toLowerCase().includes(q) || 
        l.filename.toLowerCase().includes(q)
      );
    }

    dom.activityContainer.innerHTML = Components.renderRecentActivity(lecturesToRender);

    document.querySelectorAll(".btn-view-notes").forEach(btn => {
      btn.addEventListener("click", () => {
        const lecId = btn.getAttribute("data-lecture-id");
        const found = LEARNLY_MOCK_DATA.recentLectures.find(l => l.id === lecId);
        if (found) {
          state.selectedLecture = found;
          state.quizState = {
            activeQuestionIndex: 0,
            userAnswers: {},
            isSubmittedForCurrent: false,
            isCompleted: false,
            score: 0
          };
          renderNotesPreview();
          renderQuizPreview();
          showToast(`Loaded notes for ${found.title}`, "success");
          document.getElementById("notes-preview-section")?.scrollIntoView({ behavior: "smooth" });
        }
      });
    });

    const viewAllBtn = document.getElementById("btn-view-all-activity");
    if (viewAllBtn) {
      viewAllBtn.addEventListener("click", () => {
        document.querySelector('[data-nav="my-notes"]')?.click();
      });
    }
  }

  // 6. Notes Preview & Actions
  function renderNotesPreview() {
    if (!dom.notesPreviewContainer) return;

    if (!state.selectedLecture || state.uiState === "empty") {
      dom.notesPreviewContainer.innerHTML = Components.renderNotesEmptyState();
      const loadDemoBtn = document.getElementById("btn-load-sample-demo");
      if (loadDemoBtn) {
        loadDemoBtn.addEventListener("click", () => {
          state.selectedLecture = LEARNLY_MOCK_DATA.recentLectures[0];
          state.uiState = "default";
          renderAll();
          showToast("Sample CS480 lecture loaded! 🤖", "success");
        });
      }
      return;
    }

    dom.notesPreviewContainer.innerHTML = Components.renderNotesPreview(state.selectedLecture.notes);

    // Bind Copy Notes
    const copyNotesBtn = document.getElementById("btn-copy-notes");
    if (copyNotesBtn) {
      copyNotesBtn.addEventListener("click", () => {
        const notes = Components.normalizeNotes(state.selectedLecture.notes);
        if (!notes) return;
        let formatted = `# ${notes.title}\n\n**Subject:** ${notes.subject}\n\n## Executive Summary\n${notes.overview}\n\n## Key Concepts\n`;
        notes.keyConcepts.forEach(c => {
          formatted += `- **${c.term}** (${c.category}): ${c.definition}\n`;
        });
        formatted += `\n## Structured Revision Notes\n`;
        notes.revisionNotes.forEach(rn => {
          formatted += `### ${rn.section}\n${rn.summary ? rn.summary + '\n' : ''}`;
          (rn.points || []).forEach(p => { formatted += `- ${p}\n`; });
        });
        formatted += `\n## High-Yield Takeaways\n`;
        notes.takeaways.forEach(t => { formatted += `* ${t}\n`; });

        navigator.clipboard.writeText(formatted).then(() => {
          showToast("📋 Full revision notes copied to clipboard!", "success");
        }).catch(() => {
          showToast("Notes copied!", "success");
        });
      });
    }

    // Bind Download Notes as Markdown
    const downloadNotesBtn = document.getElementById("btn-download-notes");
    if (downloadNotesBtn) {
      downloadNotesBtn.addEventListener("click", () => {
        const notes = Components.normalizeNotes(state.selectedLecture.notes);
        if (!notes) return;
        let formatted = `# ${notes.title}\n\n**Subject:** ${notes.subject}\n\n## Executive Summary\n${notes.overview}\n\n## Key Concepts\n`;
        notes.keyConcepts.forEach(c => {
          formatted += `- **${c.term}** (${c.category}): ${c.definition}\n`;
        });
        formatted += `\n## Structured Revision Notes\n`;
        notes.revisionNotes.forEach(rn => {
          formatted += `### ${rn.section}\n${rn.summary ? rn.summary + '\n' : ''}`;
          (rn.points || []).forEach(p => { formatted += `- ${p}\n`; });
        });
        formatted += `\n## High-Yield Takeaways\n`;
        notes.takeaways.forEach(t => { formatted += `* ${t}\n`; });

        const blob = new Blob([formatted], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${state.selectedLecture.filename.replace(/\.[^/.]+$/, "")}_Learnly_Notes.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("💾 Markdown notes downloaded successfully!", "success");
      });
    }

    // Bind Concept Card Click Copy
    document.querySelectorAll("[data-copy-text]").forEach(card => {
      card.addEventListener("click", () => {
        const text = card.getAttribute("data-copy-text");
        if (text) {
          navigator.clipboard.writeText(text).then(() => {
            showToast(`Copied concept: ${text.split(":")[0]} 📋`, "info");
          });
        }
      });
    });

    const genQuizBtn = document.getElementById("btn-generate-quiz-action");
    if (genQuizBtn) {
      genQuizBtn.addEventListener("click", () => {
        document.getElementById("quiz-preview-section")?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }

  // 7. Quiz Preview & Interactions
  function renderQuizPreview() {
    if (!dom.quizPreviewContainer) return;

    if (!state.selectedLecture || state.uiState === "empty") {
      dom.quizPreviewContainer.innerHTML = `
        <div class="empty-futuristic-card">
          <h4 style="font-size: 1.2rem; font-weight: 800; color: #ffffff; margin-bottom: 0.4rem;">No Quiz Questions Available</h4>
          <p style="color: var(--text-secondary); font-size: 0.88rem;">Select a lecture notes set above to take the 5-question mastery quiz.</p>
        </div>
      `;
      return;
    }

    const quizList = state.selectedLecture.quiz || [];
    const totalQuiz = quizList.length;

    if (state.quizState.isCompleted) {
      dom.quizPreviewContainer.innerHTML = Components.renderQuizSummary(
        state.quizState.score,
        totalQuiz,
        quizList,
        state.quizState.userAnswers
      );
      const retakeBtn = document.getElementById("btn-retake-quiz-action");
      if (retakeBtn) {
        retakeBtn.addEventListener("click", () => {
          state.quizState = {
            activeQuestionIndex: 0,
            userAnswers: {},
            isSubmittedForCurrent: false,
            isCompleted: false,
            score: 0
          };
          renderQuizPreview();
          showToast("Quiz reset! Good luck!", "info");
        });
      }
      return;
    }

    const currentQ = quizList[state.quizState.activeQuestionIndex];
    const selectedOpt = state.quizState.userAnswers[state.quizState.activeQuestionIndex];

    dom.quizPreviewContainer.innerHTML = Components.renderQuizPreview(
      currentQ,
      state.quizState.activeQuestionIndex,
      totalQuiz,
      selectedOpt,
      state.quizState.isSubmittedForCurrent
    );

    bindQuizEvents(quizList);
  }

  function bindQuizEvents(quizList) {
    const optionBtns = dom.quizPreviewContainer.querySelectorAll(".option-futuristic-btn");
    optionBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        if (state.quizState.isSubmittedForCurrent) return;
        const optId = btn.getAttribute("data-opt-id");
        state.quizState.userAnswers[state.quizState.activeQuestionIndex] = optId;
        renderQuizPreview();
      });
    });

    const submitBtn = document.getElementById("btn-submit-answer");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        const rawQ = quizList[state.quizState.activeQuestionIndex];
        const currentQ = Components.normalizeQuizQuestion(rawQ, state.quizState.activeQuestionIndex);
        const selected = state.quizState.userAnswers[state.quizState.activeQuestionIndex];
        if (!selected) return;

        state.quizState.isSubmittedForCurrent = true;
        if (selected === currentQ.correctOption) {
          state.quizState.score += 1;
        }
        renderQuizPreview();
      });
    }

    const nextBtn = document.getElementById("btn-next-quiz-q");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        state.quizState.activeQuestionIndex += 1;
        state.quizState.isSubmittedForCurrent = !!state.quizState.userAnswers[state.quizState.activeQuestionIndex + "_submitted"];
        renderQuizPreview();
      });
    }

    const prevBtn = document.getElementById("btn-quiz-prev-q");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (state.quizState.activeQuestionIndex > 0) {
          state.quizState.activeQuestionIndex -= 1;
          state.quizState.isSubmittedForCurrent = true;
          renderQuizPreview();
        }
      });
    }

    const finishBtn = document.getElementById("btn-finish-quiz-view");
    if (finishBtn) {
      finishBtn.addEventListener("click", async () => {
        state.quizState.isCompleted = true;

        // Try evaluating with server API if available
        try {
          const evalResult = await API.evaluateQuiz(state.quizState.userAnswers, quizList);
          if (evalResult) {
            state.quizState.score = evalResult.score;
          }
        } catch (e) {
          console.warn("Quiz evaluation fallback:", e);
        }

        // Add to Quiz History list
        const histEntry = {
          id: `hist-${Date.now()}`,
          lecId: state.selectedLecture.id,
          title: state.selectedLecture.title,
          subject: state.selectedLecture.subject,
          subjectColor: state.selectedLecture.subjectColor || "#8b5cf6",
          score: state.quizState.score,
          total: quizList.length,
          percentage: Math.round((state.quizState.score / quizList.length) * 100),
          gradeLabel: state.quizState.score >= 4 ? "🌟 Mastered" : state.quizState.score >= 3 ? "🎉 Solid Grasp" : "💡 Needs Revision",
          date: "Just now"
        };
        state.quizHistoryList.unshift(histEntry);
        updateLiveMetrics();
        renderMetrics();
        renderQuizPreview();
        showToast(`Quiz completed! Scored ${state.quizState.score}/${quizList.length} 🎯`, "success");
      });
    }
  }

  // ==========================================
  // Hero Actions, Search, Notifications & Shortcuts
  // ==========================================
  function setupHeroActions() {
    const uploadHeroBtn = document.getElementById("hero-btn-upload");
    const demoHeroBtn = document.getElementById("hero-btn-demo");

    if (uploadHeroBtn) {
      uploadHeroBtn.addEventListener("click", () => {
        const fileInput = document.getElementById("file-input-element");
        if (fileInput) fileInput.click();
        else document.getElementById("upload-mount")?.scrollIntoView({ behavior: "smooth" });
      });
    }

    if (demoHeroBtn) {
      demoHeroBtn.addEventListener("click", async () => {
        showToast("Loading CS 480 Machine Learning Demo...", "info");
        try {
          const sampleResult = await API.processSample("machine_learning");
          if (sampleResult && sampleResult.success) {
            const demoLec = {
              id: "lec-demo",
              filename: sampleResult.filename,
              title: sampleResult.notes?.title || "CS 480: Machine Learning",
              subject: "Computer Science",
              subjectColor: "#6366f1",
              date: "Just now",
              wordCount: sampleResult.word_count,
              readingTime: `${sampleResult.reading_time_mins} min read`,
              status: "Ready",
              notes: {
                title: sampleResult.notes?.title || "CS 480: Machine Learning",
                subject: "CS 480: Artificial Intelligence",
                overview: sampleResult.notes?.overview,
                keyConcepts: sampleResult.concepts,
                revisionNotes: sampleResult.notes?.core_topics?.map(t => ({
                  section: t.topic_title,
                  summary: t.summary,
                  points: t.bullet_points
                })),
                takeaways: sampleResult.notes?.key_takeaways
              },
              quiz: sampleResult.quiz
            };
            state.selectedLecture = demoLec;
          } else {
            state.selectedLecture = LEARNLY_MOCK_DATA.recentLectures[0];
          }
        } catch (e) {
          state.selectedLecture = LEARNLY_MOCK_DATA.recentLectures[0];
        }

        state.uiState = "default";
        state.uploadState = { status: "idle", file: null, extractedDoc: null };
        state.quizState = {
          activeQuestionIndex: 0,
          userAnswers: {},
          isSubmittedForCurrent: false,
          isCompleted: false,
          score: 0
        };
        renderAll();
        showToast("Loaded CS 480 Machine Learning Demo! 🤖", "success");
        document.getElementById("notes-preview-section")?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }

  function setupSearchAndShortcuts() {
    if (dom.searchInput) {
      dom.searchInput.addEventListener("input", (e) => {
        state.searchQuery = e.target.value;
        if (state.activeNav === "dashboard") {
          renderRecentActivity();
        } else if (state.activeNav === "my-notes") {
          renderMyNotesPage();
        }
      });
    }

    // Keyboard shortcut ⌘K / Ctrl+K
    window.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dom.searchInput) {
          dom.searchInput.focus();
          dom.searchInput.select();
        }
      }
    });

    const profileTrigger = document.getElementById("profile-trigger");
    if (profileTrigger) {
      profileTrigger.addEventListener("click", () => {
        const setBtn = document.querySelector('[data-nav="settings"]');
        if (setBtn) setBtn.click();
      });
    }
  }

  function setupNotifications() {
    const notifBtn = document.getElementById("btn-notifications-toggle");
    if (notifBtn) {
      notifBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleNotificationsDropdown();
      });
    }

    document.addEventListener("click", (e) => {
      const dropdown = document.getElementById("notifications-dropdown-menu");
      if (dropdown && !dropdown.contains(e.target) && e.target !== notifBtn) {
        dropdown.remove();
        state.isNotificationsOpen = false;
      }
    });
  }

  function toggleNotificationsDropdown() {
    const existing = document.getElementById("notifications-dropdown-menu");
    if (existing) {
      existing.remove();
      state.isNotificationsOpen = false;
      return;
    }

    state.isNotificationsOpen = true;
    const notifBtn = document.getElementById("btn-notifications-toggle");
    const rect = notifBtn.getBoundingClientRect();

    const dropdown = document.createElement("div");
    dropdown.id = "notifications-dropdown-menu";
    dropdown.style.cssText = `
      position: fixed;
      top: ${rect.bottom + 12}px;
      right: 24px;
      width: 340px;
      background: rgba(14, 18, 36, 0.96);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-accent);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      box-shadow: 0 16px 40px rgba(0,0,0,0.7), 0 0 25px rgba(139,92,246,0.25);
      z-index: 1000;
      animation: slide-up 0.2s ease;
    `;

    dropdown.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.65rem;">
        <span style="font-weight: 800; font-size: 0.95rem; color: #ffffff;">🔔 Study Notifications</span>
        <span class="badge badge-cyan" style="font-size: 0.68rem;">3 New</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <div style="padding: 0.65rem; background: rgba(255,255,255,0.03); border-radius: var(--radius-sm); border-left: 3px solid #f59e0b;">
          <div style="font-size: 0.82rem; font-weight: 700; color: #ffffff; margin-bottom: 0.2rem;">🔥 5-Day Streak Milestone!</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">Complete 1 more quiz today to maintain your weekly tier.</div>
        </div>
        <div style="padding: 0.65rem; background: rgba(255,255,255,0.03); border-radius: var(--radius-sm); border-left: 3px solid #8b5cf6;">
          <div style="font-size: 0.82rem; font-weight: 700; color: #ffffff; margin-bottom: 0.2rem;">⚡ CS 480 Notes Ready</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">AI synthesis extracted 4 concepts and 5 practice questions.</div>
        </div>
        <div style="padding: 0.65rem; background: rgba(255,255,255,0.03); border-radius: var(--radius-sm); border-left: 3px solid #10b981;">
          <div style="font-size: 0.82rem; font-weight: 700; color: #ffffff; margin-bottom: 0.2rem;">🎯 92% Average Quiz Accuracy</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">You are in the top 10% of active student learners.</div>
        </div>
      </div>
      <div style="margin-top: 1rem; text-align: center;">
        <button class="btn btn-secondary btn-sm" id="btn-clear-notifications" style="width: 100%;">
          Mark All as Read
        </button>
      </div>
    `;

    document.body.appendChild(dropdown);

    document.getElementById("btn-clear-notifications")?.addEventListener("click", () => {
      dropdown.remove();
      state.isNotificationsOpen = false;
      showToast("All notifications marked as read! ✨", "info");
    });
  }

  function setupModalContainer() {
    let modal = document.getElementById("learnly-global-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "learnly-global-modal";
      modal.style.display = "none";
      document.body.appendChild(modal);
    }
  }

  function setupMobileSidebar() {
    if (dom.mobileToggleBtn && dom.sidebar) {
      dom.mobileToggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        dom.sidebar.classList.toggle("mobile-open");
      });

      document.addEventListener("click", (e) => {
        if (!dom.sidebar.contains(e.target) && !dom.mobileToggleBtn.contains(e.target)) {
          dom.sidebar.classList.remove("mobile-open");
        }
      });
    }
  }

  // ==========================================
  // Navigation Routing & Views
  // ==========================================
  function setupNavigation() {
    const navButtons = document.querySelectorAll(".sidebar-nav-btn");
    navButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-nav");
        state.activeNav = target;

        navButtons.forEach(b => b.classList.toggle("active", b.getAttribute("data-nav") === target));

        // Hide all views
        if (dom.dashboardSection) dom.dashboardSection.style.display = target === "dashboard" ? "block" : "none";
        if (dom.myNotesSection) dom.myNotesSection.style.display = target === "my-notes" ? "block" : "none";
        if (dom.quizHistorySection) dom.quizHistorySection.style.display = target === "quiz-history" ? "block" : "none";
        if (dom.learningProgressSection) dom.learningProgressSection.style.display = target === "learning-progress" ? "block" : "none";
        if (dom.settingsSection) dom.settingsSection.style.display = target === "settings" ? "block" : "none";

        // Render target view
        if (target === "dashboard") renderAll();
        else if (target === "my-notes") renderMyNotesPage();
        else if (target === "quiz-history") renderQuizHistoryPage();
        else if (target === "learning-progress") renderLearningProgressPage();
        else if (target === "settings") renderSettingsPage();

        if (dom.sidebar) dom.sidebar.classList.remove("mobile-open");
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  // ----------------------------------------------------
  // VIEW 2: My Notes Page
  // ----------------------------------------------------
  function renderMyNotesPage() {
    if (!dom.myNotesSection) return;

    let lectures = LEARNLY_MOCK_DATA.recentLectures;

    if (state.selectedCategoryFilter && state.selectedCategoryFilter !== "all") {
      lectures = lectures.filter(l => l.subject.toLowerCase().includes(state.selectedCategoryFilter.toLowerCase()));
    }

    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      lectures = lectures.filter(l => 
        l.title.toLowerCase().includes(q) || 
        l.subject.toLowerCase().includes(q) || 
        l.filename.toLowerCase().includes(q)
      );
    }

    const categories = [
      { id: "all", label: "All Subjects" },
      { id: "computer", label: "Computer Science" },
      { id: "biology", label: "Biology" },
      { id: "economics", label: "Economics" },
      { id: "chemistry", label: "Chemistry" }
    ];

    dom.myNotesSection.innerHTML = `
      <div style="margin-bottom: 2.5rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.5rem;">
          <h2 style="font-size: 2.2rem; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
            My Study Notes Library
          </h2>
          <button class="btn btn-primary btn-sm" id="btn-create-new-note">
            + Upload New Lecture
          </button>
        </div>
        <p style="color: var(--text-secondary); max-width: 600px;">
          Browse, filter, and review all AI-synthesized revision packs, definitions, and active recall quizzes across your courses.
        </p>

        <!-- Category Filter Pills -->
        <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem; flex-wrap: wrap;">
          ${categories.map(cat => `
            <button class="state-btn ${state.selectedCategoryFilter === cat.id ? 'active' : ''}" data-cat-filter="${cat.id}">
              ${cat.label}
            </button>
          `).join("")}
        </div>
      </div>

      ${lectures.length === 0 ? `
        <div class="empty-futuristic-card">
          <p style="color: var(--text-muted); font-size: 1rem;">No lecture study packs matching your filter criteria.</p>
        </div>
      ` : `
        <div class="concepts-futuristic-grid" style="grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));">
          ${lectures.map(lec => {
            const color = lec.subjectColor || "#8b5cf6";
            const overviewSnippet = (lec.notes?.overview || "").substring(0, 140);
            return `
              <div class="concept-card-dark" style="display: flex; flex-direction: column; justify-content: space-between;" data-my-lec="${lec.id}">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.85rem;">
                    <span class="badge badge-primary" style="background: ${color}18; color: ${color}; border-color: ${color}35;">
                      ${lec.subject}
                    </span>
                    <span style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">${lec.date}</span>
                  </div>
                  <h4 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; margin-bottom: 0.5rem; line-height: 1.35;">
                    ${lec.title}
                  </h4>
                  <p style="font-size: 0.86rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.25rem;">
                    ${overviewSnippet}...
                  </p>
                </div>

                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 0.85rem; margin-bottom: 0.85rem;">
                    <span style="font-size: 0.8rem; color: var(--text-cyan); font-weight: 600;">⏱️ ${lec.readingTime}</span>
                    <span style="font-size: 0.78rem; color: var(--text-muted);">${(lec.wordCount || 1200).toLocaleString()} words</span>
                  </div>
                  <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary btn-sm" style="flex: 1;" data-open-notes="${lec.id}">
                      View Notes →
                    </button>
                    <button class="btn btn-primary btn-sm" data-take-quiz="${lec.id}">
                      🎯 Quiz
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `}
    `;

    // Bind Category Filter clicks
    dom.myNotesSection.querySelectorAll("[data-cat-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.selectedCategoryFilter = btn.getAttribute("data-cat-filter");
        renderMyNotesPage();
      });
    });

    // Bind Open Notes buttons
    dom.myNotesSection.querySelectorAll("[data-open-notes]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-open-notes");
        const found = LEARNLY_MOCK_DATA.recentLectures.find(l => l.id === id);
        if (found) {
          state.selectedLecture = found;
          state.quizState = {
            activeQuestionIndex: 0,
            userAnswers: {},
            isSubmittedForCurrent: false,
            isCompleted: false,
            score: 0
          };
          document.querySelector('[data-nav="dashboard"]')?.click();
          renderNotesPreview();
          renderQuizPreview();
          document.getElementById("notes-preview-section")?.scrollIntoView({ behavior: "smooth" });
        }
      });
    });

    // Bind Take Quiz buttons
    dom.myNotesSection.querySelectorAll("[data-take-quiz]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-take-quiz");
        const found = LEARNLY_MOCK_DATA.recentLectures.find(l => l.id === id);
        if (found) {
          state.selectedLecture = found;
          state.quizState = {
            activeQuestionIndex: 0,
            userAnswers: {},
            isSubmittedForCurrent: false,
            isCompleted: false,
            score: 0
          };
          document.querySelector('[data-nav="dashboard"]')?.click();
          renderNotesPreview();
          renderQuizPreview();
          document.getElementById("quiz-preview-section")?.scrollIntoView({ behavior: "smooth" });
        }
      });
    });

    const newBtn = document.getElementById("btn-create-new-note");
    if (newBtn) {
      newBtn.addEventListener("click", () => {
        document.querySelector('[data-nav="dashboard"]')?.click();
        const fileInput = document.getElementById("file-input-element");
        if (fileInput) fileInput.click();
      });
    }
  }

  // ----------------------------------------------------
  // VIEW 3: Quiz History Page
  // ----------------------------------------------------
  function renderQuizHistoryPage() {
    if (!dom.quizHistorySection) return;

    dom.quizHistorySection.innerHTML = `
      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 2.2rem; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; margin-bottom: 0.5rem;">
          Quiz & Mastery History
        </h2>
        <p style="color: var(--text-secondary);">Track your active recall accuracy, exam scores, and retention diagnostics over time.</p>
      </div>

      <div class="futuristic-table-card">
        <table class="futuristic-table">
          <thead>
            <tr>
              <th>Quiz / Topic</th>
              <th>Subject</th>
              <th>Score</th>
              <th>Mastery Grade</th>
              <th>Date Attempted</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${state.quizHistoryList.map(item => `
              <tr>
                <td>
                  <strong style="color: #ffffff;">${item.title}</strong>
                </td>
                <td>
                  <span class="badge badge-primary" style="background: ${item.subjectColor}18; color: ${item.subjectColor}; border-color: ${item.subjectColor}35;">
                    ${item.subject}
                  </span>
                </td>
                <td>
                  <strong style="color: #34d399; font-family: var(--font-mono);">${item.score} / ${item.total} (${item.percentage}%)</strong>
                </td>
                <td>
                  <span class="badge ${item.percentage >= 80 ? 'badge-success' : 'badge-warning'}">${item.gradeLabel}</span>
                </td>
                <td style="color: var(--text-secondary); font-size: 0.85rem;">${item.date}</td>
                <td style="text-align: right;">
                  <button class="btn btn-secondary btn-sm" data-review-quiz="${item.lecId}">
                    Review
                  </button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;

    // Bind Review buttons
    dom.quizHistorySection.querySelectorAll("[data-review-quiz]").forEach(btn => {
      btn.addEventListener("click", () => {
        const lecId = btn.getAttribute("data-review-quiz");
        const found = LEARNLY_MOCK_DATA.recentLectures.find(l => l.id === lecId);
        if (found) {
          state.selectedLecture = found;
          state.quizState = {
            activeQuestionIndex: 0,
            userAnswers: { 0: "A", 1: "A", 2: "A", 3: "A", 4: "A" },
            isSubmittedForCurrent: true,
            isCompleted: true,
            score: found.quiz.length
          };
          document.querySelector('[data-nav="dashboard"]')?.click();
          renderQuizPreview();
          document.getElementById("quiz-preview-section")?.scrollIntoView({ behavior: "smooth" });
          showToast(`Loaded review for ${found.title}! 🎯`, "info");
        }
      });
    });
  }

  // ----------------------------------------------------
  // VIEW 4: Learning Progress Page
  // ----------------------------------------------------
  function renderLearningProgressPage() {
    if (!dom.learningProgressSection) return;

    dom.learningProgressSection.innerHTML = `
      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 2.2rem; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; margin-bottom: 0.5rem;">
          Learning Progress & Analytics
        </h2>
        <p style="color: var(--text-secondary);">Real-time mastery diagnostics, study velocity, and concept retention tracking.</p>
      </div>

      <div class="metrics-grid-four">
        <div class="metric-card-futuristic" style="--card-accent-color: #6366f1;">
          <div class="metric-top-row">
            <span class="metric-title-text">Weekly Retention</span>
            <div class="metric-icon-halo" style="background: #6366f118; color: #6366f1;">🧠</div>
          </div>
          <div class="metric-number-big">94%</div>
          <div class="metric-bottom-trend"><span>↗</span><span>+6% vs last week</span></div>
        </div>

        <div class="metric-card-futuristic" style="--card-accent-color: #8b5cf6;">
          <div class="metric-top-row">
            <span class="metric-title-text">Total Study Time</span>
            <div class="metric-icon-halo" style="background: #8b5cf618; color: #8b5cf6;">⏱️</div>
          </div>
          <div class="metric-number-big">8.5 hrs</div>
          <div class="metric-bottom-trend"><span>↗</span><span>Top 5% of class</span></div>
        </div>

        <div class="metric-card-futuristic" style="--card-accent-color: #10b981;">
          <div class="metric-top-row">
            <span class="metric-title-text">Concepts Mastered</span>
            <div class="metric-icon-halo" style="background: #10b98118; color: #10b981;">💡</div>
          </div>
          <div class="metric-number-big">42</div>
          <div class="metric-bottom-trend"><span>↗</span><span>+12 new this week</span></div>
        </div>

        <div class="metric-card-futuristic" style="--card-accent-color: #f59e0b;">
          <div class="metric-top-row">
            <span class="metric-title-text">Exam Readiness</span>
            <div class="metric-icon-halo" style="background: #f59e0b18; color: #f59e0b;">🎯</div>
          </div>
          <div class="metric-number-big">High</div>
          <div class="metric-bottom-trend"><span>●</span><span>Optimal active recall</span></div>
        </div>
      </div>

      <div class="notes-preview-futuristic" style="margin-top: 1.5rem;">
        <h3 style="font-size: 1.35rem; font-weight: 800; color: #ffffff; margin-bottom: 1.25rem;">Subject Mastery Breakdown</h3>
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 0.4rem;">
              <span style="font-weight: 700; color: #ffffff;">Computer Science (CS 480)</span>
              <span style="color: var(--text-cyan); font-weight: 700;">96% Mastery</span>
            </div>
            <div class="progress-track-neon"><div class="progress-fill-neon" style="width: 96%;"></div></div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 0.4rem;">
              <span style="font-weight: 700; color: #ffffff;">Chemistry (CHEM 102)</span>
              <span style="color: var(--text-cyan); font-weight: 700;">90% Mastery</span>
            </div>
            <div class="progress-track-neon"><div class="progress-fill-neon" style="width: 90%;"></div></div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 0.4rem;">
              <span style="font-weight: 700; color: #ffffff;">Biology (BIO 110)</span>
              <span style="color: var(--text-cyan); font-weight: 700;">85% Mastery</span>
            </div>
            <div class="progress-track-neon"><div class="progress-fill-neon" style="width: 85%;"></div></div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 0.4rem;">
              <span style="font-weight: 700; color: #ffffff;">Economics (ECON 201)</span>
              <span style="color: var(--text-cyan); font-weight: 700;">80% Mastery</span>
            </div>
            <div class="progress-track-neon"><div class="progress-fill-neon" style="width: 80%;"></div></div>
          </div>
        </div>
      </div>
    `;
  }

  // ----------------------------------------------------
  // VIEW 5: Settings Page
  // ----------------------------------------------------
  function renderSettingsPage() {
    if (!dom.settingsSection) return;
    const currentKey = localStorage.getItem("learnly_gemini_api_key") || "";
    const isServerKeyActive = state.serverHealth.gemini_env_configured;

    dom.settingsSection.innerHTML = `
      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 2.2rem; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; margin-bottom: 0.5rem;">
          Workspace Settings
        </h2>
        <p style="color: var(--text-secondary);">Configure your AI model preferences, client environment, and student profile.</p>
      </div>

      <div class="notes-preview-futuristic" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <h3 style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin-bottom: 0;">Gemini AI API Configuration</h3>
          <span class="badge ${isServerKeyActive ? 'badge-success' : 'badge-primary'}">
            ● ${isServerKeyActive ? 'Server GEMINI_API_KEY Active' : 'Connected / Local Fallback Active'}
          </span>
        </div>
        <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
          Learnly connects to server-side Gemini synthesis with intelligent client-side fallbacks. You can optionally configure an override key.
        </p>

        <div style="max-width: 540px; margin-bottom: 1.5rem;">
          <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-accent); text-transform: uppercase; margin-bottom: 0.5rem;">
            Custom Gemini API Key Override
          </label>
          <div style="display: flex; gap: 0.5rem;">
            <input type="password" id="input-settings-key" class="search-input" style="padding: 0 1rem; flex: 1;" placeholder="AIzaSy..." value="${currentKey}" />
            <button class="btn btn-secondary btn-sm" id="btn-toggle-key-visibility">👁️</button>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <button class="btn btn-primary btn-sm" id="btn-save-settings-key">
            Save Key
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-clear-settings-key">
            Clear Key
          </button>
        </div>
      </div>

      <div class="notes-preview-futuristic">
        <h3 style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin-bottom: 1rem;">Student Workspace Profile</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
          <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">STUDENT NAME</div>
            <div style="font-size: 1rem; font-weight: 800; color: #ffffff; margin-top: 0.2rem;">Aditi Singh</div>
          </div>
          <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">ACADEMIC TRACK</div>
            <div style="font-size: 1rem; font-weight: 800; color: #ffffff; margin-top: 0.2rem;">Computer Science & AI</div>
          </div>
          <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">ACTIVE STREAK</div>
            <div style="font-size: 1rem; font-weight: 800; color: #fbbf24; margin-top: 0.2rem;">5 Days 🔥</div>
          </div>
        </div>
      </div>
    `;

    const saveBtn = document.getElementById("btn-save-settings-key");
    const clearBtn = document.getElementById("btn-clear-settings-key");
    const keyInput = document.getElementById("input-settings-key");
    const toggleVisBtn = document.getElementById("btn-toggle-key-visibility");

    if (toggleVisBtn && keyInput) {
      toggleVisBtn.addEventListener("click", () => {
        keyInput.type = keyInput.type === "password" ? "text" : "password";
      });
    }

    if (saveBtn && keyInput) {
      saveBtn.addEventListener("click", () => {
        const val = keyInput.value.trim();
        if (val) {
          localStorage.setItem("learnly_gemini_api_key", val);
          showToast("Custom Gemini API key saved! ✨", "success");
        }
      });
    }

    if (clearBtn && keyInput) {
      clearBtn.addEventListener("click", () => {
        keyInput.value = "";
        localStorage.removeItem("learnly_gemini_api_key");
        showToast("Gemini API key cleared (reverting to server defaults)", "info");
      });
    }
  }

  // ==========================================
  // State Switcher (Interactive UI States)
  // ==========================================
  function setupStateSwitcher() {
    const stateButtons = document.querySelectorAll(".state-btn");
    stateButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetState = btn.getAttribute("data-state");
        state.uiState = targetState;

        stateButtons.forEach(b => b.classList.toggle("active", b.getAttribute("data-state") === targetState));

        switch (targetState) {
          case "default":
            state.errorMessage = null;
            state.uploadState = { status: "idle", file: null, extractedDoc: null };
            state.selectedLecture = LEARNLY_MOCK_DATA.recentLectures[0];
            showToast("Default Futuristic SaaS View", "info");
            break;

          case "empty":
            state.errorMessage = null;
            state.uploadState = { status: "idle", file: null, extractedDoc: null };
            state.selectedLecture = null;
            showToast("Empty Workspace State", "info");
            break;

          case "loading":
            state.errorMessage = null;
            state.uploadState = {
              status: "loading",
              progress: 55,
              stepText: "2/3 Structuring high-yield revision notes...",
              subText: "Extracting core concepts and formatting key definitions"
            };
            showToast("Loading & Synthesis State", "info");
            break;

          case "uploaded":
            state.errorMessage = null;
            state.uploadState = {
              status: "uploaded",
              file: {
                name: "CHEM102_Thermodynamics_Kinetics.pdf",
                sizeFormatted: "2.4 MB"
              }
            };
            showToast("Attached File State", "info");
            break;

          case "success":
            state.errorMessage = null;
            state.uploadState = { status: "idle", file: null, extractedDoc: null };
            state.selectedLecture = LEARNLY_MOCK_DATA.recentLectures[0];
            showToast("Study Pack Generated Successfully! 🎉", "success");
            break;

          case "error":
            state.uploadState = { status: "idle", file: null, extractedDoc: null };
            state.errorMessage = "Failed to parse document: The PDF is password-protected or corrupted. Please upload an unlocked lecture file.";
            showToast("Error State Alert Banner", "error");
            break;
        }

        renderAll();
      });
    });
  }

  // Toast Notification Helper
  function showToast(message, type = "info") {
    const existing = document.querySelector(".toast-box-futuristic");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "toast-box-futuristic";
    let icon = "ℹ️";
    if (type === "success") icon = "✨";
    if (type === "error") icon = "⚠️";

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Expose toast to global scope
  window.showToast = showToast;
});
