import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from "recharts";
import { ExamSession } from "../types";
import { TrendingUp, Award, BarChart3, Info } from "lucide-react";

interface PerformanceChartsProps {
  sessions: ExamSession[];
}

export default function PerformanceCharts({ sessions }: PerformanceChartsProps) {
  if (sessions.length === 0) {
    return (
      <div className="bg-white border border-stone-200/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center text-slate-500 gap-3 min-h-[300px] shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
        <div className="p-3 bg-stone-50 border border-stone-200/50 text-slate-400 rounded-full">
          <BarChart3 className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium">Başarı durumunuzu gösteren grafikler için en az 1 sınav tamamlamalısınız.</p>
        <p className="text-xs text-slate-400">İlk deneme sınavınızı çözdükten sonra net gelişim ve konu performansı buraya yansıyacaktır.</p>
      </div>
    );
  }

  // 1. Line Chart Data - Net Scores over time
  const lineData = [...sessions]
    .reverse() // Chronological order
    .map((session, index) => {
      const date = new Date(session.createdAt);
      const formattedDate = date.toLocaleDateString("tr-TR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      return {
        name: `Sınav #${index + 1}`,
        date: formattedDate,
        "Net Skor": session.netScore,
        "Yüzde Puan": Math.round(session.score),
        Questions: session.questions.length
      };
    });

  // 2. Bar Chart Data - Subject-specific correct / wrong answers
  const subjectStats: { [category: string]: { correct: number; wrong: number; total: number } } = {
    "Türkçe": { correct: 0, wrong: 0, total: 0 },
    "Matematik": { correct: 0, wrong: 0, total: 0 },
    "Tarih": { correct: 0, wrong: 0, total: 0 },
    "Coğrafya": { correct: 0, wrong: 0, total: 0 },
    "Vatandaşlık": { correct: 0, wrong: 0, total: 0 },
    "Güncel Bilgiler": { correct: 0, wrong: 0, total: 0 }
  };

  sessions.forEach(session => {
    session.questions.forEach(q => {
      const uAns = session.userAnswers[q.id];
      const cat = q.category || "Genel";
      if (!subjectStats[cat]) {
        subjectStats[cat] = { correct: 0, wrong: 0, total: 0 };
      }

      subjectStats[cat].total++;
      if (uAns === q.correctAnswer) {
        subjectStats[cat].correct++;
      } else if (uAns && uAns !== q.correctAnswer) {
        subjectStats[cat].wrong++;
      }
    });
  });

  const barData = Object.keys(subjectStats).map(cat => ({
    name: cat,
    "Doğru": subjectStats[cat].correct,
    "Yanlış": subjectStats[cat].wrong,
    "Toplam": subjectStats[cat].total
  })).filter(item => item.Toplam > 0);

  // Quick stats calculations
  const totalNet = sessions.reduce((sum, s) => sum + s.netScore, 0);
  const avgNet = parseFloat((totalNet / sessions.length).toFixed(2));
  const maxNet = Math.max(...sessions.map(s => s.netScore));

  return (
    <div className="flex flex-col gap-6">
      {/* Mini metric badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-stone-50 border border-stone-200/60 rounded-xl flex items-center gap-3 shadow-xs">
          <div className="p-2 bg-stone-100 border border-stone-200/80 text-slate-900 rounded-lg">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Sınav Ortalaması</div>
            <div className="text-lg font-bold text-slate-900 font-mono">{avgNet} Net</div>
          </div>
        </div>
        <div className="p-4 bg-stone-50 border border-stone-200/60 rounded-xl flex items-center gap-3 shadow-xs">
          <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">En Yüksek Net</div>
            <div className="text-lg font-bold text-emerald-950 font-mono">{maxNet} Net</div>
          </div>
        </div>
        <div className="p-4 bg-stone-50 border border-stone-200/60 rounded-xl flex items-center gap-3 shadow-xs">
          <div className="p-2 bg-amber-50 border border-amber-100 text-amber-600 rounded-lg font-bold text-sm">
            %
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Toplam Doğru Oranı</div>
            <div className="text-lg font-bold text-amber-950 font-mono">
              {(() => {
                const totalCorrect = sessions.reduce((sum, s) => sum + s.correctCount, 0);
                const totalQuestions = sessions.reduce((sum, s) => sum + s.questions.length, 0);
                return totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
              })()}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart: Net Score Trend */}
        <div className="p-6 bg-white border border-stone-200/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-display font-bold text-slate-800 text-sm">Net Gelişim Grafiği</h4>
              <p className="text-xs text-slate-400">Kronolojik KPSS net başarı seyri</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">KPSS Standartları</span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="name" stroke="#a8a29e" fontSize={11} tickLine={false} />
                <YAxis stroke="#a8a29e" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e7e5e4",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)"
                  }}
                  labelStyle={{ fontWeight: "bold", fontSize: "12px", color: "#1c1917" }}
                />
                <Line
                  type="monotone"
                  dataKey="Net Skor"
                  stroke="#1c1917"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  dot={{ r: 4, stroke: "white", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Subject Breakdown */}
        <div className="p-6 bg-white border border-stone-200/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-display font-bold text-slate-800 text-sm">Ders Performans Analizi</h4>
              <p className="text-xs text-slate-400 font-mono">Çözülen soruların ders bazında dağılımı</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-700 bg-stone-100 border border-stone-200 rounded-md px-2 py-0.5 font-mono font-bold">
              <Info className="h-3 w-3" /> 4 Yanlış 1 Neti Götürür
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="name" stroke="#a8a29e" fontSize={11} tickLine={false} />
                <YAxis stroke="#a8a29e" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e7e5e4",
                    borderRadius: "12px"
                  }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="Doğru" fill="#1c1917" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Yanlış" fill="#a8a29e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
