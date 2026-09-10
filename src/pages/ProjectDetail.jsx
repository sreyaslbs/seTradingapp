import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useExpenses } from '../hooks/useExpenses';
import { formatPeso, formatDate, calcPercent, statusColor } from '../utils/formatters';
import { Wallet, TrendingDown, Plus } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();
  const { projects } = useProjects();
  const { expenses } = useExpenses();
  const navigate = useNavigate();

  const project = projects.find(p => p.id === id);

  const projectExpenses = useMemo(() =>
    expenses.filter(e => e.type === 'project' && e.projectId === id),
    [expenses, id]
  );

  const totalExpenses = projectExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const remaining = (project?.contractAmount || 0) - totalExpenses;
  const pct = calcPercent(totalExpenses, project?.contractAmount);
  const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500';

  if (!project) {
    return (
      <div className="page-container text-center py-20">
        <p className="text-gray-400">Project not found</p>
        <button onClick={() => navigate('/projects')} className="btn-primary mt-4">Back to Projects</button>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      {/* Header card */}
      <div className="card mb-4">
        <div className="flex items-start justify-between mb-1">
          <h1 className="font-bold text-gray-900 text-base leading-tight flex-1 mr-2">{project.name}</h1>
          <span className={`badge ${statusColor(project.status)} shrink-0`}>{project.status.replace('-', ' ')}</span>
        </div>
        <p className="text-gray-500 text-sm mb-1">{project.client}</p>
        <p className="text-xs text-gray-400">
          {formatDate(project.startDate)}
          {project.endDate ? ` → ${formatDate(project.endDate)}` : ' (ongoing)'}
        </p>
      </div>

      {/* Financial summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Contract</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{formatPeso(project.contractAmount)}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-red-100 text-red-700 rounded-lg">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Total Expenses</span>
          </div>
          <p className="text-lg font-bold text-red-600">{formatPeso(totalExpenses)}</p>
        </div>
        <div className="stat-card col-span-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-medium">Remaining Amount</span>
            <span className="text-xs text-gray-400">{pct}% used</span>
          </div>
          <p className={`text-xl font-bold mb-3 ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPeso(remaining)}
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Add expense shortcut */}
      <button
        onClick={() => navigate('/add-expense', { state: { projectId: project.id, projectName: project.name } })}
        className="btn-primary w-full mb-4"
      >
        <Plus className="w-4 h-4" /> Add Expense to This Project
      </button>

      {/* Expense list */}
      <div>
        <p className="section-title">Project Expenses ({projectExpenses.length})</p>
        {projectExpenses.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-gray-400 text-sm">No expenses recorded for this project</p>
          </div>
        ) : (
          <div className="space-y-2">
            {projectExpenses.map(e => (
              <div key={e.id} className="card py-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{e.storeName}</p>
                    {e.address && <p className="text-xs text-gray-500 truncate">{e.address}</p>}
                    {e.tin && <p className="text-xs text-gray-400">TIN: {e.tin}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {e.date?.toDate
                        ? e.date.toDate().toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
                        : ''}
                    </p>
                    {e.notes && <p className="text-xs text-gray-500 mt-1 italic">{e.notes}</p>}
                  </div>
                  <p className="text-sm font-bold text-gray-900 shrink-0">{formatPeso(e.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
