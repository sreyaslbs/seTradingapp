import { useState, useMemo } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { useProjects } from '../hooks/useProjects';
import { formatPeso, getDateRange } from '../utils/formatters';
import { exportToExcel } from '../utils/excelExport';
import { FileSpreadsheet, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

const PERIODS = [
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'this-year', label: 'This Year' },
  { value: 'custom', label: 'Custom' },
];

function SummaryRow({ label, value, highlight, indent, isNegative }) {
  return (
    <div
      className={`flex items-center justify-between py-3 ${indent ? 'pl-4 text-xs' : 'text-sm'} ${
        highlight ? 'border-t-2 border-sapphire-200 mt-1.5 pt-3' : 'border-t border-slate-100'
      }`}
    >
      <span className={highlight ? 'font-bold text-slate-900' : indent ? 'text-slate-500 font-medium' : 'text-slate-700 font-semibold'}>
        {label}
      </span>
      <span
        className={`font-extrabold ${
          highlight
            ? isNegative
              ? 'text-rose-600 text-base'
              : 'text-emerald-600 text-base'
            : indent
            ? 'text-slate-700'
            : 'text-slate-900'
        }`}
      >
        {formatPeso(value)}
      </span>
    </div>
  );
}

export default function Reports() {
  const { expenses } = useExpenses();
  const { projects } = useProjects();
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
          end: customTo
            ? (() => {
                const d = new Date(customTo);
                d.setHours(23, 59, 59, 999);
                return d;
              })()
            : new Date(),
        };
      }
    } else {
      range = getDateRange(period);
    }

    if (!range) return expenses;

    return expenses.filter((e) => {
      const d = e.date?.toDate ? e.date.toDate() : new Date(e.date);
      return d >= range.start && d <= range.end;
    });
  }, [expenses, period, customFrom, customTo]);

  const stats = useMemo(() => {
    const projectIncome = projects.reduce((s, p) => s + (Number(p.contractAmount) || 0), 0);

    const projectExp = filteredExpenses
      .filter((e) => e.type === 'project')
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const operationExp = filteredExpenses
      .filter((e) => e.type === 'operation')
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const officeExp = filteredExpenses
      .filter((e) => e.type === 'office')
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const totalExp = projectExp + operationExp + officeExp;
    const net = projectIncome - totalExp;

    return { projectIncome, projectExp, operationExp, officeExp, totalExp, net };
  }, [filteredExpenses, projects]);

  // Per-project summary
  const projectSummary = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((e) => {
      if (e.type === 'project' && e.projectId) {
        if (!map[e.projectId]) {
          map[e.projectId] = { name: e.projectName || 'Unknown', total: 0 };
        }
        map[e.projectId].total += Number(e.amount) || 0;
      }
    });

    return projects
      .map((p) => ({
        ...p,
        expensesInPeriod: map[p.id]?.total || 0,
      }))
      .filter((p) => p.contractAmount > 0 || (map[p.id]?.total || 0) > 0);
  }, [filteredExpenses, projects]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const label = PERIODS.find((p) => p.value === period)?.label?.replace(' ', '_') || 'Custom';
      exportToExcel(filteredExpenses, projects, label);
      toast.success('Excel spreadsheet exported successfully!');
    } catch (err) {
      toast.error('Export failed');
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const currentPeriodLabel = PERIODS.find((p) => p.value === period)?.label;

  return (
    <div className="page-container space-y-4">
      {/* Period Tabs */}
      <div className="flex gap-1.5 overflow-x-auto scroll-hidden p-1.5 rounded-2xl bg-sapphire-100/70 border border-sapphire-200/80">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              period === p.value
                ? 'bg-sapphire-950 text-amber-400 shadow-md'
                : 'text-sapphire-900/70 hover:text-sapphire-950 hover:bg-white/50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range Card */}
      {period === 'custom' && (
        <div className="card animate-slide-up border-sapphire-200 bg-sapphire-50/40 space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sapphire-700" />
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Custom Date Range</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">From Date</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="input-field py-2 text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">To Date</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="input-field py-2 text-xs bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Solar Amber Excel Export Action Button */}
      <button
        onClick={handleExport}
        disabled={exporting || filteredExpenses.length === 0}
        className="btn-gold w-full flex items-center justify-center gap-2.5 shadow-md shadow-amber-500/20"
      >
        <FileSpreadsheet className="w-5 h-5 text-slate-950" />
        <span className="text-sm font-extrabold">
          {exporting ? 'Generating Spreadsheet…' : `Export to Excel (${filteredExpenses.length} Records)`}
        </span>
      </button>

      {/* Statement of Financial Performance */}
      <div className="card">
        <p className="section-title">
          <BarChart3 className="w-3.5 h-3.5 text-amber-500" /> Financial Summary — {currentPeriodLabel}
        </p>

        <SummaryRow label="Project Income (Contract Sum)" value={stats.projectIncome} />
        <div>
          <SummaryRow label="Project Expenses" value={stats.projectExp} indent />
          <SummaryRow label="Operation Expenses" value={stats.operationExp} indent />
          <SummaryRow label="Office Expenses" value={stats.officeExp} indent />
        </div>
        <SummaryRow label="Total Operating Expenses" value={stats.totalExp} />

        <SummaryRow
          label="Net Result"
          value={stats.net}
          highlight
          isNegative={stats.net < 0}
        />
      </div>

      {/* Project-Wise Health Breakdown */}
      <div>
        <p className="section-title">
          <TrendingUp className="w-3.5 h-3.5 text-amber-500" /> Project Breakdown ({projectSummary.length})
        </p>

        {projectSummary.length === 0 ? (
          <div className="card text-center py-8 border-dashed border-2 border-sapphire-200">
            <p className="text-slate-400 text-sm font-medium">No project records for this period</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projectSummary.map((p) => {
              const remaining = (p.contractAmount || 0) - p.expensesInPeriod;
              const pct = p.contractAmount
                ? Math.min(100, Math.round((p.expensesInPeriod / p.contractAmount) * 100))
                : 0;
              const barGradient =
                pct >= 90
                  ? 'bg-gradient-to-r from-rose-500 to-red-600'
                  : pct >= 70
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500';

              return (
                <div key={p.id} className="card hover:border-sapphire-200 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-extrabold text-slate-900 truncate">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.client}</p>
                    </div>
                    <span className="badge bg-sapphire-50 text-sapphire-800 border border-sapphire-200 text-[10px] font-bold shrink-0">
                      {p.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center mb-3 bg-sapphire-50/50 p-2.5 rounded-xl border border-sapphire-100">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Contract</p>
                      <p className="text-xs font-bold text-slate-900">{formatPeso(p.contractAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Period Exp</p>
                      <p className="text-xs font-bold text-rose-600">{formatPeso(p.expensesInPeriod)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Balance</p>
                      <p className={`text-xs font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatPeso(remaining)}
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-1">
                    <div className={`${barGradient} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                    <span>Budget Utilized</span>
                    <span className="font-bold text-slate-600">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
