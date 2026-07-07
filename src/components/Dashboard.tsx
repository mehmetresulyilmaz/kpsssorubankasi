import { useState, useEffect } from "react";
import { ExamSession, Question } from "../types";
import { api } from "../utils";
import {
  BookOpen,
  Award,
  Clock,
  History,
  Sparkles,
  Play,
  Flame,
  User,
  LogOut,
  Target,
  FileText,
  BadgeAlert,
  HelpCircle,
  TrendingUp,
  BrainCircuit
} from "lucide-react";
import { motion } from "motion/react";

interface DashboardProps {
  user: { id: string; username: string; email: string };
  onLogout: () => void;
  sessions: ExamSession[];
  onStartExam: (questions: Question[], mode: 'GYGK' | 'Mini' | 'Subject' | 'Personalized', category?: string, isAIGenerated?: boolean) => void;
  onViewSessionDetail: (session: ExamSession) => void;
  onSwitchTab: (tab: "exams" | "charts" | "ai-report") => void;
  activeTab: "exams" | "charts" | "ai-report";
  triggerAnalysis: () => void;
}

export default function Dashboard({
  user,
  onLogout,
  sessions,
  onStartExam,
  onViewSessionDetail,
  onSwitchTab,
  activeTab,
  triggerAnalysis,
}: DashboardProps) {
  // Config state for starting a new exam
  const [examMode, setExamMode] = useState<'GYGK' | 'Mini' | 'Subject' | 'Personalized'>("Mini");
  const [subjectCategory, setSubjectCategory] = useState<string>("Tarih");
  const [questionSource, setQuestionSource] = useState<'seeded' | 'ai'>("ai");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Past Questions Archive states
  const [pastQuestions, setPastQuestions] = useState<any[]>([]);
  const [pastMetadata, setPastMetadata] = useState<{ categories: string[]; subjectTags: string[]; years: number[] }>({
    categories: [],
    subjectTags: [],
    years: []
  });
  const [filterCategory, setFilterCategory] = useState<string>("Tümü");
  const [filterYear, setFilterYear] = useState<string>("Tümü");
  const [expandedPastQId, setExpandedPastQId] = useState<string | null>(null);

  // Statistics calculation
  const totalExams = sessions.length;
  const avgScore = totalExams > 0 
    ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / totalExams) 
    : 0;
  const avgNet = totalExams > 0
    ? parseFloat((sessions.reduce((sum, s) => sum + s.netScore, 0) / totalExams).toFixed(2))
    : 0;

  // Streak calculator
  const calculateStreak = () => {
    if (sessions.length === 0) return 0;
    // For simplicity, count the number of distinct days with tests completed
    const days = new Set(sessions.map(s => new Date(s.createdAt).toDateString()));
    return days.size;
  };
  const streak = calculateStreak();

  const handleStartNewExam = async () => {
    setLoading(true);
    setError("");
    try {
      let questions: Question[] = [];
      const isPersonalized = examMode === "Personalized";
      const count = examMode === "Mini" ? 10 : examMode === "GYGK" ? 30 : examMode === "Personalized" ? 10 : questionCount;
      const cat = examMode === "Subject" ? subjectCategory : "Tümü";

      if (isPersonalized) {
        // AI question generator with personalization enabled
        questions = await api.generateAIQuestions("Tümü", 10, true);
      } else if (questionSource === "ai") {
        // Query Gemini API
        questions = await api.generateAIQuestions(cat, count);
      } else {
        // Load pre-seeded questions
        questions = await api.getSeededQuestions(count, cat);
      }

      if (questions.length === 0) {
        throw new Error("Sınav soruları yüklenemedi. Lütfen tekrar deneyin.");
      }

      onStartExam(questions, examMode, cat, isPersonalized || questionSource === "ai");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Sınav başlatılırken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const [loadingPast, setLoadingPast] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const meta = await api.getPastQuestionsMetadata();
        setPastMetadata(meta);
      } catch (err) {
        console.error("Geçmiş sorular meta verisi yüklenirken hata:", err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchPastQuestions = async () => {
      setLoadingPast(true);
      try {
        const qList = await api.getPastQuestions({
          category: filterCategory === "Tümü" ? undefined : filterCategory,
          year: filterYear === "Tümü" ? undefined : filterYear
        });
        setPastQuestions(qList);
      } catch (err) {
        console.error("Geçmiş sorular yüklenirken hata:", err);
      } finally {
        setLoadingPast(false);
      }
    };
    fetchPastQuestions();
  }, [filterCategory, filterYear]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="bg-white border border-stone-200/60 rounded-[28px] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative overflow-hidden">
        <div className="absolute -top-12 -right-12 p-24 bg-gradient-to-br from-stone-100 to-amber-50/20 rounded-full opacity-60 blur-3xl"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-stone-100 font-bold text-lg border border-slate-800 shadow-sm select-none">
            {user.username ? user.username[0].toUpperCase() : "K"}
          </div>
          <div>
            <h1 className="font-display font-black text-xl text-slate-900 tracking-tight">
              Hoş Geldiniz, {user.username}!
            </h1>
            <p className="text-xs text-slate-400 font-medium font-mono">{user.email || "Sınav Simülatörü Girişi"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={() => {
              onSwitchTab("ai-report");
              triggerAnalysis();
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-stone-100 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer hover:scale-[1.01]"
          >
            <Sparkles className="h-4 w-4 text-amber-400 animate-pulse fill-amber-400/10" /> AI Çalışma Rehberi
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-3.5 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-stone-900 font-bold text-xs rounded-xl border border-stone-200/80 transition-all cursor-pointer"
            title="Çıkış Yap"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Stats Grid with Vibrant borders and backgrounds */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-stone-200/60 hover:border-stone-400 rounded-2xl flex items-center gap-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)] transition-all duration-300">
          <div className="p-3 bg-stone-50 text-slate-800 rounded-xl border border-stone-200/50">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono font-black block uppercase tracking-wide">Tamamlanan Sınav</span>
            <span className="text-xl font-black text-slate-800 font-mono">{totalExams}</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-stone-200/60 hover:border-stone-400 rounded-2xl flex items-center gap-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)] transition-all duration-300">
          <div className="p-3 bg-stone-50 text-slate-800 rounded-xl border border-stone-200/50">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono font-black block uppercase tracking-wide">Net Ortalaması</span>
            <span className="text-xl font-black text-slate-800 font-mono">{avgNet} Net</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-stone-200/60 hover:border-stone-400 rounded-2xl flex items-center gap-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)] transition-all duration-300">
          <div className="p-3 bg-stone-50 text-slate-800 rounded-xl border border-stone-200/50">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono font-black block uppercase tracking-wide">Başarı Skoru</span>
            <span className="text-xl font-black text-slate-800 font-mono">%{avgScore}</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-stone-200/60 hover:border-stone-400 rounded-2xl flex items-center gap-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)] transition-all duration-300">
          <div className="p-3 bg-stone-50 text-slate-800 rounded-xl border border-stone-200/50">
            <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono font-black block uppercase tracking-wide">Çalışma Serisi</span>
            <span className="text-xl font-black text-slate-800 font-mono">{streak} Gün</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Section: Exam Configuration (7 columns) */}
        <div className="lg:col-span-7 bg-white border border-stone-200/60 rounded-[28px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6">
          <div>
            <h2 className="font-display font-black text-lg text-slate-900 flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-slate-900" /> Yeni Sınav Oluşturucu
            </h2>
            <p className="text-xs text-slate-400 font-medium">KPSS şartlarına uygun zamanlayıcı ve net hesaplama modları</p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
              <BadgeAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Exam Mode selection with Vibrant customized cards */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2.5 font-mono uppercase tracking-wide">
                1. Sınav Modu Seçin
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setExamMode("Mini")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 group ${
                    examMode === "Mini"
                      ? "border-slate-800 bg-stone-50 text-slate-950 shadow-xs"
                      : "border-stone-200/80 hover:border-stone-400 hover:bg-stone-50/20 text-slate-700 bg-white"
                  }`}
                >
                  <span className="font-black text-xs font-display text-slate-900">Mini Pratik</span>
                  <span className="text-[10px] opacity-80 font-medium text-slate-500">10 Karışık Soru</span>
                </button>

                <button
                  onClick={() => setExamMode("GYGK")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 group ${
                    examMode === "GYGK"
                      ? "border-slate-800 bg-stone-50 text-slate-950 shadow-xs"
                      : "border-stone-200/80 hover:border-stone-400 hover:bg-stone-50/20 text-slate-700 bg-white"
                  }`}
                >
                  <span className="font-black text-xs font-display text-slate-900">GY-GK Denemesi</span>
                  <span className="text-[10px] opacity-80 font-medium text-slate-500">30 Sınav Sorusu</span>
                </button>

                <button
                  onClick={() => setExamMode("Subject")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 group ${
                    examMode === "Subject"
                      ? "border-slate-800 bg-stone-50 text-slate-950 shadow-xs"
                      : "border-stone-200/80 hover:border-stone-400 hover:bg-stone-50/20 text-slate-700 bg-white"
                  }`}
                >
                  <span className="font-black text-xs font-display text-slate-900">Konu Odaklı</span>
                  <span className="text-[10px] opacity-80 font-medium text-slate-500">Ders Seçmeli</span>
                </button>

                <button
                  onClick={() => setExamMode("Personalized")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 group ${
                    examMode === "Personalized"
                      ? "border-slate-800 bg-stone-50 text-slate-950 shadow-xs"
                      : "border-stone-200/80 hover:border-stone-400 hover:bg-stone-50/20 text-slate-700 bg-white"
                  }`}
                >
                  <span className="font-black text-xs font-display text-slate-900 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse shrink-0" /> Yapay Zeka
                  </span>
                  <span className="text-[10px] opacity-80 font-medium text-slate-500">Hatalara Özel</span>
                </button>
              </div>
            </div>

            {/* Subject-specific choices (Conditional) */}
            {examMode === "Subject" && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 font-mono uppercase tracking-wide">
                    Çalışılacak KPSS Dersi
                  </label>
                  <select
                    value={subjectCategory}
                    onChange={(e) => setSubjectCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 focus:bg-white"
                  >
                    <option value="Türkçe">Türkçe (Dil Bilgisi & Paragraf)</option>
                    <option value="Matematik">Matematik & Geometri</option>
                    <option value="Tarih">Tarih (Osmanlı, İnkılap, vb.)</option>
                    <option value="Coğrafya">Coğrafya (Türkiye Coğrafyası)</option>
                    <option value="Vatandaşlık">Vatandaşlık (Hukuk & Anayasa)</option>
                    <option value="Güncel Bilgiler">Güncel Bilgiler (2025 - 2026 Gündemi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 font-mono uppercase tracking-wide">
                    Soru Sayısı
                  </label>
                  <div className="flex gap-2">
                    {[5, 10, 15, 20].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setQuestionCount(num)}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          questionCount === num
                            ? "bg-slate-900 border-slate-900 text-stone-100"
                            : "bg-white border-stone-200/80 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Soru Kaynağı Modu: Seeded vs Live Gemini */}
            {examMode !== "Personalized" ? (
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2.5 font-mono uppercase tracking-wide">
                  2. Soru Üretim Modu
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setQuestionSource("ai")}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      questionSource === "ai"
                        ? "border-slate-800 bg-stone-50 text-slate-950 shadow-xs"
                        : "border-stone-200/80 hover:bg-stone-50/20 text-slate-600 bg-white"
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${questionSource === "ai" ? "bg-slate-900 text-stone-100" : "bg-stone-100 text-slate-600"}`}>
                      <Sparkles className="h-4 w-4 animate-pulse text-amber-500" />
                    </div>
                    <div>
                      <span className="font-bold text-xs font-display block text-slate-900">Gemini Yapay Zeka Motoru</span>
                      <span className="text-[10px] opacity-80 block mt-0.5 font-medium leading-relaxed text-slate-500">Her oturumda sürekli değişen, güncel olayları takip eden ve KPSS standartlarında benzersiz sorular üretir.</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setQuestionSource("seeded")}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      questionSource === "seeded"
                        ? "border-slate-800 bg-stone-50 text-slate-950 shadow-xs"
                        : "border-stone-200/80 hover:bg-stone-50/20 text-slate-600 bg-white"
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${questionSource === "seeded" ? "bg-slate-900 text-stone-100" : "bg-stone-100 text-slate-600"}`}>
                      <HelpCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs font-display block text-slate-900">ÖSYM Soru Havuzu</span>
                      <span className="text-[10px] opacity-80 block mt-0.5 font-medium leading-relaxed text-slate-500">Sistemde önceden hazırlanmış, ÖSYM formatındaki klasik ve en çok çıkan soru bankasını kullanır (Anında Başlar).</span>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-stone-50 border border-stone-200/80 rounded-2xl flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 text-slate-900">
                  <Sparkles className="h-4 w-4 animate-pulse shrink-0 text-amber-500" />
                  <span className="font-bold text-xs font-display">Akıllı Kişiselleştirme Modu</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  {sessions.length === 0 ? (
                    "Henüz çözülmüş deneme sınavınız bulunmuyor. Bu modda size karışık KPSS soruları yöneltilecektir. Soruları çözüp hatalarınızı analiz ettikçe, Gemini zayıf olduğunuz alt konuları tespit edecek ve tamamen size özel sorular üretecektir!"
                  ) : (
                    "Sistem zayıf olduğunuz ders ve alt konuları (Örn: Osmanlı Devleti, Türkiye Coğrafyası vb.) geçmiş sınav sonuçlarınızdan otomatik olarak analiz etti. Gemini şimdi sadece eksik olduğunuz bu konularda 10 adet özel soru hazırlayacak!"
                  )}
                </p>
              </motion.div>
            )}

            {/* Start Button styled in ultra vibrant high-contrast style */}
            <button
              onClick={handleStartNewExam}
              disabled={loading}
              className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-mono text-[11px] font-bold tracking-widest uppercase py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="font-mono tracking-widest uppercase text-[10px]">{questionSource === "ai" ? "GEMİNİ SORU HAZIRLIYOR..." : "SORULAR GETİRİLİYOR..."}</span>
                </>
              ) : (
                <>
                  SINAVI BAŞLAT (SÜRE BAŞLAR) <Play className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Section: Past Exam History (5 columns) with Vibrant Palette styles */}
        <div className="lg:col-span-5 bg-white border border-stone-200/60 rounded-[28px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-4">
          <div>
            <h2 className="font-display font-black text-slate-900 text-sm flex items-center gap-1.5">
              <History className="h-4 w-4 text-slate-500" /> Sınav Geçmişim
            </h2>
            <p className="text-xs text-slate-400 font-medium">Daha önce tamamladığınız KPSS denemeleri</p>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {sessions.length === 0 ? (
              <div className="p-8 border border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center text-center text-slate-400 gap-2">
                <FileText className="h-8 w-8 text-stone-300" />
                <span className="text-xs font-bold text-slate-700">Henüz hiçbir sınav çözmediniz.</span>
                <span className="text-[10px] text-slate-400 max-w-[200px] leading-relaxed">Yukarıdaki soru motoruyla ilk KPSS denemenize hemen başlayın!</span>
              </div>
            ) : (
              sessions.map((session) => {
                const dateStr = new Date(session.createdAt).toLocaleDateString("tr-TR", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <div
                    key={session.id}
                    onClick={() => onViewSessionDetail(session)}
                    className="p-3.5 border border-stone-200 bg-stone-50/40 rounded-xl flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50 hover:border-stone-400 hover:shadow-xs transition-all group"
                  >
                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 font-display">
                          {session.examMode === "GYGK" 
                            ? "Genel Yetenek Genel Kültür" 
                            : session.examMode === "Mini" 
                              ? "Mini Pratik Test" 
                              : `${session.category}`}
                        </span>
                        {session.questions.some(q => q.isAI) && (
                          <span className="px-1.5 py-0.5 bg-stone-100 text-slate-700 text-[8px] rounded-sm font-semibold tracking-wide font-mono uppercase border border-stone-200">AI</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="font-mono">{dateStr}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 font-mono">
                          <Clock className="h-3 w-3" /> {Math.floor(session.durationSpent / 60)}dk {session.durationSpent % 60}sn
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-slate-900 font-mono">
                        {session.netScore} Net
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold font-mono">
                        {session.correctCount}D {session.wrongCount}Y
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Brand-New Section: ÖSYM Geçmiş Sınav Soruları Kütüphanesi */}
      <div className="bg-white border border-stone-200/60 rounded-[28px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-black text-lg text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-slate-900" /> ÖSYM Geçmiş Sınav Soruları Arşivi
            </h2>
            <p className="text-xs text-slate-400 font-medium">Derslere ve yıllara göre ayrıştırılmış resmi KPSS çıkmış soruları ve detaylı çözümleri</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-mono">Ders Seç</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 cursor-pointer"
              >
                <option value="Tümü">Tüm Dersler</option>
                {pastMetadata.categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-mono">Yıl Seç</span>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 cursor-pointer"
              >
                <option value="Tümü">Tüm Yıllar</option>
                {pastMetadata.years.map(yr => (
                  <option key={yr} value={yr.toString()}>{yr}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loadingPast ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
            <svg className="animate-spin h-6 w-6 text-slate-900" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs font-mono">Arşiv Soruları Yükleniyor...</span>
          </div>
        ) : pastQuestions.length === 0 ? (
          <div className="py-12 border border-dashed border-stone-200 rounded-2xl text-center text-slate-400 flex flex-col items-center gap-2">
            <HelpCircle className="h-8 w-8 text-stone-200" />
            <span className="text-xs font-bold text-slate-700">Seçilen kriterlerde çıkmış soru bulunamadı.</span>
            <span className="text-[10px] text-slate-400">Filtreleri değiştirerek farklı kombinasyonları deneyebilirsiniz.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastQuestions.map((q) => {
              const isExpanded = expandedPastQId === q.id;
              return (
                <div
                  key={q.id}
                  className={`border rounded-2xl p-5 transition-all ${
                    isExpanded 
                      ? "border-slate-900 bg-stone-50/40 shadow-xs" 
                      : "border-stone-200/60 hover:border-stone-400 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-stone-100 text-slate-800 text-[10px] font-black rounded-md font-mono border border-stone-200/40">
                        {q.year} KPSS
                      </span>
                      <span className="px-2 py-0.5 bg-stone-100 text-slate-600 text-[10px] font-bold rounded-md">
                        {q.category}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold font-mono">
                      {q.subjectTag}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 leading-relaxed mb-4">
                    {q.questionText}
                  </p>

                  <button
                    onClick={() => setExpandedPastQId(isExpanded ? null : q.id)}
                    className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      isExpanded 
                        ? "bg-slate-900 text-stone-100 shadow-xs" 
                        : "bg-stone-50 hover:bg-stone-100 text-slate-700 border border-stone-200/80"
                    }`}
                  >
                    {isExpanded ? "Soruyu Kapat" : "Soruyu ve Çözümü İncele"}
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 pt-4 border-t border-stone-100 space-y-4"
                    >
                      <div className="space-y-2">
                        {["A", "B", "C", "D", "E"].map((opt) => {
                          const optionText = q.options[opt];
                          const isCorrect = q.correctAnswer === opt;
                          return (
                            <div
                              key={opt}
                              className={`p-3 rounded-xl border text-xs font-medium flex items-start gap-2.5 transition-all ${
                                isCorrect 
                                  ? "bg-emerald-50/50 border-emerald-500/30 text-emerald-950 shadow-xs" 
                                  : "bg-stone-50/40 border-stone-100/50 text-slate-700"
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold font-mono text-[10px] shrink-0 select-none ${
                                isCorrect 
                                  ? "bg-emerald-500 text-white" 
                                  : "bg-stone-200 text-slate-700"
                              }`}>
                                {opt}
                              </span>
                              <span className="leading-relaxed">{optionText}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-amber-50/30 border border-dashed border-amber-300/60 rounded-xl p-4 space-y-1.5">
                        <span className="text-[9px] font-black text-amber-800 font-mono uppercase tracking-wider block">ÖSYM ÇÖZÜM ANALİZİ</span>
                        <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                          {q.explanation || "Bu çıkmış sorunun detaylı çözümü müfredata uygun olarak hazırlanmıştır."}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
