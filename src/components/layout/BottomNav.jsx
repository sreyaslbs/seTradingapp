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
      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/add-expense')}
        className="fab"
        aria-label="Add Expense"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="flex items-center justify-around px-2 h-16">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = isActive(to);
            return (
              <NavLink
                key={to}
                to={to}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
              >
                <div className={`p-1.5 rounded-xl transition-all duration-150 ${active ? 'bg-brand-100' : ''}`}>
                  <Icon
                    className={`w-5 h-5 transition-colors duration-150 ${active ? 'text-brand-800' : 'text-gray-400'}`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                </div>
                <span className={`text-[10px] font-medium transition-colors duration-150 ${active ? 'text-brand-800' : 'text-gray-400'}`}>
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
