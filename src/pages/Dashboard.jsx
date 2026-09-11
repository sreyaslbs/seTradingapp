import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../hooks/useExpenses';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../contexts/AuthContext';
import { formatPeso, calcPercent, expenseTypeColor, expenseTypeLabel, statusColor } from '../utils/formatters';
import {
  TrendingUp, TrendingDown, Wallet, Briefcase, Building2, Zap,
  ArrowRight, Plus, Receipt, Sparkles, AlertCircle
} from 'lucide-react';

function ProjectCard({ project, expenses }) {
  const navigate = useNavigate();
  const projectExpenses = expenses
    .filter((e) => e.type === 'project' && e.projectId === project.id)
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const remaining = (project.contractAmount || 0) - projectExpenses;
  const pct = calcPercent(projectExpenses, project.contractAmount);

  // Gradient progress bar
  const barGradient =
    pct >= 90
      ? 'bg-gradient-to-r from-rose-500 to-red-600'
      : pct >= 70
      ? 'bg-gradient-to-r from-amber-500 to-amber-600'
      : 'bg-gradient-to-r from-emerald-500 to-teal-500';

  return (
    <button
      onClick={() => navigate(`/projects/${project.id}`)}
      className="w-full card text-left hover:border-sapphire-300 active:scale-[0.99] transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 mr-2">
          <span className="font-bold text-slate-900 text-sm truncate group-hover:text-sapphire-700 transition-colors block">
            {project.name}
          </span>
          <p className="text-xs text-slate-500 truncate">{project.client}</p>
        </div>
        <span className={`badge ${statusColor(project.status)} shrink-0`}>
          {project.status.replace('-', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 bg-sapphire-50/50 p-2.5 rounded-xl border border-sapphire-100">
        <div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Contract</p>
          <p className="text-xs font-bold text-slate-900">{formatPeso(project.contractAmount)}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Expenses</p>
          <p className="text-xs font-bold text-rose-600">{formatPeso(projectExpenses)}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Remaining</p>
          <p className={`text-xs font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatPeso(remaining)}
          </p>
        </div>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-1">
        <div
          className={`${barGradient} h-2 rounded-full transition-all duration-500 shadow-sm`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
        <span>Budget Burn Rate</span>
        <span className="font-bold text-slate-600">{pct}% utilized</span>
      </div>
    </button>
  );
}

export default function Dashboard() {
  const { expenses, loading: expLoading } = useExpenses();
  const { projects, loading: projLoading } = useProjects();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const projectIncome = projects.reduce((s, p) => s + (Number(p.contractAmount) || 0), 0);

    const projectExp = expenses
      .filter((e) => e.type === 'project')
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const operationExp = expenses
      .filter((e) => e.type === 'operation')
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const officeExp = expenses
      .filter((e) => e.type === 'office')
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const totalExp = projectExp + operationExp + officeExp;
    const net = projectIncome - totalExp;

    return { projectIncome, projectExp, operationExp, officeExp, totalExp, net };
  }, [expenses, projects]);

  const activeProjects = useMemo(
    () => projects.filter((p) => p.status === 'active'),
    [projects]
  );

  const loading = expLoading || projLoading;

  if (loading) {
    return (
      <div className="page-container">
        <div className="rounded-3xl h-44 shimmer mb-4" />
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="stat-card h-24 shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in space-y-6">

      {/* Hero Financial Overview Card (Sapphire & Solar Amber) */}
      <div className="relative rounded-3xl bg-gradient-to-br from-sapphire-950 via-sapphire-900 to-sapphire-850 p-6 text-white border border-sapphire-400/30 shadow-xl overflow-hidden">
        {/* Amber glow accent in corner */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Net Result
              </span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                stats.net >= 0
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}
            >
              {stats.net >= 0 ? 'Surplus' : 'Deficit'}
            </span>
          </div>

          <p className="text-3xl font-black tracking-tight mb-4 text-white">
            {formatPeso(stats.net)}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/15">
            <div>
              <p className="text-[10px] uppercase font-semibold text-sapphire-200">Total Income</p>
              <p className="text-sm font-bold text-white">{formatPeso(stats.projectIncome)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-sapphire-200">Total Expenses</p>
              <p className="text-sm font-bold text-rose-300">{formatPeso(stats.totalExp)}</p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 mt-5">
            <button
              onClick={() => navigate('/add-expense')}
              className="btn-gold text-xs py-2.5 flex items-center justify-center gap-1.5"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Record Receipt</span>
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>New Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Expense Category Breakdown */}
      <div>
        <p className="section-title">
          <Wallet className="w-3.5 h-3.5 text-amber-500" /> Expense Breakdown
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="stat-card p-3 border-sapphire-100">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Briefcase className="w-3.5 h-3.5 text-sapphire-600" />
              <span className="text-[10px] font-bold text-slate-500 uppercase truncate">Project</span>
            </div>
            <p className="text-sm font-extrabold text-slate-900 truncate">{formatPeso(stats.projectExp)}</p>
          </div>

          <div className="stat-card p-3 border-sapphire-100">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[10px] font-bold text-slate-500 uppercase truncate">Operation</span>
            </div>
            <p className="text-sm font-extrabold text-slate-900 truncate">{formatPeso(stats.operationExp)}</p>
          </div>

          <div className="stat-card p-3 border-sapphire-100">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-[10px] font-bold text-slate-500 uppercase truncate">Office</span>
            </div>
            <p className="text-sm font-extrabold text-slate-900 truncate">{formatPeso(stats.officeExp)}</p>
          </div>
        </div>
      </div>

      {/* Active Projects Showcase */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title mb-0">
            <Briefcase className="w-3.5 h-3.5 text-amber-500" /> Active Projects ({activeProjects.length})
          </p>
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1 text-xs font-bold text-sapphire-800 hover:text-sapphire-900 transition-colors"
          >
            <span>All Projects</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {activeProjects.length === 0 ? (
          <div className="card text-center py-10 border-dashed border-2 border-sapphire-200 bg-white">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-slate-500 text-sm font-medium">No active projects found</p>
            <button
              onClick={() => navigate('/projects')}
              className="mt-3 btn-primary text-xs px-4 py-2"
            >
              <Plus className="w-3.5 h-3.5" /> Create Project
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeProjects.map((p) => (
              <ProjectCard key={p.id} project={p} expenses={expenses} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Receipts Log */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title mb-0">
            <Receipt className="w-3.5 h-3.5 text-amber-500" /> Recent Receipts
          </p>
          <button
            onClick={() => navigate('/expenses')}
            className="flex items-center gap-1 text-xs font-bold text-sapphire-800 hover:text-sapphire-900 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="card text-center py-10 border-dashed border-2 border-sapphire-200 bg-white">
            <Receipt className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-slate-500 text-sm font-medium">No receipts logged yet</p>
            <button
              onClick={() => navigate('/add-expense')}
              className="mt-3 btn-gold text-xs px-4 py-2"
            >
              <Plus className="w-3.5 h-3.5" /> Record First Receipt
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.slice(0, 5).map((e) => (
              <div
                key={e.id}
                onClick={() => navigate('/expenses')}
                className="card py-3 px-4 flex items-center justify-between gap-3 hover:border-sapphire-200 transition-all cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-slate-900 truncate">{e.storeName}</p>
                    <span className={`badge text-[10px] shrink-0 ${expenseTypeColor(e.type)}`}>
                      {expenseTypeLabel(e.type).split(' ')[0]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {e.date?.toDate
                      ? e.date.toDate().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                      : ''}
                    {e.projectName ? ` · ${e.projectName}` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold text-slate-900">{formatPeso(e.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
