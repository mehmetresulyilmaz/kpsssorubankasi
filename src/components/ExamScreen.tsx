import { useState, useEffect } from "react";
import { Question } from "../types";
import { Clock, ChevronLeft, ChevronRight, CheckCircle, Flag, HelpCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ExamScreenProps {
  questions: Question[];
  examMode: 'GYGK' | 'Mini' | 'Subject' | 'Personalized';
  category?: string;
  onFinishExam: (userAnswers: { [questionId: string]: 'A' | 'B' | 'C' | 'D' | 'E' | '' }, durationSpent: number) => void;
}

export default function ExamScreen({ questions, examMode, category, onFinishExam }: ExamScreenProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: string]: 'A' | 'B' | 'C' | 'D' | 'E' | '' }>({});
  const [flags, setFlags] = useState<{ [questionId: string]: boolean }>({});
  
  // Set duration: GYGK (30 questions = 45 mins / 2700s), Mini/Subject (10 questions = 15 mins / 900s)
  const defaultDuration = questions.length * 90; // 90 seconds per question
  const [timeLeft, setTimeLeft] = useState(defaultDuration);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      // Auto-submit when time is up
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionKey: 'A' | 'B' | 'C' | 'D' | 'E') => {
    const currentQ = questions[currentIdx];
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: prev[currentQ.id] === optionKey ? '' : optionKey // Toggle answer off if selected again
    }));
  };

  const handleClearAnswer = () => {
    const currentQ = questions[currentIdx];
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: ''
    }));
  };

  const handleToggleFlag = () => {
    const currentQ = questions[currentIdx];
    setFlags(prev => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = () => {
    const durationSpent = defaultDuration - timeLeft;
    onFinishExam(userAnswers, durationSpent);
  };

  const currentQ = questions[currentIdx];
  const selectedAns = userAnswers[currentQ?.id] || '';
  const isFlagged = flags[currentQ?.id] || false;

  // Stat computations
  const totalQuestions = questions.length;
  const answeredCount = Object.values(userAnswers).filter(a => a !== '').length;
  const progressPercent = Math.round(((currentIdx + 1) / totalQuestions) * 100);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 relative select-none">
      {/* Top Bar Status Info */}
      <div className="bg-white border border-stone-200/60 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 bg-stone-100 border border-stone-200 text-slate-800 text-xs font-bold rounded-lg font-mono">
            {examMode === "GYGK" 
              ? "GY-GK Genel Denemesi" 
              : examMode === "Mini" 
                ? "KPSS Mini Pratik" 
                : examMode === "Personalized"
                  ? "Yapay Zeka (Kişiye Özel Sınav)"
                  : `Konu: ${category}`}
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 font-mono font-bold">
            Soru {currentIdx + 1} / {totalQuestions}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Answer counter */}
          <div className="text-xs text-slate-500 font-bold font-mono hidden sm:block">
            Cevaplanan: <span className="text-slate-900 font-black">{answeredCount}</span>/{totalQuestions}
          </div>

          {/* Countdown timer with alert theme if time < 2 mins */}
          <div className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border font-mono font-black text-xs ${
            timeLeft < 120 
              ? "bg-rose-50 border-rose-100 text-rose-700 animate-pulse" 
              : "bg-stone-50 border border-stone-200 text-slate-700"
          }`}>
            <Clock className="h-4 w-4 text-slate-500" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-stone-100 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Sınavı Bitir
          </button>
        </div>
      </div>

      {/* Progress tracker */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shrink-0">
        <div className="bg-slate-900 h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
      </div>

      {/* Main Grid: Navigator Sidebar (left/top) + Question Card (right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Navigation Map (3 columns) */}
        <div className="md:col-span-3 bg-white border border-stone-200/60 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-4 order-last md:order-first">
          <div>
            <h3 className="text-xs font-black font-mono text-slate-500 uppercase tracking-wide">Soru Haritası</h3>
            <p className="text-[10px] text-slate-400 font-medium">Tıklayarak istediğiniz soruya geçebilirsiniz</p>
          </div>

          {/* Navigator Grid */}
          <div className="grid grid-cols-5 md:grid-cols-4 gap-2">
            {questions.map((q, index) => {
              const ans = userAnswers[q.id];
              const flagged = flags[q.id];
              const isCurrent = index === currentIdx;

              let style = "bg-stone-50/60 border-stone-200/50 text-slate-600 hover:bg-stone-100/50";
              if (ans && ans !== '') {
                style = "bg-slate-900 border-slate-900 text-stone-100 hover:bg-slate-800";
              }
              if (flagged) {
                style = "bg-amber-400 border-amber-400 text-slate-900 hover:bg-amber-500";
              }
              if (isCurrent) {
                style += " ring-2 ring-slate-800 ring-offset-2";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(index)}
                  className={`aspect-square w-full rounded-xl border text-xs font-black font-mono transition-all flex items-center justify-center cursor-pointer ${style}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {/* Map Legends */}
          <div className="pt-2 border-t border-stone-100 space-y-2 text-[10px] text-slate-500 font-bold font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-slate-900 rounded-md inline-block"></span>
              <span>Cevaplandı</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-amber-400 rounded-md inline-block"></span>
              <span>Gözden Geçir</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-stone-50 border border-stone-200 rounded-md inline-block"></span>
              <span>Boş Bırakıldı</span>
            </div>
          </div>
        </div>

        {/* Question Panel (9 columns) */}
        <div className="md:col-span-9 bg-white border border-stone-200/60 rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col gap-6 relative min-h-[460px]">
          {/* Question Metadata Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-stone-100 border border-stone-200 text-slate-800 text-[10px] rounded-md font-bold font-mono uppercase shrink-0">
                {currentQ.category}
              </span>
              <span className="text-xs text-slate-400 font-bold">
                {currentQ.subjectTag}
              </span>
            </div>

            <button
              onClick={handleToggleFlag}
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                isFlagged 
                  ? "bg-amber-50 border-amber-200 text-amber-700" 
                  : "bg-white border-stone-200/80 text-slate-500 hover:bg-stone-50"
              }`}
            >
              <Flag className={`h-3.5 w-3.5 ${isFlagged ? "fill-amber-500 text-amber-500" : ""}`} />
              <span>{isFlagged ? "İşaretli" : "İşaretle"}</span>
            </button>
          </div>

          {/* Question text with AnimatePresence */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Question Paragraph */}
                <h2 className="text-slate-800 text-sm sm:text-base leading-relaxed font-bold font-sans whitespace-pre-line">
                  {currentQ.questionText}
                </h2>

                {/* Question Options A-E */}
                <div className="space-y-2.5">
                  {(['A', 'B', 'C', 'D', 'E'] as const).map((opt) => {
                    const optText = currentQ.options[opt];
                    const isSelected = selectedAns === opt;

                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelectOption(opt)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer group ${
                          isSelected
                            ? "border-slate-900 bg-stone-50 text-slate-950 shadow-xs"
                            : "border-stone-200/60 hover:border-stone-400 bg-white text-slate-700"
                        }`}
                      >
                        {/* Option Identifier Badge */}
                        <span className={`h-6 w-6 rounded-lg border flex items-center justify-center font-mono font-black text-xs shrink-0 transition-colors ${
                          isSelected
                            ? "bg-slate-900 border-slate-900 text-stone-100"
                            : "bg-white border-stone-200/80 group-hover:border-stone-400 text-slate-500"
                        }`}>
                          {opt}
                        </span>

                        <span className="text-xs sm:text-sm pt-0.5 leading-relaxed font-sans font-semibold">
                          {optText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Actions Row */}
          <div className="border-t border-stone-100 pt-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="p-2.5 border border-stone-200 rounded-xl hover:bg-stone-50 text-slate-700 transition-all cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIdx === questions.length - 1}
                className="p-2.5 border border-stone-200 rounded-xl hover:bg-stone-50 text-slate-700 transition-all cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>

            <button
              onClick={handleClearAnswer}
              disabled={!selectedAns}
              className="text-xs font-mono font-black text-slate-400 hover:text-slate-600 cursor-pointer disabled:opacity-0 transition-opacity"
            >
              Boş Bırak / Temizle
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Submit Overlay Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full border border-stone-200 shadow-2xl flex flex-col items-center text-center gap-4"
          >
            <div className="p-3 bg-amber-50 text-amber-500 rounded-full">
              <AlertCircle className="h-8 w-8 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h4 className="font-display font-black text-slate-800 text-sm">Sınavı Bitirmek İstiyor musunuz?</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Toplam <span className="font-black text-slate-700">{totalQuestions}</span> sorudan <span className="font-black text-slate-900">{answeredCount}</span> tanesini cevapladınız. {totalQuestions - answeredCount > 0 && <span className="text-rose-500 font-bold">{totalQuestions - answeredCount} soru boş bırakılacaktır.</span>}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full pt-2">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="w-full py-2.5 border border-stone-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Devam Et
              </button>
              <button
                onClick={handleSubmit}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-stone-100 rounded-xl text-xs font-bold cursor-pointer shadow-md"
              >
                Sınavı Bitir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
