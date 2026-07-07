import { AnalysisReport } from "../types";
import { Sparkles, Compass, AlertTriangle, CheckCircle2, ChevronRight, BookOpen, Clock, RefreshCw, Download } from "lucide-react";
import { motion } from "motion/react";
import { jsPDF } from "jspdf";

interface WeakSubjectAnalysisScreenProps {
  report: AnalysisReport;
  onRefresh: () => void;
  loading: boolean;
}

export default function WeakSubjectAnalysisScreen({ report, onRefresh, loading }: WeakSubjectAnalysisScreenProps) {
  const dateFormatted = new Date(report.generatedAt).toLocaleDateString("tr-TR", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const downloadReportAsPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Helper for Turkish character safety in PDFs (Helvetica standard font sometimes has issues with Turkish glyphs in certain readers)
      const clean = (text: string) => {
        return text
          .replace(/ğ/g, "g").replace(/Ğ/g, "G")
          .replace(/ü/g, "u").replace(/Ü/g, "U")
          .replace(/ş/g, "s").replace(/Ş/g, "S")
          .replace(/ı/g, "i").replace(/İ/g, "I")
          .replace(/ö/g, "o").replace(/Ö/g, "O")
          .replace(/ç/g, "c").replace(/Ç/g, "C");
      };

      let y = 20;
      const margin = 20;
      const pageWidth = 210;
      const contentWidth = pageWidth - (margin * 2);

      // Page background decorative top border
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 6, "F");

      // Report Header
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text(clean("KPSS AKILLI ANALIZ VE REHBERLIK RAPORU"), margin, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Rapor Tarihi: ${dateFormatted}`, margin, y);
      
      // Horizontal separator line
      y += 6;
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Section 1: GENEL DURUM DEGERLENDIRMESI
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(margin, y, contentWidth, 38, "F");
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.rect(margin, y, contentWidth, 38, "D");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(clean("YAPAY ZEKA KPSS KOÇU DEĞERLENDİMESİ"), margin + 6, y + 8);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85); // slate-700
      
      const summaryText = clean(`"${report.overallSummary}"`);
      const splitSummary = doc.splitTextToSize(summaryText, contentWidth - 12);
      doc.text(splitSummary, margin + 6, y + 16);
      y += 48;

      // Section 2: ZAYIF KONULAR (WEAK SUBJECTS)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(clean("1. ACİL MÜDAHALE GEREKEN KPSS KONULARI"), margin, y);
      y += 6;

      if (report.weakSubjects.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(22, 101, 52); // green-800
        doc.text(clean("Tebrikler! Kritik derecede eksik veya zayıf bir konunuz tespit edilmemiştir."), margin, y);
        y += 10;
      } else {
        report.weakSubjects.forEach((subj) => {
          if (y > 260) { // Page break check
            doc.addPage();
            y = 20;
            // decorative top border for new page
            doc.setFillColor(15, 23, 42);
            doc.rect(0, 0, pageWidth, 6, "F");
          }

          doc.setFillColor(254, 242, 242); // rose-50
          doc.rect(margin, y, contentWidth, 16, "F");
          doc.setDrawColor(254, 202, 202); // rose-200
          doc.rect(margin, y, contentWidth, 16, "D");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(153, 27, 27); // rose-800
          doc.text(clean(`${subj.subjectTag} (${subj.category})`), margin + 4, y + 6);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          doc.text(
            clean(`Hata Orani: %${subj.percentageWrong} (${subj.wrongCount} Yanlis / ${subj.totalQuestions} Toplam Soru)`),
            margin + 4,
            y + 11
          );

          y += 20;
        });
      }

      // Section 3: CALISMA PLANI VE REÇETE (STUDY ROADMAP)
      if (y > 230) {
        doc.addPage();
        y = 20;
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageWidth, 6, "F");
      }

      y += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(clean("2. SİZE ÖZEL HAFTALIK ÇALIŞMA PLANI VE TAVSİYELER"), margin, y);
      y += 8;

      report.studyPlan.forEach((plan, idx) => {
        // Compute heights before drawing to handle page breaks smoothly
        const adviceText = clean(plan.advice);
        const splitAdvice = doc.splitTextToSize(adviceText, contentWidth - 8);
        const adviceHeight = splitAdvice.length * 4.5;

        // Key points list
        const pointsCleaned = plan.keyPoints.map(p => clean(p));
        let pointsHeight = 0;
        const splitPoints: string[][] = [];
        pointsCleaned.forEach(pt => {
          const splitPt = doc.splitTextToSize(`- ${pt}`, contentWidth - 12);
          splitPoints.push(splitPt);
          pointsHeight += splitPt.length * 4.5;
        });

        const blockHeight = 12 + adviceHeight + 10 + pointsHeight + 8;

        if (y + blockHeight > 275) {
          doc.addPage();
          y = 20;
          doc.setFillColor(15, 23, 42);
          doc.rect(0, 0, pageWidth, 6, "F");
        }

        // Draw plan box
        doc.setFillColor(250, 250, 249); // stone-50
        doc.rect(margin, y, contentWidth, blockHeight, "F");
        doc.setDrawColor(231, 229, 228); // stone-200
        doc.rect(margin, y, contentWidth, blockHeight, "D");

        // Priority header badge color
        if (plan.importance === "Yüksek") {
          doc.setFillColor(239, 68, 68); // red-500
          doc.rect(margin, y, contentWidth, 7, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(255, 255, 255);
          doc.text(clean("YUKSEK ONCELIKLI ODAK ALANI"), margin + 4, y + 5);
        } else {
          doc.setFillColor(245, 158, 11); // amber-500
          doc.rect(margin, y, contentWidth, 7, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(255, 255, 255);
          doc.text(clean("ORTA ONCELIKLI CALISMA ALANI"), margin + 4, y + 5);
        }

        y += 13;

        // Subject & Category
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        doc.text(clean(`${plan.subject} (${plan.category})`), margin + 4, y);
        y += 6;

        // Advice text
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(68, 64, 60); // stone-700
        doc.text(splitAdvice, margin + 4, y);
        y += adviceHeight + 4;

        // Key Points subtitle
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(120, 113, 108); // stone-500
        doc.text(clean("MUTLAKA BILINMESI GEREKEN PUF NOKTALARI:"), margin + 4, y);
        y += 5;

        // Key points bullet list
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(28, 25, 23); // stone-900
        splitPoints.forEach(sp => {
          doc.text(sp, margin + 6, y);
          y += sp.length * 4.5;
        });

        y += 12; // Gap before next plan
      });

      // Footer brand label on final page
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175); // gray-400
      doc.text(clean("KPSS Soru Bankası & Yapay Zeka Canlı Akademi Sistemi - fuzuli medya"), margin, 282);

      doc.save(`KPSS_Yapay_Zeka_Analiz_Raporu_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("PDF raporu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black font-display text-slate-900 flex items-center gap-2 tracking-tight">
            <Sparkles className="h-5 w-5 text-slate-900 animate-pulse" /> Yapay Zeka KPSS Analiz Raporu
          </h2>
          <p className="text-xs text-slate-500 font-bold font-mono">Son güncelleme: {dateFormatted}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadReportAsPDF}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-stone-100 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> PDF Raporu İndir
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-stone-50 text-slate-800 font-bold text-xs rounded-xl border border-stone-200 transition-all cursor-pointer disabled:bg-stone-50/50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Analiz Güncelleniyor...
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" /> Analizi Yeniden Başlat
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Coach Card */}
      <div className="p-6 bg-slate-900 text-stone-100 rounded-2xl border border-slate-800 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Sparkles className="h-32 w-32" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-stone-300 text-xs font-black tracking-wider font-mono uppercase">
            <Compass className="h-4 w-4" /> YAPAY ZEKA DERS REHBERLİĞİ VE DURUM DEĞERLENDİRMESİ
          </div>
          <p className="text-sm sm:text-base leading-relaxed font-semibold italic text-stone-100">
            "{report.overallSummary}"
          </p>
          <div className="pt-2 flex items-center gap-2 text-[11px] text-stone-400 font-bold font-mono">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
            <span>Gemini 3.5-Flash KPSS Analiz Modülü</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Weak Subjects List (5 Columns) */}
        <div className="lg:col-span-5 bg-white border border-stone-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col gap-4">
          <div>
            <h3 className="font-display font-black text-slate-800 text-sm flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-500 animate-pulse" /> Acil Müdahale Gereken Konular
            </h3>
            <p className="text-xs text-slate-400 font-medium">En çok hata yaptığınız ve eksik olduğunuz temalar</p>
          </div>

          <div className="space-y-3">
            {report.weakSubjects.length === 0 ? (
              <div className="p-4 bg-emerald-50/50 border border-emerald-500/20 text-emerald-950 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Harika! Şu ana kadar hata yaptığınız kritik bir konu bulunamadı.</span>
              </div>
            ) : (
              report.weakSubjects.map((subject, index) => (
                <div
                  key={index}
                  className="p-3.5 bg-stone-50/60 border border-stone-200/60 rounded-xl flex flex-col gap-2 transition-all hover:bg-stone-100/50 hover:border-stone-400"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display font-black text-xs text-slate-800 truncate">
                      {subject.subjectTag}
                    </span>
                    <span className="px-2 py-0.5 bg-stone-100 border border-stone-200 text-slate-800 text-[10px] rounded-md font-bold uppercase font-mono tracking-tight shrink-0">
                      {subject.category}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
                      <span>Soru Hata Oranı</span>
                      <span className="font-black text-rose-500 font-mono">
                        %{subject.percentageWrong} ({subject.wrongCount} Yanlış / {subject.totalQuestions} Soru)
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${subject.percentageWrong}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Study Plan Roadmap (7 Columns) */}
        <div className="lg:col-span-7 bg-white border border-stone-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col gap-4">
          <div>
            <h3 className="font-display font-black text-slate-800 text-sm flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-slate-900" /> Kişiselleştirilmiş Yol Haritası
            </h3>
            <p className="text-xs text-slate-400 font-medium font-mono">Hatalarınızı gidermek için yapay zeka çalışma koçu reçetesi</p>
          </div>

          <div className="space-y-4">
            {report.studyPlan.map((plan, index) => (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={index}
                className="p-4 border border-stone-200 bg-stone-50/20 rounded-xl flex flex-col gap-3 relative overflow-hidden shadow-xs"
              >
                {/* Accent priority tag */}
                <div className="absolute top-0 right-0">
                  <span className={`inline-block px-2.5 py-1 text-[9px] font-black rounded-bl-xl font-mono ${
                    plan.importance === "Yüksek" 
                      ? "bg-rose-500 text-stone-100" 
                      : "bg-amber-400 text-slate-900"
                  }`}>
                    {plan.importance} Öncelikli
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-stone-100 border border-stone-200 text-slate-800 text-[10px] rounded-md font-bold shrink-0">
                      {plan.category}
                    </span>
                    <h4 className="font-display font-black text-xs text-slate-800 max-w-[70%] truncate">
                      {plan.subject}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed font-bold">
                    {plan.advice}
                  </p>
                </div>

                {/* Study Sub-points */}
                <div className="bg-white rounded-lg p-3 border border-stone-200/60">
                  <span className="text-[10px] font-black text-slate-500 block mb-2 font-mono uppercase tracking-wide">
                    Bu Konuda Mutlaka Bilinmesi Gereken Püf Noktaları
                  </span>
                  <ul className="space-y-1.5">
                    {plan.keyPoints.map((point, pIndex) => (
                      <li key={pIndex} className="text-xs text-slate-600 flex items-start gap-2 font-semibold">
                        <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-slate-800 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
