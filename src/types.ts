export interface Question {
  id: string;
  category: string; // 'Türkçe', 'Matematik', 'Tarih', 'Coğrafya', 'Vatandaşlık', 'Güncel Bilgiler'
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
  subjectTag: string; // e.g. "Milli Mücadele", "Köklü Sayılar"
  isAI?: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface ExamSession {
  id: string;
  userId: string;
  examMode: 'GYGK' | 'Mini' | 'Subject' | 'Personalized';
  category?: string;
  questions: Question[];
  userAnswers: { [questionId: string]: 'A' | 'B' | 'C' | 'D' | 'E' | '' };
  score: number; // KPSS calculation: net * multiplier
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
  netScore: number; // Correct - (Wrong / 4)
  durationSpent: number; // in seconds
  maxDuration: number; // in seconds
  createdAt: string;
}

export interface WeakSubjectAnalysis {
  subjectTag: string;
  category: string;
  wrongCount: number;
  totalQuestions: number;
  percentageWrong: number;
}

export interface AnalysisReport {
  overallSummary: string;
  weakSubjects: WeakSubjectAnalysis[];
  studyPlan: {
    subject: string;
    category: string;
    importance: string; // "Yüksek" | "Orta" | "Düşük"
    advice: string;
    keyPoints: string[];
  }[];
  generatedAt: string;
}

export interface PastQuestion {
  id: string;
  category: string;
  subjectTag: string;
  year: number;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
}
