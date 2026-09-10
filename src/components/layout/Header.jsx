import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, LogOut, User, ShieldCheck, Users, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/expenses': 'Expenses',
  '/reports': 'Reports',
  '/add-expense': 'Add Expense',
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
      <header className="sticky top-0 z-30 bg-brand-800 text-white safe-top shadow-md">
        <div className="flex items-center h-14 px-4 max-w-lg mx-auto">
          {/* Left: back or logo */}
          {isRoot ? (
            <img src="/logo.png" alt="SE Trading" className="w-8 h-8 object-contain rounded" />
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="p-1 -ml-1 rounded-lg active:bg-brand-700 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Title */}
          <div className="flex-1 mx-3">
            {isRoot ? (
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-base leading-none">SE Trading</span>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-400 text-brand-950 text-[10px] font-bold">
                      <ShieldCheck className="w-3 h-3" /> ADMIN
                    </span>
                  )}
                </div>
                <p className="text-brand-300 text-xs mt-0.5">Service Is Our Priority</p>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white">{title}</span>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-400 text-brand-950 text-[10px] font-bold">
                    ADMIN
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right: profile */}
          <div className="relative">
            <button
              onClick={() => setShowMenu((v) => !v)}
              className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-colors ${
                isAdmin ? 'border-amber-400 ring-2 ring-amber-300/30' : 'border-brand-600 active:border-brand-400'
              }`}
              aria-label="Account"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-brand-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              )}
            </button>

            {/* Dropdown */}
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-10 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 min-w-[230px] animate-fade-in text-gray-800">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.displayName}</p>
                      {isAdmin && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-800 rounded">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Admin Bar (visible only to admin user) */}
        {isAdmin && (
          <div className="bg-brand-900/95 border-t border-brand-700/60 px-4 py-2">
            <div className="max-w-lg mx-auto flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] font-medium text-brand-200 shrink-0">View Data As:</span>
              <select
                value={selectedUserId || 'my'}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedUserId(val === 'my' ? null : val);
                }}
                className="flex-1 bg-brand-950 text-white text-xs rounded-lg px-2.5 py-1.5 border border-brand-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="my">👑 My Account ({user?.email})</option>
                <option value="all">🌐 All Users (Global Aggregate)</option>
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
          <div className="bg-amber-500 text-brand-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between shadow-inner">
            <span className="truncate mr-2">
              ⚠️ Debugging view: {activeInspectedUser?.displayName || activeInspectedUser?.email || selectedUserId}
            </span>
            <button
              onClick={() => setSelectedUserId(null)}
              className="px-2 py-0.5 bg-brand-900 text-white text-[10px] rounded hover:bg-brand-800 transition-colors shrink-0 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Exit
            </button>
          </div>
        )}

        {/* Global View Warning Banner */}
        {isViewingAll && (
          <div className="bg-blue-600 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between shadow-inner">
            <span className="truncate mr-2">
              🌐 Viewing aggregate data across ALL registered users
            </span>
            <button
              onClick={() => setSelectedUserId(null)}
              className="px-2 py-0.5 bg-white text-blue-900 text-[10px] rounded hover:bg-gray-100 transition-colors shrink-0 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Reset
            </button>
          </div>
        )}
      </header>
    </>
  );
}
