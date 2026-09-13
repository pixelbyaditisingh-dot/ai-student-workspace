/**
 * Learnly Text Extraction Engine
 * Client-side text extraction for PDF and TXT lecture files.
 */

const TextExtractor = {
  /**
   * Main router for document text extraction
   */
  async extract(file, onProgress = () => {}) {
    if (!file) {
      throw new Error("No file provided for text extraction.");
    }

    const fileNameLower = file.name.toLowerCase();

    if (fileNameLower.endsWith(".txt")) {
      return await this.extractFromTxt(file, onProgress);
    } else if (fileNameLower.endsWith(".pdf")) {
      return await this.extractFromPdf(file, onProgress);
    } else {
      throw new Error(`Unsupported file type '${file.name}'. Please provide a .pdf or .txt file.`);
    }
  },

  /**
   * 1. Extracts full text from TXT files using FileReader API
   */
  extractFromTxt(file, onProgress) {
    return new Promise((resolve, reject) => {
      onProgress({ status: "reading", message: `Reading text file '${file.name}'...`, percent: 30 });

      if (file.size === 0) {
        return reject(new Error(`The text file '${file.name}' is completely empty (0 bytes). Please upload a file with lecture content.`));
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const rawText = event.target.result || "";
          const cleanedText = this.normalizeWhitespace(rawText);

          if (!cleanedText.trim()) {
            return reject(new Error(`The text file '${file.name}' contains no readable text characters.`));
          }

          const wordCount = this.countWords(cleanedText);
          const charCount = cleanedText.length;
          const readingTime = this.calculateReadingTime(wordCount);

          onProgress({ status: "success", message: "Text extracted successfully!", percent: 100 });

          resolve({
            filename: file.name,
            fileType: "txt",
            fileSize: file.size,
            sizeFormatted: this.formatBytes(file.size),
            text: cleanedText,
            wordCount: wordCount,
            charCount: charCount,
            readingTime: readingTime,
            totalPages: 1
          });
        } catch (err) {
          reject(new Error(`Failed to parse text content: ${err.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error(`Could not read text file '${file.name}'. The file might be locked, corrupted, or inaccessible.`));
      };

      reader.readAsText(file, "UTF-8");
    });
  },

  /**
   * 2. Extracts text from every page of PDF files using PDF.js
   */
  async extractFromPdf(file, onProgress) {
    if (file.size === 0) {
      throw new Error(`The PDF file '${file.name}' is empty (0 bytes). Please upload a valid lecture PDF.`);
    }

    onProgress({ status: "reading", message: `Loading PDF document '${file.name}'...`, percent: 20 });

    // Ensure PDF.js is available
    if (typeof window.pdfjsLib === "undefined") {
      throw new Error("PDF parsing library (pdfjs-dist) is not loaded. Please ensure an internet connection to load PDF tools.");
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;

      if (totalPages === 0) {
        throw new Error("The uploaded PDF has 0 pages.");
      }

      const pageTexts = [];
      let totalExtractedLength = 0;

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const percent = Math.min(95, Math.round(20 + ((pageNum / totalPages) * 75)));
        onProgress({
          status: "extracting",
          message: `Extracting text from page ${pageNum} of ${totalPages}...`,
          currentPage: pageNum,
          totalPages: totalPages,
          percent: percent
        });

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Extract string tokens
        const strings = textContent.items.map(item => item.str);
        const pageText = strings.join(" ").trim();

        if (pageText) {
          pageTexts.push(`--- Page ${pageNum} ---\n${pageText}`);
          totalExtractedLength += pageText.length;
        }
      }

      const combinedText = pageTexts.join("\n\n");
      const cleanedText = this.normalizeWhitespace(combinedText);

      // Handle PDFs with no extractable text (e.g., scanned images without OCR)
      if (!cleanedText.trim() || totalExtractedLength < 15) {
        throw new Error(`No extractable text was found in '${file.name}'. This PDF may contain scanned images or photos without OCR text.`);
      }

      const wordCount = this.countWords(cleanedText);
      const charCount = cleanedText.length;
      const readingTime = this.calculateReadingTime(wordCount);

      onProgress({ status: "success", message: "PDF text extraction complete!", percent: 100 });

      return {
        filename: file.name,
        fileType: "pdf",
        fileSize: file.size,
        sizeFormatted: this.formatBytes(file.size),
        text: cleanedText,
        wordCount: wordCount,
        charCount: charCount,
        readingTime: readingTime,
        totalPages: totalPages
      };
    } catch (err) {
      if (err.name === "PasswordException") {
        throw new Error(`The PDF '${file.name}' is password-protected. Please upload an unlocked PDF document.`);
      }
      if (err.name === "InvalidPDFException") {
        throw new Error(`The file '${file.name}' is corrupted or is not a valid PDF document.`);
      }
      throw new Error(err.message || `Failed to extract text from PDF '${file.name}'.`);
    }
  },

  /**
   * Helper Utilities
   */
  countWords(text) {
    if (!text) return 0;
    const tokens = text.trim().split(/\s+/).filter(Boolean);
    return tokens.length;
  },

  calculateReadingTime(wordCount) {
    const minutes = Math.max(1, Math.round(wordCount / 220));
    return `~${minutes} min read`;
  },

  formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  },

  normalizeWhitespace(text) {
    return text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\t/g, "  ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }
};
