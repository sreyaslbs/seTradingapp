import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useExpenses } from '../hooks/useExpenses';
import { useProjects } from '../hooks/useProjects';
import { todayInput } from '../utils/formatters';
import toast from 'react-hot-toast';
import { CheckCircle, ChevronDown } from 'lucide-react';

const EXPENSE_TYPES = [
  { value: 'project', label: 'Project Expense', icon: '🏗️', desc: 'Linked to a specific project', color: 'border-blue-500 bg-blue-50' },
  { value: 'operation', label: 'Operation Expense', icon: '⚡', desc: 'Day-to-day operational costs', color: 'border-amber-500 bg-amber-50' },
  { value: 'office', label: 'Office Expense', icon: '🏢', desc: 'Office / admin related', color: 'border-purple-500 bg-purple-50' },
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
    }
  });

  const selectedType = watch('type');
  const selectedProjectId = watch('projectId');

  // Auto-fill project name when projectId changes
  useEffect(() => {
    if (selectedProjectId) {
      const p = projects.find(pr => pr.id === selectedProjectId);
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
      const projectData = data.type === 'project'
        ? { projectId: data.projectId, projectName: data.projectName }
        : { projectId: null, projectName: null };

      await addExpense({ ...data, ...projectData });

      if (saveAndAdd) {
        toast.success('Expense saved! Add another.', { icon: '✅' });
        reset({ date: todayInput(), type: data.type, projectId: data.projectId || '', storeName: '', address: '', tin: '', amount: '', notes: '' });
        setSaveAndAdd(false);
      } else {
        toast.success('Expense saved!');
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

  const activeProjects = projects.filter(p => p.status === 'active');

  return (
    <div className="page-container animate-fade-in">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Expense Type - Big tap targets */}
        <div>
          <label className="section-title">Expense Type *</label>
          <div className="space-y-2">
            {EXPENSE_TYPES.map(({ value, label, icon, desc, color }) => {
              const isSelected = selectedType === value;
              return (
                <label
                  key={value}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected ? color : 'border-gray-200 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    value={value}
                    {...register('type', { required: 'Please select expense type' })}
                    className="sr-only"
                  />
                  <span className="text-xl">{icon}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  {isSelected && <CheckCircle className="w-5 h-5 text-brand-700 shrink-0" />}
                </label>
              );
            })}
          </div>
          {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
        </div>

        {/* Project selector (only when type = project) */}
        {selectedType === 'project' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Project *</label>
            <div className="relative">
              <select
                {...register('projectId', { required: selectedType === 'project' ? 'Select a project' : false })}
                className="input-field appearance-none pr-10"
              >
                <option value="">-- Select Project --</option>
                {activeProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.client})</option>
                ))}
                {projects.filter(p => p.status !== 'active').map(p => (
                  <option key={p.id} value={p.id}>{p.name} [{p.status}]</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.projectId && <p className="text-red-500 text-xs mt-1">{errors.projectId.message}</p>}
          </div>
        )}

        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Date *</label>
          <input
            type="date"
            {...register('date', { required: 'Date is required' })}
            className="input-field"
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
        </div>

        {/* Store Name */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Store Name *</label>
          <input
            {...register('storeName', { required: 'Store name is required' })}
            placeholder="e.g. Ace Hardware"
            className="input-field"
            autoComplete="organization"
          />
          {errors.storeName && <p className="text-red-500 text-xs mt-1">{errors.storeName.message}</p>}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Amount (₱) *</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₱</span>
            <input
              type="number"
              min="0"
              step="0.01"
              {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Amount must be greater than 0' } })}
              placeholder="0.00"
              className="input-field pl-8"
              inputMode="decimal"
            />
          </div>
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Address</label>
          <input
            {...register('address')}
            placeholder="Store address"
            className="input-field"
          />
        </div>

        {/* TIN */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">TIN #</label>
          <input
            {...register('tin')}
            placeholder="Tax Identification Number"
            className="input-field"
            inputMode="numeric"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Notes</label>
          <textarea
            {...register('notes')}
            placeholder="Optional notes…"
            rows={2}
            className="input-field resize-none"
          />
        </div>

        {/* Action buttons */}
        <div className="space-y-2 pt-2 pb-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
            onClick={() => setSaveAndAdd(false)}
          >
            {loading && !saveAndAdd ? 'Saving…' : '✓ Save Expense'}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-secondary w-full"
            onClick={() => setSaveAndAdd(true)}
          >
            {loading && saveAndAdd ? 'Saving…' : '+ Save & Add Another'}
          </button>
        </div>
      </form>
    </div>
  );
}
