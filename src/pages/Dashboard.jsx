import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../hooks/useExpenses';
import { useProjects } from '../hooks/useProjects';
import { formatPeso, calcPercent, expenseTypeColor, expenseTypeLabel, statusColor } from '../utils/formatters';
import { TrendingUp, TrendingDown, Wallet, Briefcase, Building2, Zap, ArrowRight, Plus } from 'lucide-react';

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-xl ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-xl font-bold text-gray-900 leading-none mb-1">{value}</p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
    </div>
  );
}

function ProjectCard({ project, expenses }) {
  const navigate = useNavigate();
  const projectExpenses = expenses
    .filter(e => e.type === 'project' && e.projectId === project.id)
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const remaining = (project.contractAmount || 0) - projectExpenses;
  const pct = calcPercent(projectExpenses, project.contractAmount);
  const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500';

  return (
    <button
      onClick={() => navigate(`/projects/${project.id}`)}
      className="w-full card text-left active:scale-[0.99] transition-transform duration-100"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 mr-2">
          <p className="font-semibold text-gray-900 text-sm truncate">{project.name}</p>
          <p className="text-xs text-gray-500 truncate">{project.client}</p>
        </div>
        <span className={`badge ${statusColor(project.status)} shrink-0`}>
          {project.status}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <p className="text-xs text-gray-400">Contract</p>
          <p className="text-xs font-semibold text-gray-900">{formatPeso(project.contractAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Expenses</p>
          <p className="text-xs font-semibold text-red-600">{formatPeso(projectExpenses)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Remaining</p>
          <p className={`text-xs font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPeso(remaining)}
          </p>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div className={`${barColor} h-1.5 rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-right text-xs text-gray-400 mt-1">{pct}% used</p>
    </button>
  );
}

export default function Dashboard() {
  const { expenses, loading: expLoading } = useExpenses();
  const { projects, loading: projLoading } = useProjects();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const projectIncome = projects
      .reduce((s, p) => s + (Number(p.contractAmount) || 0), 0);

    const projectExp = expenses
      .filter(e => e.type === 'project')
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const operationExp = expenses
      .filter(e => e.type === 'operation')
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const officeExp = expenses
      .filter(e => e.type === 'office')
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const totalExp = projectExp + operationExp + officeExp;
    const net = projectIncome - totalExp;

    return { projectIncome, projectExp, operationExp, officeExp, totalExp, net };
  }, [expenses, projects]);

  const activeProjects = useMemo(() =>
    projects.filter(p => p.status === 'active'),
  [projects]);

  const loading = expLoading || projLoading;

  if (loading) {
    return (
      <div className="page-container">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="stat-card h-24 shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      {/* Summary grid */}
      <div className="mb-6">
        <p className="section-title">Financial Overview</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Project Income"
            value={formatPeso(stats.projectIncome)}
            icon={TrendingUp}
            color="bg-blue-100 text-blue-700"
          />
          <StatCard
            label="Total Expenses"
            value={formatPeso(stats.totalExp)}
            icon={TrendingDown}
            color="bg-red-100 text-red-700"
          />
          <StatCard
            label="Project Expenses"
            value={formatPeso(stats.projectExp)}
            icon={Briefcase}
            color="bg-indigo-100 text-indigo-700"
          />
          <StatCard
            label="Operation Expenses"
            value={formatPeso(stats.operationExp)}
            icon={Zap}
            color="bg-amber-100 text-amber-700"
          />
          <StatCard
            label="Office Expenses"
            value={formatPeso(stats.officeExp)}
            icon={Building2}
            color="bg-purple-100 text-purple-700"
          />
          <StatCard
            label="Net Amount"
            value={formatPeso(stats.net)}
            icon={Wallet}
            color={stats.net >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
          />
        </div>
      </div>

      {/* Active Projects */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="section-title mb-0">Active Projects</p>
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1 text-brand-700 text-xs font-medium"
          >
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {activeProjects.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-400 text-sm">No active projects</p>
            <button
              onClick={() => navigate('/projects')}
              className="mt-3 btn-primary text-xs px-4 py-2"
            >
              <Plus className="w-3.5 h-3.5" /> Add Project
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeProjects.map(p => (
              <ProjectCard key={p.id} project={p} expenses={expenses} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Expenses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title mb-0">Recent Expenses</p>
          <button
            onClick={() => navigate('/expenses')}
            className="flex items-center gap-1 text-brand-700 text-xs font-medium"
          >
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-400 text-sm">No expenses yet</p>
            <button
              onClick={() => navigate('/add-expense')}
              className="mt-3 btn-primary text-xs px-4 py-2"
            >
              <Plus className="w-3.5 h-3.5" /> Add Expense
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.slice(0, 5).map(e => (
              <div key={e.id} className="card py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{e.storeName}</p>
                  <p className="text-xs text-gray-500">
                    {e.date?.toDate ? e.date.toDate().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    {e.projectName ? ` · ${e.projectName}` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{formatPeso(e.amount)}</p>
                  <span className={`badge text-[10px] ${expenseTypeColor(e.type)}`}>
                    {expenseTypeLabel(e.type).split(' ')[0]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
