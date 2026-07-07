import { useState, useEffect } from "react";
import { getSavedUser, clearUser, api } from "./utils";
import { Question, ExamSession, AnalysisReport } from "./types";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ExamScreen from "./components/ExamScreen";
import ExamResult from "./components/ExamResult";
import WeakSubjectAnalysisScreen from "./components/WeakSubjectAnalysisScreen";
import PerformanceCharts from "./components/PerformanceCharts";
import { 
  GraduationCap, 
  Sparkles, 
  FileText, 
  BarChart3, 
  BrainCircuit, 
  Compass, 
  ArrowLeft 
} from "lucide-react";

const ALL_RSS_ITEMS = [
  "UNESCO Dünya Mirası Listesi'ne Türkiye'den yeni eklenen eser: Gordion Antik Kenti (2023).",
  "2024 Avrupa Futbol Şampiyonası ev sahibi: Almanya.",
  "Türkiye'nin yerli otomobili Togg'un ilk seri üretim modeli: T10X.",
  "Nobel Barış Ödülü 2023 sahibi: Nergis Muhammedi.",
  "2026 yılı Kültür Turizm Bakanlığı KPSS Genel Kültür Güncel Gelişmeler test müfredatı aktiftir.",
  "Türkiye'nin ilk astronotu Alper Gezeravcı, Ax-3 misyonu ile uzay yolculuğunu başarıyla tamamladı.",
  "2024 yılı Türk Dünyası Kültür Başkenti olarak Azerbaycan'ın Şuşa şehri seçilmiştir.",
  "UNESCO 2024 yılını Divanü Lugati't-Türk'ün yazılışının 950. yılı anma yılı ilan etmiştir.",
  "Türkiye'nin ilk yerli ve milli haberleşme uydusu Türksat 6A, SpaceX Falcon 9 ile uzaya fırlatıldı.",
  "2024 Paris Yaz Olimpiyatları'nda Yusuf Dikeç'in eli cebinde yaptığı atış dünya çapında viral oldu.",
  "Dünyanın en derin ikinci kanyonu olan Valla Kanyonu Kastamonu sınırları içerisinde yer almaktadır.",
  "Şairler Şairi olarak bilinen ve 'Çile' eserinin yazarı ünlü şairimiz Necip Fazıl Kısakürek'tir.",
  "Türk tarihinin ilk yazılı belgeleri kabul edilen Orhun Abideleri günümüzde Moğolistan sınırlarında yer alır.",
  "İstiklal Marşımızın ilk kez yayınlandığı gazete Açık Söz, ilk kez yayınlandığı dergi ise Sebilürreşad'dır.",
  "Cumhuriyet tarihinin ilk kadın bakanı Türkan Akyol, ilk kadın başbakanı ise Tansu Çiller'dir."
];

export default function App() {
  const [tickerItems] = useState(() => {
    return [...ALL_RSS_ITEMS].sort(() => 0.5 - Math.random()).slice(0, 8);
  });
  const [user, setUser] = useState<{ id: string; username: string; email: string } | null>(null);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Exam States
  const [isExamActive, setIsExamActive] = useState(false);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [examMode, setExamMode] = useState<'GYGK' | 'Mini' | 'Subject'>("Mini");
  const [examCategory, setExamCategory] = useState<string | undefined>(undefined);

  // Reviewing specific exam detail state
  const [viewingSession, setViewingSession] = useState<ExamSession | null>(null);

  // Dashboard active tab
  const [activeTab, setActiveTab] = useState<"exams" | "charts" | "ai-report">("exams");

  // Gemini performance analysis states
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Load user profile and fetch exam history initially
  useEffect(() => {
    const saved = getSavedUser();
    if (saved) {
      setUser(saved);
      fetchSessionHistory(saved.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchSessionHistory = async (userId: string) => {
    try {
      const history = await api.getSessions();
      setSessions(history);
    } catch (error) {
      console.error("Sınav geçmişi yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (loggedInUser: { id: string; username: string; email: string }) => {
    setUser(loggedInUser);
    fetchSessionHistory(loggedInUser.id);
  };

  const handleLogout = () => {
    clearUser();
    setUser(null);
    setSessions([]);
    setViewingSession(null);
    setAnalysisReport(null);
    setIsExamActive(false);
  };

  // Start exam from Dashboard parameters
  const handleStartExam = (
    questions: Question[],
    mode: 'GYGK' | 'Mini' | 'Subject',
    category?: string
  ) => {
    setExamQuestions(questions);
    setExamMode(mode);
    setExamCategory(category);
    setIsExamActive(true);
    setViewingSession(null);
  };

  // Exam completion submission
  const handleFinishExam = async (
    userAnswers: { [questionId: string]: 'A' | 'B' | 'C' | 'D' | 'E' | '' },
    durationSpent: number
  ) => {
    if (!user) return;
    setLoading(true);
    try {
      // Save exam to server
      const savedSession = await api.saveSession({
        examMode,
        category: examCategory,
        questions: examQuestions,
        userAnswers,
        durationSpent,
        maxDuration: examQuestions.length * 90 // 90 seconds per question limit
      });

      // Update sessions history
      setSessions(prev => [savedSession, ...prev]);
      
      // Stop exam and open result view
      setIsExamActive(false);
      setViewingSession(savedSession);
    } catch (error) {
      console.error("Sınav kaydedilirken hata:", error);
      alert("Sınav sonucu kaydedilemedi. Panel sayfasına dönülüyor.");
      setIsExamActive(false);
    } finally {
      setLoading(false);
    }
  };

  // Call Gemini to generate a fresh analytical evaluation report
  const handleRunAIAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      const report = await api.getAnalysisReport();
      setAnalysisReport(report);
      setActiveTab("ai-report");
      setViewingSession(null); // Return to main tabs layout
    } catch (error) {
      console.error("AI analizi alınırken hata:", error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-500 font-medium">
          <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-mono">KPSS Soru Motoru Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Calculate dynamic stats for Header and components
  const totalExams = sessions.length;
  const avgScore = totalExams > 0 
    ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / totalExams) 
    : 0;
  const avgNet = totalExams > 0
    ? parseFloat((sessions.reduce((sum, s) => sum + s.netScore, 0) / totalExams).toFixed(2))
    : 0;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-800 font-sans antialiased flex flex-col">
      {/* Sleek Header Navigation Bar */}
      <header className="bg-white border-b border-stone-200/80 sticky top-0 z-40 px-4 sm:px-6 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 text-stone-100 rounded-xl flex items-center justify-center font-display font-black text-xl shadow-xs select-none shrink-0">
              K
            </div>
            <div>
              <span className="font-display font-black text-sm sm:text-base tracking-tight text-slate-900 block">
                KPSS Soru Motoru <span className="font-light opacity-80 text-xs">v2.4</span>
              </span>
              <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-wider">
                YAPAY ZEKA DESTEKLİ AKADEMİ
              </span>
            </div>
          </div>

          {/* Tab buttons (Only show when NOT actively solving an exam) */}
          {!isExamActive && (
            <div className="flex items-center gap-1 bg-stone-100/80 p-1 rounded-xl border border-stone-200/40">
              <button
                onClick={() => {
                  setActiveTab("exams");
                  setViewingSession(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "exams" && !viewingSession
                    ? "bg-white text-slate-950 shadow-xs border border-stone-200/50"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <FileText className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Sınav Merkezi</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("charts");
                  setViewingSession(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "charts" && !viewingSession
                    ? "bg-white text-slate-950 shadow-xs border border-stone-200/50"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Performans Paneli</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("ai-report");
                  setViewingSession(null);
                  if (!analysisReport && sessions.length > 0) {
                    handleRunAIAnalysis();
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "ai-report" && !viewingSession
                    ? "bg-white text-slate-950 shadow-xs border border-stone-200/50"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500/10" /> <span className="hidden sm:inline">Yapay Zeka Analizi</span>
              </button>
            </div>
          )}

          {/* Header User Profile Section */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex bg-stone-100 px-3.5 py-1.5 rounded-full border border-stone-200/80 items-center gap-1.5 text-xs text-slate-600">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Net Ortalaması:</span>
              <span className="text-slate-900 font-bold font-mono">{avgNet} Net</span>
            </div>
            
            <div className="flex items-center gap-3 pl-4 border-l border-stone-200/80">
              <div className="text-right hidden md:block">
                <p className="text-slate-900 text-xs font-bold leading-none">{user.username}</p>
                <p className="text-slate-400 text-[10px] mt-1.5 font-semibold">Gelişim Oranı: %{avgScore}</p>
              </div>
              <div className="w-10 h-10 bg-slate-900 rounded-full border border-slate-800 flex items-center justify-center text-stone-100 font-bold font-mono text-sm shadow-xs shrink-0 select-none">
                {getInitials(user.username)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-20">
        {isExamActive ? (
          /* Active Exam taking Screen */
          <ExamScreen
            questions={examQuestions}
            examMode={examMode}
            category={examCategory}
            onFinishExam={handleFinishExam}
          />
        ) : viewingSession ? (
          /* Detailed Exam review / Result Page */
          <div className="space-y-4">
            <button
              onClick={() => setViewingSession(null)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer pb-2"
            >
              <ArrowLeft className="h-4 w-4" /> Sonuçlardan Sınav Merkezine Geri Dön
            </button>
            <ExamResult
              session={viewingSession}
              sessions={sessions}
              onGoHome={() => setViewingSession(null)}
              onRunAIAnalysis={handleRunAIAnalysis}
              analysisLoading={analysisLoading}
            />
          </div>
        ) : (
          /* Main Tab sections views */
          <div className="space-y-6">
            {activeTab === "exams" && (
              <Dashboard
                user={user}
                onLogout={handleLogout}
                sessions={sessions}
                onStartExam={handleStartExam}
                onViewSessionDetail={(session) => setViewingSession(session)}
                onSwitchTab={setActiveTab}
                activeTab={activeTab}
                triggerAnalysis={handleRunAIAnalysis}
              />
            )}

            {activeTab === "charts" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-800 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600" /> Detaylı Performans Raporları
                  </h2>
                  <p className="text-xs text-slate-400">Çözdüğünüz tüm deneme sınavlarının istatistiksel gelişim analizi</p>
                </div>
                <PerformanceCharts sessions={sessions} />
              </div>
            )}

            {activeTab === "ai-report" && (
              <div className="space-y-6">
                {analysisReport ? (
                  <WeakSubjectAnalysisScreen
                    report={analysisReport}
                    onRefresh={handleRunAIAnalysis}
                    loading={analysisLoading}
                  />
                ) : (
                  <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[350px]">
                    <div className="p-4 bg-purple-50 text-purple-600 rounded-full animate-bounce">
                      <Sparkles className="h-8 w-8" />
                    </div>
                    <div className="space-y-1.5 max-w-sm">
                      <h3 className="font-display font-bold text-slate-800 text-sm">Yapay Zeka Analizi Bekleniyor</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Yapay zekanın hatalı cevaplarınızı analiz ederek size özel çalışma rehberi çıkarabilmesi için en az bir deneme tamamlamış olmalısınız.
                      </p>
                    </div>

                    {sessions.length > 0 ? (
                      <button
                        onClick={handleRunAIAnalysis}
                        disabled={analysisLoading}
                        className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md disabled:bg-slate-300"
                      >
                        {analysisLoading ? "Analiz Çıkartılıyor..." : "Analiz Raporunu Şimdi Çıkart"}
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab("exams")}
                        className="mt-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Hemen İlk Sınava Başla
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Bar: Current Events Ticker & Branding Sub-Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200/80 flex flex-col select-none shadow-[0_-4px_12px_rgba(0,0,0,0.015)]">
        {/* Row 1: RSS Ticker */}
        <div className="h-10 flex items-center overflow-hidden border-b border-stone-100">
          <div className="bg-slate-950 h-full flex items-center px-4 shrink-0 z-10">
            <span className="text-stone-100 text-[10px] font-black uppercase tracking-wider font-mono">GÜNCEL BİLGİLER</span>
          </div>
          <div className="flex-1 overflow-hidden relative flex items-center h-full bg-white">
            <div className="animate-ticker italic text-[11px] text-slate-500 font-medium pl-4">
              {tickerItems.map((item, idx) => (
                <span key={`orig-${idx}`}>• {item}</span>
              ))}
              {/* Duplicate list for seamless infinite looping */}
              {tickerItems.map((item, idx) => (
                <span key={`dup-${idx}`}>• {item}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Branding & Status Bar */}
        <div className="h-8 bg-stone-50 px-4 flex items-center justify-between text-[10px] font-semibold text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>KPSS Soru Bankası Canlı Sistem</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500 animate-pulse shrink-0" />
            <a 
              href="https://fuzulimedya.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-slate-950 transition-colors flex items-center gap-0.5 text-slate-600"
            >
              Created by <span className="font-bold text-slate-950 underline decoration-stone-300 hover:decoration-slate-950 underline-offset-2">fuzuli medya</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
