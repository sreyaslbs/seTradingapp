import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useProjects } from '../hooks/useProjects';
import { useExpenses } from '../hooks/useExpenses';
import { formatPeso, formatDate, formatDateInput, todayInput, statusColor, calcPercent } from '../utils/formatters';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { Plus, ChevronRight, Pencil, Trash2, Search } from 'lucide-react';

const STATUS_OPTIONS = ['active', 'completed', 'on-hold'];

function ProjectForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: defaultValues || { status: 'active', startDate: todayInput() }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-6">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Project Name *</label>
        <input
          {...register('name', { required: 'Project name is required' })}
          placeholder="e.g. ABC Building Electrical Work"
          className="input-field"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Client / Customer *</label>
        <input
          {...register('client', { required: 'Client name is required' })}
          placeholder="e.g. ABC Corporation"
          className="input-field"
        />
        {errors.client && <p className="text-red-500 text-xs mt-1">{errors.client.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Contract Amount (₱) *</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₱</span>
          <input
            type="number"
            min="0"
            step="0.01"
            {...register('contractAmount', { required: 'Amount is required', min: { value: 0, message: 'Must be positive' } })}
            placeholder="0.00"
            className="input-field pl-8"
            inputMode="decimal"
          />
        </div>
        {errors.contractAmount && <p className="text-red-500 text-xs mt-1">{errors.contractAmount.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Start Date *</label>
          <input type="date" {...register('startDate', { required: true })} className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">End Date</label>
          <input type="date" {...register('endDate')} className="input-field" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Status</label>
        <div className="grid grid-cols-3 gap-2">
          {STATUS_OPTIONS.map(s => {
            const checked = watch('status') === s;
            return (
              <label
                key={s}
                className={`flex items-center justify-center p-2.5 rounded-xl border-2 cursor-pointer capitalize text-xs font-medium transition-all ${
                  checked ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'
                }`}
              >
                <input type="radio" value={s} {...register('status')} className="sr-only" />
                {s.replace('-', ' ')}
              </label>
            );
          })}
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
        {loading ? 'Saving…' : 'Save Project'}
      </button>
    </form>
  );
}

export default function Projects() {
  const { projects, loading, addProject, updateProject, deleteProject } = useProjects();
  const { expenses } = useExpenses();
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.client || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleAdd = async (data) => {
    try {
      setFormLoading(true);
      await addProject(data);
      setShowAdd(false);
      toast.success('Project added!');
    } catch (err) {
      console.error('Error adding project:', err);
      if (err.code === 'permission-denied') {
        toast.error('Permission denied: Please update Firestore Rules in Firebase Console.', { duration: 6000 });
      } else {
        toast.error(err.message || 'Failed to add project');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (data) => {
    try {
      setFormLoading(true);
      await updateProject(editing.id, data);
      setEditing(null);
      toast.success('Project updated!');
    } catch (err) {
      console.error('Error updating project:', err);
      if (err.code === 'permission-denied') {
        toast.error('Permission denied: Please update Firestore Rules in Firebase Console.', { duration: 6000 });
      } else {
        toast.error(err.message || 'Failed to update project');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteProject(deleting.id);
      setDeleting(null);
      toast.success('Project deleted');
    } catch (err) {
      console.error('Error deleting project:', err);
      toast.error(err.message || 'Failed to delete project');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getProjectExpenses = (projectId) =>
    expenses.filter(e => e.type === 'project' && e.projectId === projectId)
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);

  return (
    <div className="page-container">
      {/* Search + filter */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="input-field pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scroll-hidden pb-1">
          {['all', 'active', 'completed', 'on-hold'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${
                filterStatus === s
                  ? 'bg-brand-800 text-white border-brand-800'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {s === 'all' ? 'All' : s.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Add button */}
      <button onClick={() => setShowAdd(true)} className="btn-primary w-full mb-4">
        <Plus className="w-4 h-4" /> New Project
      </button>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-28 shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-sm">No projects found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => {
            const pExp = getProjectExpenses(p.id);
            const remaining = (p.contractAmount || 0) - pExp;
            const pct = calcPercent(pExp, p.contractAmount);
            const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500';

            return (
              <div key={p.id} className="card">
                <div className="flex items-start gap-2 mb-3">
                  <button
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-gray-900 text-sm">{p.name}</span>
                    </div>
                    <p className="text-xs text-gray-500">{p.client}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(p.startDate)}{p.endDate ? ` → ${formatDate(p.endDate)}` : ''}
                    </p>
                  </button>
                  <span className={`badge ${statusColor(p.status)} shrink-0`}>{p.status.replace('-', ' ')}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                  <div className="bg-gray-50 rounded-xl p-2">
                    <p className="text-xs text-gray-400">Contract</p>
                    <p className="text-xs font-bold text-gray-900">{formatPeso(p.contractAmount)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2">
                    <p className="text-xs text-gray-400">Expenses</p>
                    <p className="text-xs font-bold text-red-600">{formatPeso(pExp)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2">
                    <p className="text-xs text-gray-400">Remaining</p>
                    <p className={`text-xs font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatPeso(remaining)}</p>
                  </div>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                  <div className={`${barColor} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-right text-xs text-gray-400 mb-3">{pct}% used</p>

                <div className="flex gap-2 border-t border-gray-100 pt-3">
                  <button
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-brand-700 font-medium rounded-xl bg-brand-50 active:bg-brand-100"
                  >
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditing({ ...p, startDate: formatDateInput(p.startDate), endDate: formatDateInput(p.endDate) })}
                    className="p-2 rounded-xl bg-gray-100 text-gray-600 active:bg-gray-200"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleting(p)}
                    className="p-2 rounded-xl bg-red-50 text-red-500 active:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New Project">
        <ProjectForm onSubmit={handleAdd} loading={formLoading} />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Project">
        {editing && <ProjectForm defaultValues={editing} onSubmit={handleEdit} loading={formLoading} />}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Project?"
        message={`Are you sure you want to delete "${deleting?.name}"? This will not delete associated expenses.`}
      />
    </div>
  );
}
