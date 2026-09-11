import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, LogOut, User, ShieldCheck, Users, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/expenses': 'Expenses',
  '/reports': 'Reports',
  '/add-expense': 'Record Receipt',
};

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    logout,
    isAdmin,
    registeredUsers,
    selectedUserId,
    setSelectedUserId,
    isViewingAll,
    isImpersonating,
    activeInspectedUser,
  } = useAuth();

  const [showMenu, setShowMenu] = useState(false);

  const title = pageTitles[location.pathname] || 'SE Trading';
  const isRoot = ['/dashboard', '/projects', '/expenses', '/reports'].includes(location.pathname);

  const handleLogout = async () => {
    setShowMenu(false);
    await logout();
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-gradient-to-r from-sapphire-950 via-sapphire-900 to-sapphire-950 text-white safe-top border-b border-sapphire-700/40 shadow-lg shadow-sapphire-950/20">
        <div className="flex items-center h-16 px-4 max-w-lg mx-auto">
          {/* Left: back or logo */}
          {isRoot ? (
            <div className="w-10 h-10 rounded-xl p-1 bg-sapphire-950 border border-amber-400/60 shadow-sm flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="SE Trading" className="w-full h-full object-contain rounded-lg" />
            </div>
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-xl text-sapphire-200 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Title / Branding */}
          <div className="flex-1 mx-3 min-w-0">
            {isRoot ? (
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-white text-base tracking-tight leading-none">
                    SE TRADING
                  </span>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-400 text-sapphire-950 text-[9px] font-black uppercase tracking-wider shadow-sm">
                      <ShieldCheck className="w-2.5 h-2.5" /> Admin
                    </span>
                  )}
                </div>
                <p className="text-amber-400 text-[10px] font-bold tracking-widest uppercase mt-0.5">
                  Service Is Our Priority
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight truncate">{title}</span>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-sapphire-950 text-[9px] font-black uppercase">
                    Admin
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right: profile */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowMenu((v) => !v)}
              className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all p-0.5 bg-sapphire-950 ${
                isAdmin ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-sapphire-500 hover:border-sapphire-300'
              }`}
              aria-label="Account menu"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'Profile'} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="w-full h-full bg-sapphire-800 text-amber-400 flex items-center justify-center rounded-lg">
                  <User className="w-4 h-4" />
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-12 z-50 bg-white rounded-2xl shadow-2xl border border-sapphire-100 py-2 min-w-[240px] animate-fade-in text-slate-800">
                  <div className="px-4 py-3 border-b border-slate-100 bg-sapphire-50/40">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.displayName || 'User'}</p>
                      {isAdmin && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full border border-amber-200">
                          Administrator
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-rose-600 rounded-xl hover:bg-rose-50 active:bg-rose-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Admin Bar (visible only to admin user) */}
        {isAdmin && (
          <div className="bg-sapphire-950/90 border-t border-sapphire-800/80 px-4 py-2">
            <div className="max-w-lg mx-auto flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] font-medium text-sapphire-200 shrink-0">Data Scope:</span>
              <select
                value={selectedUserId || 'my'}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedUserId(val === 'my' ? null : val);
                }}
                className="flex-1 bg-sapphire-900 text-white text-xs rounded-xl px-3 py-1.5 border border-sapphire-700 focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
              >
                <option value="my">👑 My Account ({user?.email})</option>
                <option value="all">🌐 All Users (Combined Overview)</option>
                {registeredUsers
                  .filter((u) => u.uid !== user?.uid)
                  .map((u) => (
                    <option key={u.uid} value={u.uid}>
                      👤 {u.displayName || 'User'} ({u.email || u.uid.slice(0, 8)})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}

        {/* Active Impersonation Warning Banner */}
        {isImpersonating && (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-between shadow-inner">
            <span className="truncate mr-2">
              🔍 Debugging Account: {activeInspectedUser?.displayName || activeInspectedUser?.email || selectedUserId}
            </span>
            <button
              onClick={() => setSelectedUserId(null)}
              className="px-2 py-0.5 bg-sapphire-950 text-amber-300 text-[10px] font-bold rounded-lg hover:bg-sapphire-900 transition-colors shrink-0 flex items-center gap-1 shadow-sm"
            >
              <X className="w-3 h-3" /> Exit
            </button>
          </div>
        )}

        {/* Global View Warning Banner */}
        {isViewingAll && (
          <div className="bg-gradient-to-r from-sapphire-700 to-sapphire-800 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-between shadow-inner">
            <span className="truncate mr-2">
              🌐 Showing aggregated statistics across ALL company users
            </span>
            <button
              onClick={() => setSelectedUserId(null)}
              className="px-2 py-0.5 bg-white text-sapphire-950 text-[10px] font-bold rounded-lg hover:bg-slate-100 transition-colors shrink-0 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Reset
            </button>
          </div>
        )}
      </header>
    </>
  );
}
