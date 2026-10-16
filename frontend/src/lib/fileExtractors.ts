import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker if available in browser
if (typeof window !== 'undefined' && 'Worker' in window) {
  // Use unpkg or cdnjs worker fallback for pdfjs in browser bundle
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

export interface ExtractedFileResult {
  filename: string;
  text: string;
  fileType: 'docx' | 'pdf' | 'txt';
  charCount: number;
}

/**
 * Extracts plain text from DOCX file using mammoth.js
 */
export async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

/**
 * Extracts plain text from text-based PDF file using pdf.js
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tokenizedText = await page.getTextContent();
    const pageStrings = tokenizedText.items.map((item) => {
      return 'str' in item ? (item as { str: string }).str : '';
    });
    fullText += pageStrings.join(' ') + '\n';
  }

  return fullText.trim();
}

/**
 * Handles file reading based on extension
 */
export async function extractTextFromFile(file: File): Promise<ExtractedFileResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  let text = '';
  let fileType: 'docx' | 'pdf' | 'txt' = 'txt';

  if (ext === 'docx') {
    fileType = 'docx';
    text = await extractTextFromDocx(file);
  } else if (ext === 'pdf') {
    fileType = 'pdf';
    text = await extractTextFromPdf(file);
  } else {
    // Default text file (.txt, .par, etc.)
    fileType = 'txt';
    text = await file.text();
  }

  return {
    filename: file.name,
    text: text.trim(),
    fileType,
    charCount: text.length,
  };
}
