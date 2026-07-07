import React, { useState } from "react";
import { api, saveUser } from "../utils";
import { GraduationCap, ArrowRight, ShieldAlert, Sparkles, Check } from "lucide-react";
import { motion } from "motion/react";

interface LoginProps {
  onLoginSuccess: (user: { id: string; username: string; email: string }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      setError("Lütfen adınızı ve soyadınızı girin.");
      return;
    }

    // Basic Name Surname check (usually at least two words, each at least 2 chars)
    const words = trimmedUsername.split(/\s+/);
    if (words.length < 2) {
      setError("Lütfen hem adınızı hem de soyadınızı girin.");
      return;
    }

    if (trimmedUsername.length < 5) {
      setError("Lütfen en az 5 karakter uzunluğunda geçerli bir isim soyisim girin.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Call the unified login API (which auto-registers new names)
      const response = await api.login(trimmedUsername);
      saveUser(response.user);
      onLoginSuccess(response.user);
    } catch (err: any) {
      setError(err.message || "Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Decorative fine organic background accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-50/40 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-50/30 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md flex flex-col gap-8">
        {/* Top Branding */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-3 bg-slate-900 text-stone-100 rounded-2xl shadow-sm border border-slate-800">
            <GraduationCap className="h-6 w-6 stroke-[1.5]" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-[0.2em] block mb-1">
              ÖSYM Sınav Simülatörü
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              KPSS Soru Motoru
            </h1>
          </div>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white border border-stone-200/60 rounded-[28px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative"
        >
          <div className="space-y-2 mb-6">
            <h2 className="font-display text-lg font-bold text-slate-900 tracking-tight">
              Giriş Yapın
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Sınav sonuçlarınızı ve yapay zeka analizlerinizi kaydetmek için sadece adınızı ve soyadınızı yazarak anında başlayın.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex items-start gap-2.5 font-medium"
            >
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="leading-relaxed">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                Adınız ve Soyadınız
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Örn: Mehmet Resul Yılmaz"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError("");
                }}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-mono text-[11px] font-bold tracking-widest uppercase py-4 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  GİRİŞ YAPILIYOR...
                </span>
              ) : (
                <>
                  BAŞLA <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Micro value highlights - refined human touch */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-y-3 gap-x-4">
            <div className="flex items-start gap-2">
              <div className="p-0.5 bg-emerald-50 text-emerald-600 rounded-md shrink-0 mt-0.5">
                <Check className="h-3 w-3 stroke-[3]" />
              </div>
              <span className="text-[10px] text-slate-500 font-medium leading-normal">
                %100 ÖSYM Soru Formatı
              </span>
            </div>
            <div className="flex items-start gap-2">
              <div className="p-0.5 bg-emerald-50 text-emerald-600 rounded-md shrink-0 mt-0.5">
                <Check className="h-3 w-3 stroke-[3]" />
              </div>
              <span className="text-[10px] text-slate-500 font-medium leading-normal">
                Yapay Zeka Soru Simülatörü
              </span>
            </div>
            <div className="flex items-start gap-2">
              <div className="p-0.5 bg-emerald-50 text-emerald-600 rounded-md shrink-0 mt-0.5">
                <Check className="h-3 w-3 stroke-[3]" />
              </div>
              <span className="text-[10px] text-slate-500 font-medium leading-normal">
                KPSS Puan Hesaplayıcı
              </span>
            </div>
            <div className="flex items-start gap-2">
              <div className="p-0.5 bg-emerald-50 text-emerald-600 rounded-md shrink-0 mt-0.5">
                <Check className="h-3 w-3 stroke-[3]" />
              </div>
              <span className="text-[10px] text-slate-500 font-medium leading-normal">
                Kişiye Özel Akıllı Analiz
              </span>
            </div>
          </div>
        </motion.div>

        {/* Platform Disclaimer Footer */}
        <p className="text-center text-[10px] text-slate-400 font-medium font-mono uppercase tracking-wider leading-relaxed">
          Şifre veya E-posta Gerekmez • Güvenli Yerel Depolama
        </p>
      </div>
    </div>
  );
}
