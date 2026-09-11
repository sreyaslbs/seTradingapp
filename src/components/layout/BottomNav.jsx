import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, Receipt, BarChart3, Plus
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      {/* Solar Amber Floating Action Button */}
      <button
        onClick={() => navigate('/add-expense')}
        className="fab group"
        aria-label="Add Receipt"
      >
        <Plus className="w-7 h-7 text-slate-950 transition-transform duration-200 group-hover:scale-110" strokeWidth={2.8} />
      </button>

      {/* Executive Highlighted Sapphire Console Dock */}
      <nav className="bottom-nav">
        <div className="flex items-center justify-around px-3 h-16 max-w-lg mx-auto">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = isActive(to);
            return (
              <NavLink
                key={to}
                to={to}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative py-1 group"
              >
                <div
                  className={`px-3.5 py-1 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-105'
                      : 'text-sapphire-200/60 group-hover:text-white group-hover:bg-white/5'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      active ? 'text-slate-950' : 'text-sapphire-300/80 group-hover:text-white'
                    }`}
                    strokeWidth={active ? 2.6 : 1.8}
                  />
                </div>
                <span
                  className={`text-[10px] tracking-wide transition-colors duration-200 ${
                    active ? 'text-amber-400 font-extrabold' : 'text-sapphire-300/60 group-hover:text-white font-medium'
                  }`}
                >
                  {label}
                </span>
                {active && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
