import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useExpenses } from '../hooks/useExpenses';
import { useProjects } from '../hooks/useProjects';
import { todayInput } from '../utils/formatters';
import toast from 'react-hot-toast';
import { CheckCircle2, ChevronDown, Receipt, Plus } from 'lucide-react';

const EXPENSE_TYPES = [
  {
    value: 'project',
    label: 'Project Expense',
    desc: 'Mandatory link to a customer project',
    badge: 'Job Site',
    color: 'border-sapphire-900 bg-sapphire-950 text-white',
    unselectedColor: 'border-slate-200 bg-white text-slate-800 hover:border-slate-300',
  },
  {
    value: 'operation',
    label: 'Operation Expense',
    desc: 'Tools, vehicles, fuel & day-to-day logistics',
    badge: 'Operations',
    color: 'border-amber-500 bg-amber-500/15 text-slate-900',
    unselectedColor: 'border-slate-200 bg-white text-slate-800 hover:border-slate-300',
  },
  {
    value: 'office',
    label: 'Office Expense',
    desc: 'Utilities, stationery & administrative expenses',
    badge: 'Admin',
    color: 'border-indigo-600 bg-indigo-500/15 text-slate-900',
    unselectedColor: 'border-slate-200 bg-white text-slate-800 hover:border-slate-300',
  },
];

export default function AddExpense() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addExpense } = useExpenses();
  const { projects } = useProjects();
  const [loading, setLoading] = useState(false);
  const [saveAndAdd, setSaveAndAdd] = useState(false);

  // Pre-fill from navigation state (e.g. from ProjectDetail)
  const prefilledState = location.state || {};

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      date: todayInput(),
      type: prefilledState.projectId ? 'project' : '',
      projectId: prefilledState.projectId || '',
      storeName: '',
      address: '',
      tin: '',
      amount: '',
      notes: '',
    },
  });

  const selectedType = watch('type');
  const selectedProjectId = watch('projectId');

  // Auto-fill project name when projectId changes
  useEffect(() => {
    if (selectedProjectId) {
      const p = projects.find((pr) => pr.id === selectedProjectId);
      if (p) setValue('projectName', p.name);
    } else {
      setValue('projectName', '');
    }
  }, [selectedProjectId, projects, setValue]);

  // Clear project when type changes away from project
  useEffect(() => {
    if (selectedType !== 'project') {
      setValue('projectId', '');
      setValue('projectName', '');
    }
  }, [selectedType, setValue]);

  const onSubmit = async (data) => {
    if (data.type === 'project' && !data.projectId) {
      toast.error('Please select a project');
      return;
    }
    try {
      setLoading(true);
      const projectData =
        data.type === 'project'
          ? { projectId: data.projectId, projectName: data.projectName }
          : { projectId: null, projectName: null };

      await addExpense({ ...data, ...projectData });

      if (saveAndAdd) {
        toast.success('Receipt saved! Ready for next receipt.', { icon: '✨' });
        reset({
          date: todayInput(),
          type: data.type,
          projectId: data.projectId || '',
          storeName: '',
          address: '',
          tin: '',
          amount: '',
          notes: '',
        });
        setSaveAndAdd(false);
      } else {
        toast.success('Receipt saved successfully!');
        navigate(-1);
      }
    } catch (err) {
      console.error('Error saving expense:', err);
      if (err.code === 'permission-denied') {
        toast.error('Permission denied: Please update Firestore Rules in Firebase Console.', { duration: 6000 });
      } else {
        toast.error(err.message || 'Failed to save expense');
      }
    } finally {
      setLoading(false);
    }
  };

  const activeProjects = projects.filter((p) => p.status === 'active');

  return (
    <div className="page-container animate-fade-in space-y-5">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sapphire-950 to-sapphire-900 text-white p-4 rounded-2xl border border-sapphire-700/40 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold tracking-tight">Quick Receipt Entry</h2>
          <p className="text-xs text-sapphire-200">Record purchases &amp; job-site expenses</p>
        </div>
        <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold shadow-md">
          <Receipt className="w-5 h-5" />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Expense Type - Tactile Sapphire & Amber Selector */}
        <div>
          <label className="section-title">
            <span>Expense Category *</span>
          </label>
          <div className="space-y-2">
            {EXPENSE_TYPES.map(({ value, label, desc, badge, color, unselectedColor }) => {
              const isSelected = selectedType === value;
              return (
                <label
                  key={value}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                    isSelected ? color + ' shadow-md scale-[1.01]' : unselectedColor
                  }`}
                >
                  <input
                    type="radio"
                    value={value}
                    {...register('type', { required: 'Please select an expense category' })}
                    className="sr-only"
                  />
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold ${isSelected && value === 'project' ? 'text-amber-400' : ''}`}>
                        {label}
                      </p>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isSelected && value === 'project'
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {badge}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 truncate ${isSelected && value === 'project' ? 'text-sapphire-200' : 'text-slate-500'}`}>
                      {desc}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {isSelected ? (
                      <CheckCircle2 className={`w-5 h-5 ${value === 'project' ? 'text-amber-400' : 'text-slate-900'}`} />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                </label>
              );
            })}
          </div>
          {errors.type && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.type.message}</p>}
        </div>

        {/* Project Selector (Mandatory for Project Expense) */}
        {selectedType === 'project' && (
          <div className="animate-slide-up p-4 rounded-2xl bg-sapphire-50 border-2 border-sapphire-300">
            <label className="block text-xs font-bold text-sapphire-950 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Select Project *</span>
              <span className="text-[10px] text-sapphire-700 font-semibold lowercase">(mandatory for project costs)</span>
            </label>
            <div className="relative">
              <select
                {...register('projectId', { required: selectedType === 'project' ? 'Please select a project' : false })}
                className="input-field appearance-none pr-10 font-bold bg-white text-sapphire-950"
              >
                <option value="">-- Choose Project --</option>
                {activeProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.client})
                  </option>
                ))}
                {projects.filter((p) => p.status !== 'active').map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} [{p.status}]
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {errors.projectId && <p className="text-rose-600 text-xs mt-1.5 font-medium">{errors.projectId.message}</p>}
          </div>
        )}

        {/* Amount & Date in 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Amount (₱) *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₱</span>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be > 0' },
                })}
                placeholder="0.00"
                className="input-field pl-8 font-extrabold text-base text-slate-900"
                inputMode="decimal"
              />
            </div>
            {errors.amount && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Date *</label>
            <div className="relative">
              <input
                type="date"
                {...register('date', { required: 'Date is required' })}
                className="input-field text-xs font-medium"
              />
            </div>
            {errors.date && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.date.message}</p>}
          </div>
        </div>

        {/* Store Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Store / Supplier Name *</label>
          <div className="relative">
            <input
              {...register('storeName', { required: 'Store name is required' })}
              placeholder="e.g. Ace Hardware / Wilcon"
              className="input-field font-medium"
              autoComplete="organization"
            />
          </div>
          {errors.storeName && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.storeName.message}</p>}
        </div>

        {/* Store Address & TIN */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Address</label>
            <input
              {...register('address')}
              placeholder="Branch or address"
              className="input-field text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">TIN #</label>
            <input
              {...register('tin')}
              placeholder="Tax ID number"
              className="input-field text-xs"
              inputMode="numeric"
            />
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Notes / Particulars</label>
          <textarea
            {...register('notes')}
            placeholder="e.g. 50m copper wire, 2 breaker boxes…"
            rows={2}
            className="input-field resize-none text-xs"
          />
        </div>

        {/* Submit Action Buttons */}
        <div className="space-y-2.5 pt-3 pb-6">
          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full flex items-center justify-center gap-2"
            onClick={() => setSaveAndAdd(false)}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading && !saveAndAdd ? 'Saving Receipt…' : 'Save Receipt'}</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="btn-secondary w-full flex items-center justify-center gap-2"
            onClick={() => setSaveAndAdd(true)}
          >
            <Plus className="w-4 h-4 text-sapphire-700" />
            <span>{loading && saveAndAdd ? 'Saving…' : 'Save & Add Another Receipt'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
