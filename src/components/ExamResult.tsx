import { useState } from "react";
import { ExamSession, Question } from "../types";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Award, 
  Sparkles, 
  HelpCircle, 
  BookOpen, 
  Home, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  ArrowRight 
} from "lucide-react";
import { motion } from "motion/react";

interface ExamResultProps {
  session: ExamSession;
  sessions?: ExamSession[];
  onGoHome: () => void;
  onRunAIAnalysis: () => void;
  analysisLoading: boolean;
}

export default function ExamResult({ session, sessions = [], onGoHome, onRunAIAnalysis, analysisLoading }: ExamResultProps) {
  const [expandedQId, setExpandedQId] = useState<string | null>(null);

  const toggleExpandQuestion = (id: string) => {
    setExpandedQId(prev => prev === id ? null : id);
  };

  const totalQuestions = session.questions.length;
  const accuracy = totalQuestions > 0 
    ? Math.round((session.correctCount / totalQuestions) * 100) 
    : 0;

  // Authentic KPSS score formula: Base 70 + NetScore * (30 / MaxPossibleNets)
  const maxPossibleNets = totalQuestions;
  const kpssScore = maxPossibleNets > 0 
    ? parseFloat((70 + (session.netScore / maxPossibleNets) * 30).toFixed(2))
    : 70;

  // Compare current session score with all previous sessions to calculate a success ranking percentile
  const otherSessions = sessions ? sessions.filter(s => s.id !== session.id) : [];
  let percentileRank = 100; // Best / First by default if no other exams
  
  if (otherSessions.length > 0) {
    const scores = otherSessions.map(s => s.netScore);
    const countWorseOrEqual = scores.filter(s => s <= session.netScore).length;
    percentileRank = Math.round((countWorseOrEqual / otherSessions.length) * 100);
  }
  const topPercentile = 100 - percentileRank;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 select-none">
      {/* Top Section / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black font-display text-slate-900 flex items-center gap-2 tracking-tight">
            <Award className="h-5.5 w-5.5 text-slate-950" /> Sınav Sonuç Değerlendirmesi
          </h2>
          <p className="text-xs text-slate-500 font-medium font-mono">
            {session.examMode === "GYGK" 
              ? "Genel Yetenek Genel Kültür Denemesi" 
              : session.examMode === "Mini" 
                ? "KPSS Mini Pratik" 
                : `${session.category} Sınavı`}
          </p>
        </div>

        <button
          onClick={onGoHome}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <Home className="h-4 w-4" /> Panel Sayfasına Dön
        </button>
      </div>

      {/* Main KPI Stats Block */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Net Score (KPSS Rules: Doğru - Yanlış / 4) */}
        <div className="bg-slate-900 text-stone-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4 border border-slate-800">
          <div className="p-2 bg-slate-800 w-fit rounded-lg text-stone-200">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-stone-300 font-mono font-bold block uppercase tracking-wider">KPSS Net Skoru</span>
            <span className="text-2xl font-black font-mono">{session.netScore} Net</span>
            <span className="text-[10px] text-stone-400 block mt-1">(4 Yanlış 1 Doğruyu Götürdü)</span>
          </div>
        </div>

        {/* Accuracy and Score */}
        <div className="bg-white border border-stone-200/60 rounded-2xl p-5 shadow-[0_4px_25px_rgb(0,0,0,0.01)] flex flex-col justify-between gap-4 hover:border-stone-400 transition-colors">
          <div className="p-2 bg-stone-50 text-slate-800 w-fit rounded-lg border border-stone-200/50">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase tracking-wide">Doğru Yanıt Oranı</span>
            <span className="text-xl font-black text-slate-800 font-mono">%{accuracy}</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">{session.correctCount} Doğru, {session.wrongCount} Yanlış</span>
          </div>
        </div>

        {/* Duration Spent */}
        <div className="bg-white border border-stone-200/60 rounded-2xl p-5 shadow-[0_4px_25px_rgb(0,0,0,0.01)] flex flex-col justify-between gap-4 hover:border-stone-400 transition-colors">
          <div className="p-2 bg-stone-50 text-slate-600 w-fit rounded-lg border border-stone-200/50">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase tracking-wide">Harcanan Süre</span>
            <span className="text-xl font-black text-slate-800 font-mono">
              {Math.floor(session.durationSpent / 60)}dk {session.durationSpent % 60}sn
            </span>
            <span className="text-[10px] text-slate-500 font-medium block mt-1 font-mono">Soru Başına: {Math.round(session.durationSpent / totalQuestions)} sn</span>
          </div>
        </div>

        {/* KPSS Puanı ve Başarı Sıralaması */}
        <div className="bg-white border border-stone-200/60 rounded-2xl p-5 shadow-[0_4px_25px_rgb(0,0,0,0.01)] flex flex-col justify-between gap-4 hover:border-stone-400 transition-colors">
          <div className="p-2 bg-stone-50 text-slate-800 w-fit rounded-lg text-xs font-black font-mono border border-stone-200/50">
            %
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase tracking-wide">Resmi KPSS Puanı</span>
            <span className="text-xl font-black text-slate-800 font-mono">{kpssScore} Puan</span>
            <span className="text-[10px] text-slate-600 font-bold block mt-1">
              {otherSessions.length > 0 
                ? `Başarı Sırası: En iyi %${topPercentile === 0 ? 1 : topPercentile}` 
                : "İlk denemeniz! Sıra: #1"}
            </span>
          </div>
        </div>
      </div>

      {/* AI Roadmap CTA Callout (Very Important!) */}
      {session.wrongCount > 0 ? (
        <div className="p-6 bg-slate-900 text-stone-100 rounded-2xl border border-slate-800 shadow-xs flex flex-col md:flex-row items-center md:justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles className="h-24 w-24" />
          </div>
          <div className="space-y-2 relative z-10 text-center md:text-left">
            <h3 className="font-display font-black text-sm sm:text-base flex items-center gap-2 justify-center md:justify-start">
              <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" /> Yanlışlarınızdan Konu Analizi Çıkartın!
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed max-w-lg font-medium">
              Bu denemede yaptığınız <span className="font-black text-white">{session.wrongCount} adet hatayı</span> analiz edelim. Gemini, eksik olduğunuz konuları tespit etsin ve size özel ders çalışma rehberi hazırlasın.
            </p>
          </div>

          <button
            onClick={onRunAIAnalysis}
            disabled={analysisLoading}
            className="px-5 py-3.5 bg-stone-100 text-slate-900 hover:bg-stone-200 font-mono text-[10px] uppercase font-bold tracking-wider rounded-xl shadow-xs shrink-0 relative z-10 cursor-pointer disabled:bg-stone-200 disabled:text-stone-400 flex items-center gap-2 transition-all"
          >
            {analysisLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-slate-900" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analiz Çıkartılıyor...
              </>
            ) : (
              <>
                Yapay Zeka Analizi Çıkart <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="p-5 bg-emerald-50/50 border border-emerald-500/20 text-emerald-950 rounded-2xl text-xs font-semibold flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>Mükemmel performans! Hiç yanlış yapmadınız. Konulara tam anlamıyla hakimsiniz!</span>
        </div>
      )}

      {/* Answer Key Review Details Accordion */}
      <div className="bg-white border border-stone-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-4">
        <div>
          <h3 className="font-display font-black text-slate-800 text-sm">Sınav Soruları ve Cevap Anahtarı Detaylı İncelemesi</h3>
          <p className="text-xs text-slate-400 font-medium font-mono">Tüm soruları, verdiğiniz cevapları ve açıklamaları kontrol edin</p>
        </div>

        <div className="divide-y divide-stone-100">
          {session.questions.map((question, index) => {
            const userAns = session.userAnswers[question.id] || '';
            const isCorrect = userAns === question.correctAnswer;
            const isEmpty = userAns === '';
            const isExpanded = expandedQId === question.id;

            return (
              <div key={question.id} className="py-4 first:pt-0 last:pb-0">
                {/* Header preview row */}
                <div
                  onClick={() => toggleExpandQuestion(question.id)}
                  className="flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Status icon indicators */}
                    <div className="shrink-0 mt-0.5">
                      {isCorrect ? (
                        <div className="p-1 bg-emerald-50 text-emerald-600 border border-emerald-200/40 rounded-lg">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      ) : isEmpty ? (
                        <div className="p-1 bg-stone-50 text-slate-400 border border-stone-200 rounded-lg">
                          <HelpCircle className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="p-1 bg-rose-50 text-rose-600 border border-rose-200/40 rounded-lg">
                          <XCircle className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-xs text-slate-800 font-mono">Soru {index + 1}</span>
                        <span className="px-2 py-0.5 bg-stone-100 border border-stone-200 text-slate-800 text-[9px] rounded-md font-bold uppercase font-mono tracking-wide">
                          {question.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">{question.subjectTag}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-1 max-w-[500px] sm:max-w-xl font-bold">
                        {question.questionText}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono">
                    <div className="text-right text-[10px] sm:text-xs">
                      {isEmpty ? (
                        <span className="text-slate-400 font-bold">Boş</span>
                      ) : (
                        <span className={isCorrect ? "text-emerald-600 font-black" : "text-rose-500 font-black"}>
                          Yanıtınız: {userAns}
                        </span>
                      )}
                      <span className="text-slate-500 block font-bold">Cevap: {question.correctAnswer}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                    )}
                  </div>
                </div>

                {/* Expanded Content with solution explanations */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-dashed border-stone-200 space-y-4"
                  >
                    {/* Full Question Text */}
                    <div className="p-4 bg-stone-50/60 rounded-xl border border-stone-200/60">
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-bold font-sans whitespace-pre-line">
                        {question.questionText}
                      </p>
                    </div>

                    {/* All choices visual review */}
                    <div className="grid grid-cols-1 gap-2">
                      {(['A', 'B', 'C', 'D', 'E'] as const).map(opt => {
                        const isCorrectOpt = question.correctAnswer === opt;
                        const isUserSelected = userAns === opt;

                        let style = "border-stone-200 bg-white text-slate-700";
                        if (isCorrectOpt) {
                          style = "border-emerald-600 bg-emerald-50/20 text-emerald-900";
                        } else if (isUserSelected) {
                          style = "border-rose-500 bg-rose-50/10 text-rose-900";
                        }

                        return (
                          <div
                            key={opt}
                            className={`p-3 rounded-xl border text-xs flex items-start gap-3 ${style}`}
                          >
                            <span className={`h-5 w-5 rounded-md flex items-center justify-center font-black font-mono text-[10px] shrink-0 ${
                              isCorrectOpt
                                ? "bg-emerald-600 text-white"
                                : isUserSelected
                                  ? "bg-rose-500 text-white"
                                  : "bg-slate-100 text-slate-500"
                            }`}>
                              {opt}
                            </span>
                            <span className="pt-0.5 leading-relaxed font-semibold">{question.options[opt]}</span>
                            <div className="ml-auto shrink-0 flex items-center gap-1 font-black text-[10px] font-mono">
                              {isCorrectOpt && (
                                <span className="text-emerald-700 flex items-center gap-0.5">
                                  <Check className="h-3 w-3" /> DOĞRU CEVAP
                                </span>
                              )}
                              {isUserSelected && !isCorrectOpt && (
                                <span className="text-rose-600">SİZİN YANITINIZ</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Solutions Explanation Card */}
                    <div className="p-4 bg-stone-50 border border-stone-200/80 rounded-xl flex flex-col gap-2">
                      <span className="text-[10px] font-black text-slate-800 font-mono uppercase tracking-wide flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" /> DETAYLI AÇIKLAMA VE ÇÖZÜM
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-bold font-sans">
                        {question.explanation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
