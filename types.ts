export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  source?: {
    pageNumber: number | null;
    content: string;
  };
  isError?: boolean;
}

export interface PdfChunk {
  pageNumber: number;
  content: string;
}

export interface GeminiResponse {
  answer: string;
  source: string;
  pageNumber: number | null;
}

export interface PracticeQuestion {
  type: 'Multiple Choice' | 'Short Answer' | 'Essay';
  question: string;
  options?: string[];
  answer: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  pageNumber: number;
}

export interface Flashcard {
    term: string; // The front of the card
    definition: string; // The back of the card
    pageNumber: number;
}
