// Utility functions for formatting values

/**
 * Format a number as Philippine Peso currency
 */
export const formatPeso = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₱0.00';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a number as compact peso (₱10K, ₱1.2M)
 */
export const formatPesoCompact = (amount) => {
  if (!amount) return '₱0';
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₱${(amount / 1_000).toFixed(1)}K`;
  return formatPeso(amount);
};

/**
 * Format a Firebase Timestamp or Date as a readable date string
 */
export const formatDate = (dateValue) => {
  if (!dateValue) return '—';
  let date;
  if (dateValue?.toDate) {
    date = dateValue.toDate();
  } else if (dateValue instanceof Date) {
    date = dateValue;
  } else {
    date = new Date(dateValue);
  }
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

/**
 * Format date as YYYY-MM-DD for input[type=date]
 */
export const formatDateInput = (dateValue) => {
  if (!dateValue) return '';
  let date;
  if (dateValue?.toDate) {
    date = dateValue.toDate();
  } else if (dateValue instanceof Date) {
    date = dateValue;
  } else {
    date = new Date(dateValue);
  }
  return date.toISOString().split('T')[0];
};

/**
 * Get today's date as YYYY-MM-DD
 */
export const todayInput = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Calculate percentage (safe)
 */
export const calcPercent = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
};

/**
 * Map expense type to display label
 */
export const expenseTypeLabel = (type) => {
  const map = {
    project: 'Project Expense',
    operation: 'Operation Expense',
    office: 'Office Expense',
  };
  return map[type] || type;
};

/**
 * Map expense type to color classes
 */
export const expenseTypeColor = (type) => {
  const map = {
    project: 'bg-blue-100 text-blue-800',
    operation: 'bg-amber-100 text-amber-800',
    office: 'bg-purple-100 text-purple-800',
  };
  return map[type] || 'bg-gray-100 text-gray-800';
};

/**
 * Map project status to color classes
 */
export const statusColor = (status) => {
  const map = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-700',
    'on-hold': 'bg-orange-100 text-orange-800',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
};

/**
 * Get date range for report periods
 */
export const getDateRange = (period) => {
  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  switch (period) {
    case 'this-month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start: startOfDay(start), end: endOfDay(end) };
    }
    case 'last-month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: startOfDay(start), end: endOfDay(end) };
    }
    case 'this-year': {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return { start: startOfDay(start), end: endOfDay(end) };
    }
    default:
      return null;
  }
};
