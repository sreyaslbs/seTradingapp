import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useExpenses } from '../hooks/useExpenses';
import { useProjects } from '../hooks/useProjects';
import { formatPeso, formatDate, formatDateInput, todayInput, expenseTypeColor, expenseTypeLabel, statusColor } from '../utils/formatters';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { Search, Pencil, Trash2, ChevronDown, Filter, X, Receipt, Plus } from 'lucide-react';

const TYPE_FILTERS = [
  { value: 'all', label: 'All Receipts' },
  { value: 'project', label: 'Project' },
  { value: 'operation', label: 'Operation' },
  { value: 'office', label: 'Office' },
];

function ExpenseForm({ defaultValues, onSubmit, loading, projects }) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: defaultValues || { date: todayInput(), type: 'project' },
  });
  const selectedType = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-6">
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Expense Type *</label>
        <div className="relative">
          <select {...register('type', { required: true })} className="input-field appearance-none pr-10 font-semibold">
            <option value="project">Project Expense</option>
            <option value="operation">Operation Expense</option>
            <option value="office">Office Expense</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {selectedType === 'project' && (
        <div className="p-3.5 rounded-xl bg-sapphire-50 border border-sapphire-200">
          <label className="block text-xs font-bold text-sapphire-950 uppercase tracking-wider mb-1.5">Project *</label>
          <div className="relative">
            <select
              {...register('projectId', { required: selectedType === 'project' })}
              className="input-field appearance-none pr-10 font-semibold bg-white"
              onChange={(e) => {
                const p = projects.find((pr) => pr.id === e.target.value);
                setValue('projectName', p?.name || '');
              }}
            >
              <option value="">-- Select Project --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.client})</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          {errors.projectId && <p className="text-rose-600 text-xs mt-1 font-medium">Please select a project</p>}
          <input type="hidden" {...register('projectName')} />
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Date *</label>
        <input type="date" {...register('date', { required: true })} className="input-field text-xs font-medium" />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Store / Supplier Name *</label>
        <input
          {...register('storeName', { required: 'Store name is required' })}
          placeholder="e.g. Ace Hardware"
          className="input-field font-medium"
        />
        {errors.storeName && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.storeName.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Amount (₱) *</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₱</span>
          <input
            type="number"
            min="0"
            step="0.01"
            {...register('amount', { required: true, min: 0.01 })}
            placeholder="0.00"
            className="input-field pl-8 font-extrabold text-base"
            inputMode="decimal"
          />
        </div>
        {errors.amount && <p className="text-rose-500 text-xs mt-1 font-medium">Valid amount required</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Address</label>
          <input {...register('address')} placeholder="Store address" className="input-field text-xs" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">TIN #</label>
          <input {...register('tin')} placeholder="Tax ID" className="input-field text-xs" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Notes</label>
        <textarea {...register('notes')} placeholder="Optional notes…" rows={2} className="input-field resize-none text-xs" />
      </div>

      <button type="submit" disabled={loading} className="btn-gold w-full mt-2">
        {loading ? 'Saving Changes…' : 'Save Changes'}
      </button>
    </form>
  );
}

export default function Expenses() {
  const { expenses, loading, updateExpense, deleteExpense } = useExpenses();
  const { projects } = useProjects();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        !search ||
        (e.storeName || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.notes || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.address || '').toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || e.type === typeFilter;
      const matchProject = !projectFilter || e.projectId === projectFilter;

      let matchDate = true;
      if (dateFrom || dateTo) {
        const eDate = e.date?.toDate ? e.date.toDate() : new Date(e.date);
        if (dateFrom) matchDate = matchDate && eDate >= new Date(dateFrom);
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(23, 59, 59, 999);
          matchDate = matchDate && eDate <= to;
        }
      }

      return matchSearch && matchType && matchProject && matchDate;
    });
  }, [expenses, search, typeFilter, projectFilter, dateFrom, dateTo]);

  const totalFiltered = filtered.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const activeFiltersCount = [typeFilter !== 'all', projectFilter, dateFrom, dateTo].filter(Boolean).length;

  const handleEdit = async (data) => {
    try {
      setEditLoading(true);
      const projectData =
        data.type === 'project'
          ? { projectId: data.projectId, projectName: data.projectName || projects.find((p) => p.id === data.projectId)?.name || '' }
          : { projectId: null, projectName: null };
      await updateExpense(editing.id, { ...data, ...projectData });
      setEditing(null);
      toast.success('Expense updated!');
    } catch (err) {
      console.error('Error updating expense:', err);
      if (err.code === 'permission-denied') {
        toast.error('Permission denied: Please update Firestore Rules in Firebase Console.', { duration: 6000 });
      } else {
        toast.error(err.message || 'Failed to update expense');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteExpense(deleting.id);
      setDeleting(null);
      toast.success('Expense deleted');
    } catch (err) {
      console.error('Error deleting expense:', err);
      toast.error(err.message || 'Failed to delete expense');
    } finally {
      setDeleteLoading(false);
    }
  };

  const clearFilters = () => {
    setTypeFilter('all');
    setProjectFilter('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="page-container space-y-4">
      {/* Search & Filter Trigger Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search store, notes, address…"
            className="input-field pl-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`relative p-3.5 rounded-xl border-2 transition-all ${
            showFilters || activeFiltersCount > 0
              ? 'border-sapphire-950 bg-sapphire-950 text-amber-400'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
          }`}
          aria-label="Filter options"
        >
          <Filter className="w-4 h-4" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] flex items-center justify-center font-extrabold shadow-sm">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Type Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto scroll-hidden p-1.5 rounded-2xl bg-sapphire-100/70 border border-sapphire-200/80">
        {TYPE_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTypeFilter(value)}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              typeFilter === value
                ? 'bg-sapphire-950 text-amber-400 shadow-md'
                : 'text-sapphire-900/70 hover:text-sapphire-950 hover:bg-white/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Collapsible Advanced Filters Drawer */}
      {showFilters && (
        <div className="card space-y-3 animate-slide-up border-sapphire-200 bg-sapphire-50/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-sapphire-950 uppercase tracking-wider">Advanced Filters</p>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                <X className="w-3 h-3" /> Reset all
              </button>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Filter by Project</label>
            <div className="relative">
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="input-field appearance-none pr-10 text-xs py-2 bg-white"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input-field py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input-field py-2 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Aggregate Stats Bar */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-slate-500">
          Showing {filtered.length} receipt{filtered.length !== 1 ? 's' : ''}
        </span>
        <div className="text-right">
          <span className="text-xs text-slate-400 font-medium mr-1">Total:</span>
          <span className="text-sm font-extrabold text-slate-900">{formatPeso(totalFiltered)}</span>
        </div>
      </div>

      {/* Receipts List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card h-20 shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 border-dashed border-2 border-sapphire-200">
          <Receipt className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-slate-500 text-sm font-medium">No receipts found</p>
          <button
            onClick={() => navigate('/add-expense')}
            className="btn-gold text-xs px-4 py-2 mt-3"
          >
            <Plus className="w-3.5 h-3.5" /> Record Receipt
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((e) => (
            <div key={e.id} className="card py-3.5 px-4 hover:border-sapphire-200 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-extrabold text-slate-900 truncate">{e.storeName}</p>
                    <span className={`badge text-[10px] shrink-0 ${expenseTypeColor(e.type)}`}>
                      {e.type === 'project' ? 'Project' : e.type === 'operation' ? 'Ops' : 'Office'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium">
                    {e.date?.toDate
                      ? e.date.toDate().toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
                      : ''}
                    {e.projectName && (
                      <span className="text-sapphire-800 font-bold"> · {e.projectName}</span>
                    )}
                  </p>

                  {(e.address || e.tin) && (
                    <div className="flex flex-wrap gap-x-2 text-[11px] text-slate-400 mt-1">
                      {e.address && <span className="truncate max-w-[200px]">{e.address}</span>}
                      {e.tin && <span>TIN: {e.tin}</span>}
                    </div>
                  )}

                  {e.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-1.5 rounded-lg mt-1.5 italic border border-slate-100">
                      "{e.notes}"
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                  <p className="text-sm font-extrabold text-slate-900">{formatPeso(e.amount)}</p>

                  <div className="flex gap-1 mt-auto pt-2">
                    <button
                      onClick={() => setEditing({ ...e, date: formatDateInput(e.date) })}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      aria-label="Edit receipt"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleting(e)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                      aria-label="Delete receipt"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Receipt">
        {editing && (
          <ExpenseForm
            defaultValues={editing}
            onSubmit={handleEdit}
            loading={editLoading}
            projects={projects}
          />
        )}
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Receipt?"
        message={`Delete ₱${Number(deleting?.amount || 0).toFixed(2)} receipt from "${deleting?.storeName}"?`}
      />
    </div>
  );
}
