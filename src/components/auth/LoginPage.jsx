import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

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
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex flex-col items-center justify-center px-6">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-brand-700 opacity-20" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-gold-500 opacity-5" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="bg-brand-800 p-6 flex items-center justify-center">
            <img
              src="/logo-banner.jpg"
              alt="SE Trading"
              className="w-full max-w-[280px] object-contain rounded-lg"
            />
          </div>
          <div className="px-8 py-8 text-center">
            <h1 className="text-2xl font-bold text-brand-900 mb-1">SE Trading</h1>
            <p className="text-gray-500 text-sm mb-6 italic">"Service Is Our Priority"</p>

            <div className="border-t border-gray-100 pt-6 mb-6">
              <p className="text-gray-600 text-sm font-medium mb-1">Expense Tracker</p>
              <p className="text-gray-400 text-xs">
                Manage projects, receipts &amp; profitability
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:border-brand-300 hover:bg-brand-50 active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin text-brand-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              {loading ? 'Signing in…' : 'Sign in with Google'}
            </button>

            <p className="mt-4 text-xs text-gray-400 text-center">
              Your data is private to your Google account
            </p>
          </div>
        </div>

        <p className="text-center text-brand-300 text-xs opacity-60">
          SE Trading © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
