import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (err) {
      setError('Sign-in failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sapphire-950 via-sapphire-900 to-sapphire-850 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Solar ambient light glow in background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-sapphire-600/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Luxury Glass Card */}
        <div className="bg-sapphire-950/70 backdrop-blur-2xl rounded-3xl border border-sapphire-400/30 shadow-2xl p-8 text-center relative overflow-hidden">
          
          {/* Subtle top amber highlight accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          {/* Logo Monogram Container */}
          <div className="relative inline-block mb-6 mt-2">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-sapphire-900 to-sapphire-950 p-2.5 shadow-xl border-2 border-amber-400/60 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <img
                src="/logo.png"
                alt="SE Trading"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            {/* Sparkle badge */}
            <div className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-amber-500 text-slate-950 shadow-md">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>

          {/* Title & Tagline */}
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">
            SE TRADING
          </h1>
          <p className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-1.5">
            Service Is Our Priority
          </p>
          <p className="text-sapphire-200 text-xs mb-6">
            Solar &amp; Electrical Project Expense Tracker
          </p>

          <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-amber-400/40 to-transparent mb-6" />

          {error && (
            <div className="mb-5 p-3.5 bg-rose-500/15 border border-rose-400/40 rounded-xl text-rose-200 text-xs">
              {error}
            </div>
          )}

          {/* Google Sign-in Button */}
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white text-slate-800 font-bold text-sm shadow-xl hover:bg-slate-50 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group border border-slate-200"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin text-slate-800" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5 transition-transform group-hover:scale-105">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {loading ? 'Authenticating…' : 'Sign in with Google'}
          </button>

          {/* Privacy badge */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-sapphire-200">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Encrypted Per-Account Private Storage</span>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-sapphire-300/60 text-xs mt-6 tracking-wide font-medium">
          SE TRADING © {new Date().getFullYear()} · All rights reserved
        </p>
      </div>
    </div>
  );
}
