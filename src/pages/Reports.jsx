import { useState, useMemo } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { useProjects } from '../hooks/useProjects';
import { formatPeso, getDateRange } from '../utils/formatters';
import { exportToExcel } from '../utils/excelExport';
import { FileSpreadsheet, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const PERIODS = [
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'this-year', label: 'This Year' },
  { value: 'custom', label: 'Custom' },
];

function SummaryRow({ label, value, highlight, indent }) {
  return (
    <div className={`flex items-center justify-between py-2.5 ${indent ? 'pl-4' : ''} ${highlight ? 'border-t-2 border-gray-200 mt-1' : 'border-t border-gray-100'}`}>
      <span className={`text-sm ${highlight ? 'font-bold text-gray-900' : indent ? 'text-gray-500' : 'text-gray-700'}`}>{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-brand-800 text-base' : 'text-gray-900'}`}>{formatPeso(value)}</span>
    </div>
  );
}

export default function Reports() {
  const { expenses, loading: expLoading } = useExpenses();
  const { projects, loading: projLoading } = useProjects();
  const [period, setPeriod] = useState('this-month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [exporting, setExporting] = useState(false);

  const filteredExpenses = useMemo(() => {
    let range = null;
    if (period === 'custom') {
      if (customFrom || customTo) {
        range = {
          start: customFrom ? new Date(customFrom) : new Date(0),
          end: customTo ? (() => { const d = new Date(customTo); d.setHours(23, 59, 59, 999); return d; })() : new Date(),
        };
      }
    } else {
      range = getDateRange(period);
    }

    if (!range) return expenses;

    return expenses.filter(e => {
      const d = e.date?.toDate ? e.date.toDate() : new Date(e.date);
      return d >= range.start && d <= range.end;
    });
  }, [expenses, period, customFrom, customTo]);

  const stats = useMemo(() => {
    const projectIncome = projects.reduce((s, p) => s + (Number(p.contractAmount) || 0), 0);

    const projectExp = filteredExpenses
      .filter(e => e.type === 'project')
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const operationExp = filteredExpenses
      .filter(e => e.type === 'operation')
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const officeExp = filteredExpenses
      .filter(e => e.type === 'office')
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const totalExp = projectExp + operationExp + officeExp;
    const net = projectIncome - totalExp;

    return { projectIncome, projectExp, operationExp, officeExp, totalExp, net };
  }, [filteredExpenses, projects]);

  // Per-project summary
  const projectSummary = useMemo(() => {
    const map = {};
    filteredExpenses.forEach(e => {
      if (e.type === 'project' && e.projectId) {
        if (!map[e.projectId]) {
          map[e.projectId] = { name: e.projectName || 'Unknown', total: 0 };
        }
        map[e.projectId].total += Number(e.amount) || 0;
      }
    });

    return projects.map(p => ({
      ...p,
      expensesInPeriod: map[p.id]?.total || 0,
    })).filter(p => p.contractAmount > 0 || (map[p.id]?.total || 0) > 0);
  }, [filteredExpenses, projects]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const label = PERIODS.find(p => p.value === period)?.label?.replace(' ', '_') || 'Custom';
      exportToExcel(filteredExpenses, projects, label);
      toast.success('Excel file exported!');
    } catch (err) {
      toast.error('Export failed');
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const currentPeriodLabel = PERIODS.find(p => p.value === period)?.label;

  return (
    <div className="page-container">
      {/* Period tabs */}
      <div className="flex gap-2 overflow-x-auto scroll-hidden pb-2 mb-4">
        {PERIODS.map(p => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold border-2 transition-all ${
              period === p.value
                ? 'bg-brand-800 text-white border-brand-800'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      {period === 'custom' && (
        <div className="card mb-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-brand-700" />
            <p className="text-xs font-semibold text-gray-700">Date Range</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="input-field py-2 text-xs" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="input-field py-2 text-xs" />
            </div>
          </div>
        </div>
      )}

      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={exporting || filteredExpenses.length === 0}
        className="btn-primary w-full mb-4"
      >
        <FileSpreadsheet className="w-4 h-4" />
        {exporting ? 'Exporting…' : `Export to Excel (${filteredExpenses.length} records)`}
      </button>

      {/* Summary card */}
      <div className="card mb-4">
        <p className="section-title">Summary — {currentPeriodLabel}</p>
        <SummaryRow label="Project Income (Total Contracts)" value={stats.projectIncome} />
        <div>
          <SummaryRow label="Project Expenses" value={stats.projectExp} indent />
          <SummaryRow label="Operation Expenses" value={stats.operationExp} indent />
          <SummaryRow label="Office Expenses" value={stats.officeExp} indent />
        </div>
        <SummaryRow label="Total Expenses" value={stats.totalExp} />
        <div className={`flex items-center justify-between py-3 border-t-2 border-brand-200 mt-1`}>
          <span className="text-sm font-bold text-gray-900">Net Result</span>
          <span className={`text-base font-bold ${stats.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPeso(stats.net)}
          </span>
        </div>
      </div>

      {/* Project-wise breakdown */}
      <div>
        <p className="section-title">Project Breakdown</p>
        {projectSummary.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-400 text-sm">No projects to show</p>
          </div>
        ) : (
          <div className="space-y-2">
            {projectSummary.map(p => {
              const remaining = (p.contractAmount || 0) - p.expensesInPeriod;
              const pct = p.contractAmount ? Math.min(100, Math.round((p.expensesInPeriod / p.contractAmount) * 100)) : 0;
              const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500';
              return (
                <div key={p.id} className="card">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.client}</p>
                    </div>
                    <span className={`badge ${p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'} shrink-0 text-[10px]`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="bg-blue-50 rounded-xl p-2">
                      <p className="text-[10px] text-gray-400">Contract</p>
                      <p className="text-xs font-bold text-gray-900">{formatPeso(p.contractAmount)}</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-2">
                      <p className="text-[10px] text-gray-400">Expenses</p>
                      <p className="text-xs font-bold text-red-600">{formatPeso(p.expensesInPeriod)}</p>
                    </div>
                    <div className={`${remaining >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-xl p-2`}>
                      <p className="text-[10px] text-gray-400">Remaining</p>
                      <p className={`text-xs font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatPeso(remaining)}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className={`${barColor} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-right text-xs text-gray-400 mt-1">{pct}% used</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
