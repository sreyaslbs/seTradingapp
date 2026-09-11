import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useExpenses } from '../hooks/useExpenses';
import { formatPeso, formatDate, calcPercent, statusColor } from '../utils/formatters';
import { Wallet, TrendingDown, Plus, Calendar, Building, Receipt } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();
  const { projects } = useProjects();
  const { expenses } = useExpenses();
  const navigate = useNavigate();

  const project = projects.find((p) => p.id === id);

  const projectExpenses = useMemo(
    () => expenses.filter((e) => e.type === 'project' && e.projectId === id),
    [expenses, id]
  );

  const totalExpenses = projectExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const remaining = (project?.contractAmount || 0) - totalExpenses;
  const pct = calcPercent(totalExpenses, project?.contractAmount);

  const barGradient =
    pct >= 90
      ? 'bg-gradient-to-r from-rose-500 to-red-600'
      : pct >= 70
      ? 'bg-gradient-to-r from-amber-500 to-amber-600'
      : 'bg-gradient-to-r from-emerald-500 to-teal-500';

  if (!project) {
    return (
      <div className="page-container text-center py-20">
        <p className="text-slate-400 font-medium">Project not found</p>
        <button onClick={() => navigate('/projects')} className="btn-primary mt-4">
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in space-y-4">
      {/* Project Header Card */}
      <div className="card border-sapphire-100">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h1 className="font-extrabold text-slate-900 text-lg leading-snug flex-1">
            {project.name}
          </h1>
          <span className={`badge ${statusColor(project.status)} shrink-0`}>
            {project.status.replace('-', ' ')}
          </span>
        </div>

        <div className="space-y-1 text-xs text-slate-500">
          <p className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Building className="w-3.5 h-3.5 text-sapphire-500" />
            <span>Client: {project.client}</span>
          </p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {formatDate(project.startDate)}
              {project.endDate ? ` → ${formatDate(project.endDate)}` : ' (Ongoing)'}
            </span>
          </p>
        </div>
      </div>

      {/* Financial Health Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-sapphire-50 text-sapphire-700 rounded-lg">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Contract</span>
          </div>
          <p className="text-lg font-extrabold text-slate-900">{formatPeso(project.contractAmount)}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Expenses</span>
          </div>
          <p className="text-lg font-extrabold text-rose-600">{formatPeso(totalExpenses)}</p>
        </div>

        <div className="stat-card col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Remaining Balance</span>
            <span className="text-xs font-bold text-slate-600">{pct}% utilized</span>
          </div>
          <p
            className={`text-2xl font-black mb-3 ${
              remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatPeso(remaining)}
          </p>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`${barGradient} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add Expense Shortcut Button */}
      <button
        onClick={() =>
          navigate('/add-expense', { state: { projectId: project.id, projectName: project.name } })
        }
        className="btn-gold w-full flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        <span>Add Receipt for this Project</span>
      </button>

      {/* Linked Expenses Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title mb-0">
            <Receipt className="w-3.5 h-3.5 text-amber-500" /> Linked Receipts ({projectExpenses.length})
          </p>
        </div>

        {projectExpenses.length === 0 ? (
          <div className="card text-center py-10 border-dashed border-2 border-sapphire-200">
            <Receipt className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-slate-400 text-sm font-medium">No receipts logged for this project yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {projectExpenses.map((e) => (
              <div key={e.id} className="card py-3 px-4 hover:border-sapphire-200 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{e.storeName}</p>
                    {(e.address || e.tin) && (
                      <p className="text-xs text-slate-400 truncate">
                        {e.address} {e.tin ? `(TIN: ${e.tin})` : ''}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {e.date?.toDate
                        ? e.date.toDate().toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
                        : ''}
                    </p>
                    {e.notes && (
                      <p className="text-xs text-slate-600 italic mt-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        "{e.notes}"
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-extrabold text-slate-900 shrink-0">{formatPeso(e.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
