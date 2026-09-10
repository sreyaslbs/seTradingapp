import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useExpenses } from '../hooks/useExpenses';
import { useProjects } from '../hooks/useProjects';
import { formatPeso, formatDate, formatDateInput, todayInput, expenseTypeColor, expenseTypeLabel, statusColor } from '../utils/formatters';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { Search, Pencil, Trash2, ChevronDown, Filter, X } from 'lucide-react';

const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'project', label: 'Project' },
  { value: 'operation', label: 'Operation' },
  { value: 'office', label: 'Office' },
];

function ExpenseForm({ defaultValues, onSubmit, loading, projects }) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: defaultValues || { date: todayInput(), type: 'project' }
  });
  const selectedType = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-6">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Expense Type *</label>
        <div className="relative">
          <select {...register('type', { required: true })} className="input-field appearance-none pr-10">
            <option value="project">Project Expense</option>
            <option value="operation">Operation Expense</option>
            <option value="office">Office Expense</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {selectedType === 'project' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Project *</label>
          <div className="relative">
            <select
              {...register('projectId', { required: selectedType === 'project' })}
              className="input-field appearance-none pr-10"
              onChange={e => {
                const p = projects.find(pr => pr.id === e.target.value);
                setValue('projectName', p?.name || '');
              }}
            >
              <option value="">-- Select Project --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.client})</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          {errors.projectId && <p className="text-red-500 text-xs mt-1">Please select a project</p>}
          <input type="hidden" {...register('projectName')} />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Date *</label>
        <input type="date" {...register('date', { required: true })} className="input-field" />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Store Name *</label>
        <input
          {...register('storeName', { required: 'Store name is required' })}
          placeholder="e.g. Ace Hardware"
          className="input-field"
        />
        {errors.storeName && <p className="text-red-500 text-xs mt-1">{errors.storeName.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Amount (₱) *</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₱</span>
          <input
            type="number" min="0" step="0.01"
            {...register('amount', { required: true, min: 0.01 })}
            placeholder="0.00"
            className="input-field pl-8"
            inputMode="decimal"
          />
        </div>
        {errors.amount && <p className="text-red-500 text-xs mt-1">Valid amount required</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Address</label>
        <input {...register('address')} placeholder="Store address" className="input-field" />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">TIN #</label>
        <input {...register('tin')} placeholder="Tax Identification Number" className="input-field" />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Notes</label>
        <textarea {...register('notes')} placeholder="Optional notes…" rows={2} className="input-field resize-none" />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Saving…' : 'Save Changes'}
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
    return expenses.filter(e => {
      const matchSearch = !search ||
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
      const projectData = data.type === 'project'
        ? { projectId: data.projectId, projectName: data.projectName || projects.find(p => p.id === data.projectId)?.name || '' }
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
    <div className="page-container">
      {/* Search bar */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search expenses…"
            className="input-field pl-9"
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`relative p-3 rounded-xl border-2 transition-colors ${
            showFilters || activeFiltersCount > 0
              ? 'border-brand-600 bg-brand-50 text-brand-700'
              : 'border-gray-200 bg-white text-gray-600'
          }`}
        >
          <Filter className="w-4 h-4" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-700 text-white text-[10px] flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Type filter chips */}
      <div className="flex gap-2 overflow-x-auto scroll-hidden pb-2 mb-3">
        {TYPE_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTypeFilter(value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              typeFilter === value
                ? 'bg-brand-800 text-white border-brand-800'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Advanced filters panel */}
      {showFilters && (
        <div className="card mb-3 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-700">Filters</p>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-red-500 flex items-center gap-1">
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Project</label>
            <div className="relative">
              <select
                value={projectFilter}
                onChange={e => setProjectFilter(e.target.value)}
                className="input-field appearance-none pr-10 text-xs py-2"
              >
                <option value="">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From Date</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-field py-2 text-xs" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To Date</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-field py-2 text-xs" />
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500">{filtered.length} expense{filtered.length !== 1 ? 's' : ''}</p>
        <p className="text-sm font-bold text-gray-900">{formatPeso(totalFiltered)}</p>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="card h-20 shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-sm">No expenses found</p>
          <button onClick={() => navigate('/add-expense')} className="btn-primary text-xs px-4 py-2 mt-3">
            Add Expense
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(e => (
            <div key={e.id} className="card py-3">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-900 truncate">{e.storeName}</p>
                    <span className={`badge text-[10px] shrink-0 ${expenseTypeColor(e.type)}`}>
                      {e.type === 'project' ? 'Project' : e.type === 'operation' ? 'Ops' : 'Office'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {e.date?.toDate
                      ? e.date.toDate().toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
                      : ''}
                    {e.projectName ? ` · ${e.projectName}` : ''}
                  </p>
                  {e.address && <p className="text-xs text-gray-400 truncate">{e.address}</p>}
                  {e.tin && <p className="text-xs text-gray-400">TIN: {e.tin}</p>}
                  {e.notes && <p className="text-xs text-gray-500 italic mt-0.5">{e.notes}</p>}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <p className="text-sm font-bold text-gray-900">{formatPeso(e.amount)}</p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setEditing({ ...e, date: formatDateInput(e.date) })}
                      className="p-1.5 rounded-lg bg-gray-100 text-gray-600 active:bg-gray-200"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleting(e)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-500 active:bg-red-100"
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

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Expense">
        {editing && (
          <ExpenseForm
            defaultValues={editing}
            onSubmit={handleEdit}
            loading={editLoading}
            projects={projects}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Expense?"
        message={`Delete the ₱${Number(deleting?.amount || 0).toFixed(2)} expense from "${deleting?.storeName}"?`}
      />
    </div>
  );
}
