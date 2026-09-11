import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useProjects } from '../hooks/useProjects';
import { useExpenses } from '../hooks/useExpenses';
import { formatPeso, formatDate, formatDateInput, todayInput, statusColor, calcPercent } from '../utils/formatters';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { Plus, ChevronRight, Pencil, Trash2, Search, Briefcase, Calendar } from 'lucide-react';

const STATUS_OPTIONS = ['active', 'completed', 'on-hold'];

function ProjectForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: defaultValues || { status: 'active', startDate: todayInput() },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-6">
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Project Name *</label>
        <input
          {...register('name', { required: 'Project name is required' })}
          placeholder="e.g. ABC Building Solar & Wiring"
          className="input-field"
        />
        {errors.name && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Client / Customer *</label>
        <input
          {...register('client', { required: 'Client name is required' })}
          placeholder="e.g. ABC Corporation"
          className="input-field"
        />
        {errors.client && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.client.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Contract Amount (₱) *</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₱</span>
          <input
            type="number"
            min="0"
            step="0.01"
            {...register('contractAmount', { required: 'Amount is required', min: { value: 0, message: 'Must be positive' } })}
            placeholder="0.00"
            className="input-field pl-8 font-semibold"
            inputMode="decimal"
          />
        </div>
        {errors.contractAmount && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.contractAmount.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Start Date *</label>
          <input type="date" {...register('startDate', { required: true })} className="input-field text-xs font-medium" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">End Date</label>
          <input type="date" {...register('endDate')} className="input-field text-xs font-medium" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Status</label>
        <div className="grid grid-cols-3 gap-2">
          {STATUS_OPTIONS.map((s) => {
            const checked = watch('status') === s;
            return (
              <label
                key={s}
                className={`flex items-center justify-center p-2.5 rounded-xl border-2 cursor-pointer capitalize text-xs font-bold transition-all ${
                  checked
                    ? 'border-sapphire-900 bg-sapphire-900 text-white shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <input type="radio" value={s} {...register('status')} className="sr-only" />
                {s.replace('-', ' ')}
              </label>
            );
          })}
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full mt-3">
        {loading ? 'Saving Project…' : 'Save Project'}
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

  const filtered = projects.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
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
    expenses
      .filter((e) => e.type === 'project' && e.projectId === projectId)
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);

  return (
    <div className="page-container space-y-4">
      {/* Search & Status Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name or client…"
            className="input-field pl-10"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto scroll-hidden p-1.5 rounded-2xl bg-sapphire-100/70 border border-sapphire-200/80">
          {['all', 'active', 'completed', 'on-hold'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                filterStatus === s
                  ? 'bg-sapphire-950 text-amber-400 shadow-md'
                  : 'text-sapphire-900/70 hover:text-sapphire-950 hover:bg-white/50'
              }`}
            >
              {s === 'all' ? 'All Projects' : s.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Add Project Primary Action */}
      <button onClick={() => setShowAdd(true)} className="btn-primary w-full">
        <Plus className="w-4 h-4 text-amber-400" />
        <span>Create New Project</span>
      </button>

      {/* Projects List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-32 shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 border-dashed border-2 border-sapphire-200">
          <Briefcase className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-slate-500 text-sm font-medium">No projects match your filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const pExp = getProjectExpenses(p.id);
            const remaining = (p.contractAmount || 0) - pExp;
            const pct = calcPercent(pExp, p.contractAmount);
            const barGradient =
              pct >= 90
                ? 'bg-gradient-to-r from-rose-500 to-red-600'
                : pct >= 70
                ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500';

            return (
              <div key={p.id} className="card hover:border-sapphire-200 transition-all">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <button
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="flex-1 text-left min-w-0 group"
                  >
                    <span className="font-extrabold text-slate-900 text-sm truncate group-hover:text-sapphire-700 transition-colors block">
                      {p.name}
                    </span>
                    <p className="text-xs text-slate-500 font-medium truncate">{p.client}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(p.startDate)}</span>
                      {p.endDate && <span>→ {formatDate(p.endDate)}</span>}
                    </p>
                  </button>
                  <span className={`badge ${statusColor(p.status)} shrink-0`}>
                    {p.status.replace('-', ' ')}
                  </span>
                </div>

                {/* Financial Summary Box */}
                <div className="grid grid-cols-3 gap-2 mb-3 text-center bg-sapphire-50/50 p-2.5 rounded-xl border border-sapphire-100">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Contract</p>
                    <p className="text-xs font-bold text-slate-900">{formatPeso(p.contractAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Expenses</p>
                    <p className="text-xs font-bold text-rose-600">{formatPeso(pExp)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Remaining</p>
                    <p className={`text-xs font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatPeso(remaining)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-1">
                  <div className={`${barGradient} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium mb-3">
                  <span>Usage</span>
                  <span className="font-bold text-slate-600">{pct}%</span>
                </div>

                {/* Card Actions */}
                <div className="flex gap-2 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-sapphire-900 font-bold rounded-xl bg-sapphire-50 hover:bg-sapphire-100 active:bg-sapphire-200 transition-colors"
                  >
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      setEditing({
                        ...p,
                        startDate: formatDateInput(p.startDate),
                        endDate: formatDateInput(p.endDate),
                      })
                    }
                    className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    aria-label="Edit project"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleting(p)}
                    className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    aria-label="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Project Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Create New Project">
        <ProjectForm onSubmit={handleAdd} loading={formLoading} />
      </Modal>

      {/* Edit Project Modal */}
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Project">
        {editing && <ProjectForm defaultValues={editing} onSubmit={handleEdit} loading={formLoading} />}
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Project?"
        message={`Are you sure you want to delete "${deleting?.name}"? Any linked expenses will be preserved.`}
      />
    </div>
  );
}
