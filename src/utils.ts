import { Question, ExamSession, AnalysisReport } from "./types";
import { SEED_QUESTIONS as RAW_SEED_QUESTIONS, PAST_QUESTIONS_SEED } from "./data";

const SEED_QUESTIONS = RAW_SEED_QUESTIONS as Question[];

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

// Global state to track if backend API is offline (e.g. on static Vercel deployments)
let isBackendOffline = false;

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

// Resilient fallback logic for when Vercel static deployment has no active Express server running
const localAPI = {
  async login(username: string) {
    const users = JSON.parse(localStorage.getItem("kpss_local_users") || "[]");
    let user = users.find((u: any) => u.username.toLowerCase() === username.trim().toLowerCase());
    let message = "Başarıyla giriş yapıldı!";
    if (!user) {
      user = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        username: username.trim(),
        email: ""
      };
      users.push(user);
      localStorage.setItem("kpss_local_users", JSON.stringify(users));
      message = "Yeni profiliniz oluşturuldu ve giriş yapıldı!";
    }
    return { user, message };
  },

  async register(username: string) {
    const users = JSON.parse(localStorage.getItem("kpss_local_users") || "[]");
    const existing = users.find((u: any) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (existing) {
      throw new Error("Bu Ad Soyad zaten kayıtlı.");
    }
    const user = {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      username: username.trim(),
      email: ""
    };
    users.push(user);
    localStorage.setItem("kpss_local_users", JSON.stringify(users));
    return user;
  },

  async getProfile() {
    const saved = getSavedUser();
    if (!saved) throw new Error("Giriş yapılması gerekiyor.");
    const users = JSON.parse(localStorage.getItem("kpss_local_users") || "[]");
    const user = users.find((u: any) => u.id === saved.id);
    return user || saved;
  },

  async getSeededQuestions(limit: number = 10, category?: string): Promise<Question[]> {
    let list = [...SEED_QUESTIONS];
    if (category && category !== "Tümü") {
      list = list.filter(q => q.category === category);
    }
    list.sort(() => 0.5 - Math.random());
    return list.slice(0, limit);
  },

  async generateAIQuestions(category: string, count: number, personalized?: boolean): Promise<Question[]> {
    let list = [...SEED_QUESTIONS];
    if (category && category !== "Tümü") {
      list = list.filter(q => q.category === category);
    }

    if (personalized) {
      const user = getSavedUser();
      if (user) {
        const sessions = JSON.parse(localStorage.getItem("kpss_local_sessions") || "[]")
          .filter((s: any) => s.userId === user.id);

        if (sessions.length > 0) {
          const wrongTags = new Set<string>();
          sessions.forEach((s: any) => {
            s.questions.forEach((q: any) => {
              const ans = s.userAnswers[q.id];
              if (ans && ans !== q.correctAnswer) {
                wrongTags.add(q.subjectTag);
              }
            });
          });

          if (wrongTags.size > 0) {
            const matching = list.filter(q => wrongTags.has(q.subjectTag));
            if (matching.length > 0) {
              matching.sort(() => 0.5 - Math.random());
              const countNum = count || 5;
              const chosen = matching.slice(0, countNum);
              if (chosen.length < countNum) {
                const remaining = list.filter(q => !chosen.some(c => c.id === q.id));
                remaining.sort(() => 0.5 - Math.random());
                chosen.push(...remaining.slice(0, countNum - chosen.length));
              }
              return chosen.map(q => ({ ...q, isAI: true }));
            }
          }
        }
      }
    }

    list.sort(() => 0.5 - Math.random());
    return list.slice(0, count).map(q => ({ ...q, isAI: true }));
  },

  async getPastQuestions(filters: { category?: string; subjectTag?: string; year?: string } = {}): Promise<any[]> {
    let list = [...PAST_QUESTIONS_SEED];
    if (filters.category && filters.category !== "Tümü") {
      list = list.filter(q => q.category === filters.category);
    }
    if (filters.subjectTag && filters.subjectTag !== "Tümü") {
      list = list.filter(q => q.subjectTag === filters.subjectTag);
    }
    if (filters.year && filters.year !== "Tümü") {
      list = list.filter(q => q.year?.toString() === filters.year);
    }
    return list;
  },

  async getPastQuestionsMetadata() {
    const list = [...PAST_QUESTIONS_SEED];
    const categories = Array.from(new Set(list.map(q => q.category)));
    const subjectTags = Array.from(new Set(list.map(q => q.subjectTag)));
    const years = Array.from(new Set(list.map(q => q.year).filter(Boolean)));
    return { categories, subjectTags, years: years as number[] };
  },

  async saveSession(sessionData: any): Promise<ExamSession> {
    const user = getSavedUser();
    if (!user) throw new Error("Giriş yapılması gerekiyor.");

    let correctCount = 0;
    let wrongCount = 0;
    let emptyCount = 0;

    sessionData.questions.forEach((q: any) => {
      const ans = sessionData.userAnswers[q.id];
      if (!ans) {
        emptyCount++;
      } else if (ans === q.correctAnswer) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const netScore = correctCount - (wrongCount / 4);
    const score = Math.max(0, parseFloat(((netScore / sessionData.questions.length) * 100).toFixed(2)));

    const session: ExamSession = {
      id: "session_" + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      examMode: sessionData.examMode,
      category: sessionData.category,
      questions: sessionData.questions,
      userAnswers: sessionData.userAnswers,
      score,
      correctCount,
      wrongCount,
      emptyCount,
      netScore: parseFloat(netScore.toFixed(2)),
      durationSpent: sessionData.durationSpent,
      maxDuration: sessionData.maxDuration,
      createdAt: new Date().toISOString()
    };

    const sessions = JSON.parse(localStorage.getItem("kpss_local_sessions") || "[]");
    sessions.push(session);
    localStorage.setItem("kpss_local_sessions", JSON.stringify(sessions));

    return session;
  },

  async getSessions(): Promise<ExamSession[]> {
    const user = getSavedUser();
    if (!user) throw new Error("Giriş yapılması gerekiyor.");
    const sessions = JSON.parse(localStorage.getItem("kpss_local_sessions") || "[]");
    return sessions
      .filter((s: any) => s.userId === user.id)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getAnalysisReport(): Promise<AnalysisReport> {
    const user = getSavedUser();
    if (!user) throw new Error("Giriş yapılması gerekiyor.");

    const sessions = JSON.parse(localStorage.getItem("kpss_local_sessions") || "[]")
      .filter((s: any) => s.userId === user.id);

    if (sessions.length === 0) {
      throw new Error("Analiz yapılabilecek tamamlanmış sınav bulunamadı.");
    }

    const wrongQuestionsMap: { [subjectTag: string]: { wrongCount: number, totalCount: number, category: string } } = {};

    sessions.forEach((session: any) => {
      session.questions.forEach((q: any) => {
        const uAns = session.userAnswers[q.id];
        const isWrong = uAns && uAns !== "" && uAns !== q.correctAnswer;
        const tag = q.subjectTag || "Genel Konu";
        const cat = q.category || "Genel";

        if (!wrongQuestionsMap[tag]) {
          wrongQuestionsMap[tag] = { wrongCount: 0, totalCount: 0, category: cat };
        }
        wrongQuestionsMap[tag].totalCount++;
        if (isWrong) {
          wrongQuestionsMap[tag].wrongCount++;
        }
      });
    });

    const weakSubjectsList = Object.keys(wrongQuestionsMap)
      .map(tag => {
        const item = wrongQuestionsMap[tag];
        return {
          subjectTag: tag,
          category: item.category,
          wrongCount: item.wrongCount,
          totalQuestions: item.totalCount,
          percentageWrong: item.totalCount > 0 ? Math.round((item.wrongCount / item.totalCount) * 100) : 0
        };
      })
      .filter(item => item.wrongCount > 0)
      .sort((a, b) => b.wrongCount - a.wrongCount);

    const studyPlan = weakSubjectsList.slice(0, 3).map(ws => ({
      subject: ws.subjectTag,
      category: ws.category,
      importance: (ws.wrongCount > 2 ? "Yüksek" : "Orta") as "Yüksek" | "Orta",
      advice: `${ws.subjectTag} konusunda yaptığınız yanlışlar temel bilgi eksikliğine işaret ediyor. Bu konudaki konu anlatımlarını tekrar etmeli ve çıkmış soruları detaylı incelemelisiniz.`,
      keyPoints: [
        "Temel tanımların ve formüllerin gözden geçirilmesi",
        "Çıkmış ÖSYM KPSS sorularının çözülmesi ve analizi",
        "Konuyla ilgili en az 3 farklı test çözülerek pratik yapılması"
      ]
    }));

    const overallSummary = weakSubjectsList.length > 0
      ? `Değerlendirme sonucunuza göre özellikle ${weakSubjectsList.slice(0, 2).map(w => w.subjectTag).join(" ve ")} konularında eksikleriniz bulunmaktadır. Düzenli konu tekrarları ve bol pratik ile netlerinizi hızla artırabilirsiniz.`
      : "Tebrikler! Çözdüğünüz sorularda herhangi bir kritik konu eksiği tespit edilmedi. Bu başarınızı korumak için deneme çözmeye devam edin.";

    return {
      overallSummary,
      weakSubjects: weakSubjectsList.slice(0, 5),
      studyPlan,
      generatedAt: new Date().toISOString()
    };
  }
};

// Wrapper that calls the Express server first, and automatically falls back to client-side localStorage on failure
async function runWithFallback<T>(serverCall: () => Promise<T>, fallbackCall: () => Promise<T>): Promise<T> {
  if (isBackendOffline) {
    return fallbackCall();
  }
  try {
    return await serverCall();
  } catch (error) {
    console.warn("Backend API call failed, switching to offline fallback:", error);
    isBackendOffline = true;
    return fallbackCall();
  }
}

export const api = {
  // Authentication
  async register(username: string) {
    return runWithFallback(
      () => apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ username }),
      }),
      () => localAPI.register(username)
    );
  },

  async login(username: string) {
    return runWithFallback(
      () => apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username }),
      }),
      () => localAPI.login(username)
    );
  },

  async getProfile() {
    return runWithFallback(
      () => apiFetch("/api/auth/profile"),
      () => localAPI.getProfile()
    );
  },

  // Questions
  async getSeededQuestions(limit: number = 10, category?: string): Promise<Question[]> {
    const catParam = category ? `&category=${encodeURIComponent(category)}` : "";
    return runWithFallback(
      () => apiFetch(`/api/questions?limit=${limit}${catParam}`),
      () => localAPI.getSeededQuestions(limit, category)
    );
  },

  async generateAIQuestions(category: string, count: number, personalized?: boolean): Promise<Question[]> {
    return runWithFallback(
      () => apiFetch("/api/questions/generate", {
        method: "POST",
        body: JSON.stringify({ category, count, personalized }),
      }),
      () => localAPI.generateAIQuestions(category, count, personalized)
    );
  },

  // Past Questions Library
  async getPastQuestions(filters: { category?: string; subjectTag?: string; year?: string } = {}): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters.category) params.append("category", filters.category);
    if (filters.subjectTag) params.append("subjectTag", filters.subjectTag);
    if (filters.year) params.append("year", filters.year);
    return runWithFallback(
      () => apiFetch(`/api/past-questions?${params.toString()}`),
      () => localAPI.getPastQuestions(filters)
    );
  },

  async getPastQuestionsMetadata(): Promise<{ categories: string[]; subjectTags: string[]; years: number[] }> {
    return runWithFallback(
      () => apiFetch("/api/past-questions/metadata"),
      () => localAPI.getPastQuestionsMetadata()
    );
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
    return runWithFallback(
      () => apiFetch("/api/sessions/save", {
        method: "POST",
        body: JSON.stringify(sessionData),
      }),
      () => localAPI.saveSession(sessionData)
    );
  },

  async getSessions(): Promise<ExamSession[]> {
    return runWithFallback(
      () => apiFetch("/api/sessions"),
      () => localAPI.getSessions()
    );
  },

  // Deep performance analysis report from Gemini
  async getAnalysisReport(): Promise<AnalysisReport> {
    return runWithFallback(
      () => apiFetch("/api/analysis/report", {
        method: "POST",
      }),
      () => localAPI.getAnalysisReport()
    );
  }
};
