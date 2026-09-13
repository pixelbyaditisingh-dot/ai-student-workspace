/**
 * Learnly Reusable Frontend Components
 * Dark Futuristic SaaS Component Renderers for Student Learning Workspace.
 */

const Components = {
  /**
   * Helper: Normalize Notes Data Structure (supports both Backend API & Mock formats)
   */
  normalizeNotes(notes) {
    if (!notes) return null;

    const title = notes.title || "Lecture Revision Notes";
    const subject = notes.subject || "Coursework Material";
    const overview = notes.overview || "High-yield lecture synthesis and key takeaways.";
    
    // Core Topics / Revision Sections
    let sections = [];
    if (notes.revisionNotes && Array.isArray(notes.revisionNotes)) {
      sections = notes.revisionNotes;
    } else if (notes.core_topics && Array.isArray(notes.core_topics)) {
      sections = notes.core_topics.map(t => ({
        section: t.topic_title || t.topic || "Core Topic",
        summary: t.summary || "",
        points: t.bullet_points || t.key_points || t.points || []
      }));
    }

    // Key Concepts
    let concepts = [];
    if (notes.keyConcepts && Array.isArray(notes.keyConcepts)) {
      concepts = notes.keyConcepts;
    } else if (notes.concepts && Array.isArray(notes.concepts)) {
      concepts = notes.concepts;
    }

    // Takeaways
    let takeaways = [];
    if (notes.takeaways && Array.isArray(notes.takeaways)) {
      takeaways = notes.takeaways;
    } else if (notes.key_takeaways && Array.isArray(notes.key_takeaways)) {
      takeaways = notes.key_takeaways;
    } else if (notes.high_yield_takeaways && Array.isArray(notes.high_yield_takeaways)) {
      takeaways = notes.high_yield_takeaways;
    }

    return { title, subject, overview, revisionNotes: sections, keyConcepts: concepts, takeaways };
  },

  /**
   * Helper: Normalize Quiz Question Structure
   */
  normalizeQuizQuestion(q, idx) {
    if (!q) return null;
    return {
      id: q.id || (idx + 1),
      question: q.question || "Practice Question",
      options: (q.options || []).map(opt => ({
        id: opt.id || "A",
        text: opt.text || ""
      })),
      correctOption: q.correct_option || q.correctOption || "A",
      explanation: q.explanation || "Review lecture notes for conceptual details.",
      conceptTested: q.concept_tested || q.conceptTested || "Key Principle"
    };
  },

  /**
   * 1. Dashboard Statistics Metric Cards (4 Cards)
   */
  renderMetricCards(metrics) {
    const defaultMetrics = [
      {
        id: "total-lectures",
        title: "Total Lectures",
        value: "14",
        change: "+3 this week",
        isPositive: true,
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path><path d="M6 6h10"></path><path d="M6 10h10"></path><path d="M12 18l3-3-3-3"></path></svg>`,
        color: "#6366f1"
      },
      {
        id: "notes-generated",
        title: "Notes Generated",
        value: "42",
        change: "+12 key concepts",
        isPositive: true,
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
        color: "#8b5cf6"
      },
      {
        id: "quizzes-completed",
        title: "Quizzes Completed",
        value: "18",
        change: "92% average score",
        isPositive: true,
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>`,
        color: "#10b981"
      },
      {
        id: "current-streak",
        title: "Current Day Streak",
        value: "5 Days 🔥",
        change: "Top 10% consistency",
        isPositive: true,
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`,
        color: "#f59e0b"
      }
    ];

    const data = metrics && metrics.length === 4 ? metrics : defaultMetrics;

    return `
      <div class="metrics-grid-four">
        ${data.map(m => {
          const color = m.color || "#8b5cf6";
          return `
            <div class="metric-card-futuristic" style="--card-accent-color: ${color};">
              <div class="metric-top-row">
                <span class="metric-title-text">${m.title}</span>
                <div class="metric-icon-halo" style="background: ${color}18; color: ${color}; border: 1px solid ${color}35;">
                  ${m.icon}
                </div>
              </div>
              <div>
                <div class="metric-number-big">${m.value}</div>
                <div class="metric-bottom-trend" style="color: ${m.isPositive ? '#34d399' : '#94a3b8'};">
                  <span>${m.isPositive ? '↗' : '●'}</span>
                  <span>${m.change}</span>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  },

  /**
   * 2. Quick Actions Panel Cards
   */
  renderQuickActions() {
    const actions = [
      {
        id: "qa-upload",
        icon: "⚡",
        color: "#8b5cf6",
        title: "Generate Notes",
        desc: "Upload lecture PDF or TXT to get instant summaries"
      },
      {
        id: "qa-quiz",
        icon: "🎯",
        color: "#06b6d4",
        title: "Take Practice Quiz",
        desc: "Test active recall with 5 curated questions"
      },
      {
        id: "qa-history",
        icon: "📊",
        color: "#10b981",
        title: "View Quiz History",
        desc: "Track scores, accuracy, and mastery trends"
      },
      {
        id: "qa-library",
        icon: "📚",
        color: "#f59e0b",
        title: "My Notes Library",
        desc: "Browse and revise your saved subject packs"
      }
    ];

    return actions.map(act => `
      <div class="quick-action-card" data-quick-action="${act.id}">
        <div class="action-icon-circle" style="background: ${act.color}18; color: ${act.color}; border: 1px solid ${act.color}35;">
          ${act.icon}
        </div>
        <div class="action-title">${act.title}</div>
        <div class="action-desc">${act.desc}</div>
      </div>
    `).join("");
  },

  /**
   * 3. Learning Progress Widget (Circular Progress + Wave Graph)
   */
  renderLearningProgressWidget(progressPercent = 84) {
    const strokeDash = 283;
    const offset = strokeDash - (strokeDash * progressPercent) / 100;

    return `
      <div class="panel-header-row" style="margin-bottom: 0.5rem;">
        <h3 class="panel-heading">📈 Learning Progress</h3>
        <span class="badge badge-success">Top 10% Tier</span>
      </div>

      <div class="progress-widget-center">
        <!-- Circular SVG Ring -->
        <div class="circular-progress-wrap">
          <svg viewBox="0 0 100 100">
            <circle class="circular-bg-ring" cx="50" cy="50" r="45"></circle>
            <circle class="circular-fill-ring" cx="50" cy="50" r="45" style="stroke-dashoffset: ${offset};"></circle>
          </svg>
          <div class="circular-center-text">
            <span class="circular-pct-num">${progressPercent}%</span>
            <span class="circular-sub-label">Mastery</span>
          </div>
        </div>

        <div class="progress-meta-info">
          <div class="progress-meta-title">Weekly Goal: On Track! 🔥</div>
          <p class="progress-meta-desc">
            You have reviewed <strong>14 lectures</strong> and completed <strong>18 practice quizzes</strong> this week with a 92% average score.
          </p>
        </div>
      </div>

      <!-- Abstract Futuristic Wave Graph -->
      <div class="progress-wave-canvas">
        <svg width="100%" height="48" viewBox="0 0 400 48" fill="none" preserveAspectRatio="none">
          <path d="M0,35 Q50,15 100,28 T200,10 T300,22 T400,8 L400,48 L0,48 Z" fill="url(#waveGradient)" opacity="0.4" />
          <path d="M0,35 Q50,15 100,28 T200,10 T300,22 T400,8" stroke="url(#neonGradient)" stroke-width="2.5" stroke-linecap="round" fill="none" />
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.6" />
              <stop offset="100%" stop-color="#06b6d4" stop-opacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    `;
  },

  /**
   * 4. Upload Section (Handles Idle, Selected, Extracting, and Extracted States)
   */
  renderUploadSection(uploadState) {
    // 4A. Uploading / Extracting Loading State
    if (uploadState.status === "uploading" || uploadState.status === "loading") {
      const progress = uploadState.progress || 50;
      return `
        <div class="futuristic-loading-card">
          <div class="neon-spinner"></div>
          <h3 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 0.5rem; color: #ffffff;">
            ${uploadState.stepText || 'Synthesizing Lecture Knowledge...'}
          </h3>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.75rem;">
            ${uploadState.subText || 'Extracting core principles, formatting definitions, and formulating 5 quiz questions'}
          </p>
          <div class="progress-track-neon" style="max-width: 500px; margin: 0 auto 0.85rem;">
            <div class="progress-fill-neon" style="width: ${progress}%;"></div>
          </div>
          <div style="font-size: 0.82rem; color: var(--accent-cyan-light); font-weight: 700; font-family: var(--font-mono);">
            ${progress}% Complete
          </div>
        </div>
      `;
    }

    // 4B. Extraction Successful & Text Extracted Preview State
    if (uploadState.status === "extracted" && uploadState.extractedDoc) {
      const doc = uploadState.extractedDoc;
      const isPdf = doc.fileType === "pdf";

      return `
        <div class="futuristic-doc-card">
          <!-- File Header Row -->
          <div class="file-header-row">
            <div class="file-info-group">
              <div class="doc-type-badge-icon ${isPdf ? 'doc-type-pdf' : 'doc-type-txt'}">
                ${isPdf ? `
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <path d="M9 15h6"></path>
                    <path d="M9 11h6"></path>
                  </svg>
                ` : `
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <line x1="10" y1="9" x2="8" y2="9"></line>
                  </svg>
                `}
              </div>
              <div>
                <h4 class="doc-title-text">${doc.filename}</h4>
                <div class="doc-meta-sub">
                  <span style="font-weight: 700; color: #ffffff;">${isPdf ? 'PDF Document' : 'Plain Text Document'}</span>
                  <span>•</span>
                  <span>${doc.sizeFormatted}</span>
                  <span>•</span>
                  <span class="badge badge-success">
                    <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#10b981; margin-right:4px;"></span>
                    Text Extracted Successfully
                  </span>
                </div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm" id="btn-remove-file" title="Upload a different lecture file">
                ✕ Upload Different File
              </button>
              <button class="btn btn-primary" id="btn-continue-generate-notes">
                Continue to Generate Notes ✨
              </button>
            </div>
          </div>

          <!-- Document Stats Chips -->
          <div class="stats-pills-row">
            <div class="stat-chip">
              📊 <strong>${doc.wordCount.toLocaleString()}</strong> Words
            </div>
            <div class="stat-chip">
              🔤 <strong>${doc.charCount.toLocaleString()}</strong> Characters
            </div>
            <div class="stat-chip">
              ⏱️ <strong>${doc.readingTime}</strong>
            </div>
            ${isPdf ? `
              <div class="stat-chip">
                📄 <strong>${doc.totalPages}</strong> Page${doc.totalPages > 1 ? 's' : ''} Parsed
              </div>
            ` : ''}
          </div>

          <!-- Extracted Text Preview Box -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem;">
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-accent); text-transform: uppercase; letter-spacing: 0.06em;">
                Extracted Lecture Text Stream
              </label>
              <span style="font-size: 0.75rem; color: var(--text-muted);">
                Ready for AI synthesis
              </span>
            </div>
            <pre class="preview-code-box">${doc.text}</pre>
          </div>
        </div>
      `;
    }

    // 4C. File Selected (Staged before extraction) State
    if (uploadState.status === "selected" || (uploadState.status === "uploaded" && uploadState.file)) {
      const f = uploadState.file;
      const isPdf = f.name.toLowerCase().endsWith(".pdf");
      const typeLabel = isPdf ? "PDF Document" : "Plain Text Document";

      return `
        <div class="futuristic-doc-card">
          <div class="file-header-row">
            <div class="file-info-group">
              <div class="doc-type-badge-icon ${isPdf ? 'doc-type-pdf' : 'doc-type-txt'}">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <div>
                <h4 class="doc-title-text" title="${f.name}">${f.name}</h4>
                <div class="doc-meta-sub">
                  <span style="font-weight: 700; color: #ffffff;">${typeLabel}</span>
                  <span>•</span>
                  <span>${f.sizeFormatted || '2.4 MB'}</span>
                  <span>•</span>
                  <span class="badge badge-cyan">
                    <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#06b6d4; margin-right:4px;"></span>
                    File Attached
                  </span>
                </div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm" id="btn-remove-file" title="Remove this file">
                ✕ Remove File
              </button>
              <button class="btn btn-primary" id="btn-extract-text-action">
                Extract Text & Synthesize ⚡
              </button>
            </div>
          </div>
        </div>
      `;
    }

    // 4D. Default: Idle Dropzone State
    return `
      <div id="upload-dropzone" class="futuristic-upload-card" role="button" tabindex="0" aria-label="Upload lecture file dropzone">
        <input type="file" id="file-input-element" accept=".pdf,.txt" style="display: none;" />
        
        <div class="upload-icon-pulse-box">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>

        <h3 class="upload-title-main">Drop your lecture file here</h3>
        <p class="upload-sub-desc">Supports PDF and TXT files for AI revision & quiz generation</p>

        <div style="display: flex; justify-content: center; gap: 0.75rem;">
          <button class="btn btn-primary btn-sm" id="btn-browse-trigger" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Browse Files
          </button>
        </div>

        <div class="upload-format-chips">
          <span class="format-chip">.PDF</span>
          <span class="format-chip">.TXT</span>
          <span class="format-chip">Max 25MB</span>
          <span class="format-chip">Client & Server AI Parsing</span>
        </div>
      </div>
    `;
  },

  /**
   * 5. Recent Activity Section Table
   */
  renderRecentActivity(lectures) {
    if (!lectures || lectures.length === 0) {
      return `
        <div class="empty-futuristic-card">
          <p style="color: var(--text-muted); font-size: 0.95rem;">No recent lectures found in workspace.</p>
        </div>
      `;
    }

    return `
      <div class="futuristic-table-card">
        <table class="futuristic-table">
          <thead>
            <tr>
              <th>Lecture / File</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Status</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${lectures.map(lec => {
              const color = lec.subjectColor || "#8b5cf6";
              return `
                <tr>
                  <td>
                    <div class="table-doc-cell">
                      <div class="table-doc-icon" style="background: ${color}18; color: ${color};">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                      </div>
                      <div>
                        <div class="table-doc-title">${lec.title}</div>
                        <div class="table-doc-filename">${lec.filename}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-primary" style="background: ${color}18; color: ${color}; border-color: ${color}35;">
                      ${lec.subject}
                    </span>
                  </td>
                  <td style="color: var(--text-secondary); font-size: 0.85rem;">
                    ${lec.date}
                  </td>
                  <td>
                    <span class="badge ${lec.status === 'Ready' ? 'badge-success' : 'badge-warning'}">
                      ${lec.status === 'Ready' ? '● Ready' : '⏳ Processing'}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary btn-sm btn-view-notes" data-lecture-id="${lec.id}">
                      View Notes →
                    </button>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  },

  /**
   * 6. Notes Preview Section (Supports full study breakdown, copy, and export)
   */
  renderNotesPreview(rawNotes) {
    if (!rawNotes) {
      return this.renderNotesEmptyState();
    }

    const notes = this.normalizeNotes(rawNotes);

    return `
      <div class="notes-preview-futuristic">
        <!-- Header Bar -->
        <div class="notes-header-bar">
          <div>
            <span class="badge badge-primary" style="margin-bottom: 0.5rem;">
              ${notes.subject}
            </span>
            <h3 class="notes-heading-main">${notes.title}</h3>
            <div class="notes-meta-pills">
              <span>📖 Complete Study Breakdown</span>
              <span>•</span>
              <span>${notes.keyConcepts.length} Key Concepts</span>
              <span>•</span>
              <span>5 Practice Quiz Questions</span>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" id="btn-copy-notes" title="Copy notes to clipboard">
              📋 Copy Notes
            </button>
            <button class="btn btn-secondary btn-sm" id="btn-download-notes" title="Download Markdown document">
              💾 Export Markdown
            </button>
            <button class="btn btn-primary btn-sm" id="btn-generate-quiz-action">
              🎯 Practice Quiz (5 Questions)
            </button>
          </div>
        </div>

        <!-- Executive Summary -->
        <div class="summary-futuristic-card">
          <div class="summary-title-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            Executive Summary
          </div>
          <p class="summary-paragraph">${notes.overview}</p>
        </div>

        <!-- Key Concepts Section -->
        <div style="margin-bottom: 2.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h4 class="concepts-section-header" style="margin-bottom: 0;">💡 Key Concepts & Core Terminology</h4>
            <span style="font-size: 0.78rem; color: var(--text-muted);">Click concept to copy</span>
          </div>
          <div class="concepts-futuristic-grid">
            ${notes.keyConcepts.map(c => `
              <div class="concept-card-dark" data-copy-text="${c.term}: ${c.definition}" style="cursor: pointer;" title="Click to copy definition">
                <div class="concept-card-top">
                  <span class="concept-term-title">${c.term}</span>
                  <span class="badge badge-primary" style="font-size: 0.7rem;">${c.category || 'Core Concept'}</span>
                </div>
                <p class="concept-desc-text">${c.definition}</p>
                ${c.context_or_example ? `<p style="font-size: 0.78rem; color: var(--accent-cyan-light); margin-top: 0.5rem; font-style: italic;">e.g., ${c.context_or_example}</p>` : ''}
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Revision Notes Breakdown -->
        <div>
          <h4 class="concepts-section-header">📝 Structured Revision Notes</h4>
          ${notes.revisionNotes.map(rn => `
            <div class="topic-revision-block">
              <h5 class="topic-heading">${rn.section}</h5>
              ${rn.summary ? `<p class="topic-summary-line">${rn.summary}</p>` : ''}
              <ul class="futuristic-bullets-list">
                ${(rn.points || []).map(p => `<li>${p}</li>`).join("")}
              </ul>
            </div>
          `).join("")}
        </div>

        <!-- High-Yield Takeaways -->
        <div class="takeaways-glowing-box">
          <div class="takeaways-title">
            ⭐ Top High-Yield Takeaways
          </div>
          <ul class="futuristic-bullets-list">
            ${notes.takeaways.map(t => `<li style="color: #fde68a;">${t}</li>`).join("")}
          </ul>
        </div>
      </div>
    `;
  },

  /**
   * 7. Notes Empty State
   */
  renderNotesEmptyState() {
    return `
      <div class="empty-futuristic-card">
        <div class="empty-icon-halo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
        </div>
        <h4 style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin-bottom: 0.4rem;">No Lecture Selected</h4>
        <p style="color: var(--text-secondary); max-width: 440px; margin: 0 auto 1.5rem; font-size: 0.88rem;">
          Upload a lecture PDF above or select one of your registered courses to preview revision notes and practice quizzes.
        </p>
        <button class="btn btn-secondary btn-sm" id="btn-load-sample-demo">
          Load Sample CS 480 Notes Demo 🤖
        </button>
      </div>
    `;
  },

  /**
   * 8. Quiz Preview Section (Interactive 5-Question Engine)
   */
  renderQuizPreview(rawQuizItem, quizIndex, totalQuiz, selectedOption, isSubmitted) {
    if (!rawQuizItem) {
      return `
        <div class="empty-futuristic-card">
          <h4 style="font-size: 1.2rem; font-weight: 800; color: #ffffff; margin-bottom: 0.4rem;">No Quiz Questions Available</h4>
          <p style="color: var(--text-secondary); font-size: 0.88rem;">Select a lecture notes set above to take the 5-question mastery quiz.</p>
        </div>
      `;
    }

    const quizItem = this.normalizeQuizQuestion(rawQuizItem, quizIndex);
    const currentNumber = quizIndex + 1;
    const progressPercent = (currentNumber / totalQuiz) * 100;

    let explanationBox = "";
    if (isSubmitted && selectedOption) {
      const isCorrect = selectedOption === quizItem.correctOption;
      explanationBox = `
        <div class="quiz-explanation-box-dark ${isCorrect ? 'box-correct' : 'box-incorrect'}">
          <div style="font-weight: 800; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.4rem;">
            ${isCorrect ? '✨ Excellent! That is correct.' : '💡 Not quite. Here is the breakdown:'}
          </div>
          <div>${quizItem.explanation}</div>
        </div>
      `;
    }

    return `
      <div class="quiz-panel-futuristic">
        <!-- Progress Header -->
        <div class="quiz-progress-top">
          <span class="quiz-progress-counter">Question ${currentNumber} of ${totalQuiz}</span>
          <span class="badge badge-primary">${quizItem.conceptTested}</span>
        </div>

        <div class="progress-track-neon" style="margin-bottom: 1.5rem;">
          <div class="progress-fill-neon" style="width: ${progressPercent}%;"></div>
        </div>

        <!-- Question Heading -->
        <h3 class="quiz-question-title">${quizItem.question}</h3>

        <!-- Options Stack -->
        <div class="options-stack-futuristic">
          ${quizItem.options.map(opt => {
            let optionClass = "";
            if (selectedOption === opt.id) {
              optionClass = "selected";
            }
            if (isSubmitted) {
              if (opt.id === quizItem.correctOption) {
                optionClass = "correct";
              } else if (selectedOption === opt.id && opt.id !== quizItem.correctOption) {
                optionClass = "incorrect";
              }
            }

            return `
              <button class="option-futuristic-btn ${optionClass}" data-opt-id="${opt.id}" ${isSubmitted ? 'disabled' : ''}>
                <span class="option-letter-badge">${opt.id}</span>
                <span style="flex: 1;">${opt.text}</span>
                ${isSubmitted && opt.id === quizItem.correctOption ? '<span style="color: #34d399; font-weight: 800; margin-left: auto;">✓ Correct</span>' : ''}
                ${isSubmitted && selectedOption === opt.id && opt.id !== quizItem.correctOption ? '<span style="color: #ef4444; font-weight: 800; margin-left: auto;">✕ Incorrect</span>' : ''}
              </button>
            `;
          }).join("")}
        </div>

        ${explanationBox}

        <!-- Actions Row -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.75rem;">
          <button class="btn btn-secondary btn-sm" id="btn-quiz-prev-q" ${quizIndex === 0 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}>
            ← Previous
          </button>

          ${!isSubmitted ? `
            <button class="btn btn-primary btn-sm" id="btn-submit-answer" ${!selectedOption ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
              Submit Answer
            </button>
          ` : `
            ${quizIndex < totalQuiz - 1 ? `
              <button class="btn btn-primary btn-sm" id="btn-next-quiz-q">
                Next Question →
              </button>
            ` : `
              <button class="btn btn-primary btn-sm" id="btn-finish-quiz-view">
                View Final Score 🎯
              </button>
            `}
          `}
        </div>
      </div>
    `;
  },

  /**
   * 9. Quiz Mastery Summary Screen (With Diagnostic Breakdown)
   */
  renderQuizSummary(score, total, quizList = [], userAnswers = {}) {
    const pct = Math.round((score / total) * 100);
    const gradeLabel = pct >= 80 ? "🎉 Outstanding Mastery!" : pct >= 60 ? "👍 Solid Effort!" : "💡 Needs Revision";

    return `
      <div class="quiz-panel-futuristic quiz-summary-futuristic">
        <div class="mastery-score-halo">
          <span class="mastery-score-num">${score}</span>
          <span style="font-size: 0.8rem; color: var(--text-cyan); font-weight: 700;">/ ${total}</span>
        </div>

        <h3 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem; color: #ffffff;">
          ${gradeLabel}
        </h3>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">
          You scored <strong style="color: #ffffff;">${pct}% (${score} of ${total})</strong> on this lecture mastery quiz.
        </p>

        <!-- Study Recommendations -->
        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem; max-width: 620px; margin: 0 auto 2rem; text-align: left;">
          <div style="font-weight: 800; font-size: 0.9rem; color: var(--accent-purple-light); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
            💡 Tailored Revision Recommendations
          </div>
          <ul class="futuristic-bullets-list">
            <li>Review the <strong>Key Concepts</strong> cards to reinforce core terminology and definitions.</li>
            <li>Re-read the topic breakdowns in the <strong>Structured Revision Notes</strong> above.</li>
            <li>Retake this 5-question quiz before exam day to maintain active recall strength.</li>
          </ul>
        </div>

        <!-- Question-by-Question Diagnostic Review -->
        ${quizList && quizList.length > 0 ? `
          <div style="max-width: 680px; margin: 0 auto 2.5rem; text-align: left;">
            <h4 style="font-size: 1.1rem; font-weight: 800; color: #ffffff; margin-bottom: 1rem;">Question Review Breakdown</h4>
            <div style="display: flex; flex-direction: column; gap: 0.85rem;">
              ${quizList.map((q, idx) => {
                const normQ = this.normalizeQuizQuestion(q, idx);
                const userAns = userAnswers[idx];
                const isCorrect = userAns === normQ.correctOption;
                return `
                  <div style="background: rgba(18, 22, 42, 0.7); border: 1px solid ${isCorrect ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}; border-radius: var(--radius-md); padding: 1rem 1.25rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                      <span style="font-weight: 700; font-size: 0.85rem; color: ${isCorrect ? '#34d399' : '#f87171'};">
                        ${isCorrect ? '✓ Question ' + (idx + 1) + ' Correct' : '✕ Question ' + (idx + 1) + ' Incorrect'}
                      </span>
                      <span class="badge badge-primary" style="font-size: 0.7rem;">${normQ.conceptTested}</span>
                    </div>
                    <p style="font-size: 0.88rem; font-weight: 600; color: #ffffff; margin-bottom: 0.4rem;">${normQ.question}</p>
                    <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.35rem;">
                      Your Answer: <strong>Option ${userAns || 'None'}</strong> | Correct: <strong style="color: #34d399;">Option ${normQ.correctOption}</strong>
                    </p>
                    <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4;">${normQ.explanation}</p>
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        ` : ''}

        <button class="btn btn-primary" id="btn-retake-quiz-action">
          🔄 Retake Quiz
        </button>
      </div>
    `;
  },

  /**
   * 10. Error Alert Banner
   */
  renderErrorAlert(message) {
    return `
      <div class="error-banner-futuristic">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div style="flex: 1;">
          <strong>Error: </strong> ${message}
        </div>
        <button id="btn-dismiss-error" style="background:none; border:none; color:inherit; font-weight:700; cursor:pointer; font-size:1.1rem;">✕</button>
      </div>
    `;
  }
};
