import { Question, ExamSession, AnalysisReport } from "./types";

// Key for local storage auth
const USER_KEY = "kpss_user_profile";

export function getSavedUser() {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveUser(user: { id: string; username: string; email: string }) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

// Global fetch helper that automatically adds the x-user-id header
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const user = getSavedUser();
  const headers = {
    "Content-Type": "application/json",
    ...(user ? { "x-user-id": user.id } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "Bir hata oluştu.");
  }

  return response.json();
}

export const api = {
  // Authentication
  async register(username: string) {
    return apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username }),
    });
  },

  async login(username: string) {
    return apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username }),
    });
  },

  async getProfile() {
    return apiFetch("/api/auth/profile");
  },

  // Questions
  async getSeededQuestions(limit: number = 10, category?: string): Promise<Question[]> {
    const catParam = category ? `&category=${encodeURIComponent(category)}` : "";
    return apiFetch(`/api/questions?limit=${limit}${catParam}`);
  },

  async generateAIQuestions(category: string, count: number, personalized?: boolean): Promise<Question[]> {
    return apiFetch("/api/questions/generate", {
      method: "POST",
      body: JSON.stringify({ category, count, personalized }),
    });
  },

  // Past Questions Library
  async getPastQuestions(filters: { category?: string; subjectTag?: string; year?: string } = {}): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters.category) params.append("category", filters.category);
    if (filters.subjectTag) params.append("subjectTag", filters.subjectTag);
    if (filters.year) params.append("year", filters.year);
    return apiFetch(`/api/past-questions?${params.toString()}`);
  },

  async getPastQuestionsMetadata(): Promise<{ categories: string[]; subjectTags: string[]; years: number[] }> {
    return apiFetch("/api/past-questions/metadata");
  },

  // Sessions / Exam Results
  async saveSession(sessionData: {
    examMode: 'GYGK' | 'Mini' | 'Subject' | 'Personalized';
    category?: string;
    questions: Question[];
    userAnswers: { [questionId: string]: string };
    durationSpent: number;
    maxDuration: number;
  }): Promise<ExamSession> {
    return apiFetch("/api/sessions/save", {
      method: "POST",
      body: JSON.stringify(sessionData),
    });
  },

  async getSessions(): Promise<ExamSession[]> {
    return apiFetch("/api/sessions");
  },

  // Deep performance analysis report from Gemini
  async getAnalysisReport(): Promise<AnalysisReport> {
    return apiFetch("/api/analysis/report", {
      method: "POST",
    });
  }
};
