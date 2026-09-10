import * as XLSX from 'xlsx';
import { formatDate, expenseTypeLabel } from './formatters';

/**
 * Export expenses to Excel with two sheets:
 * 1. Expense Log — all individual expenses
 * 2. Project Summary — per-project totals
 */
export const exportToExcel = (expenses, projects, dateLabel = '') => {
  const wb = XLSX.utils.book_new();

  // ─── Sheet 1: Expense Log ─────────────────────────────────────────────────
  const expenseHeaders = [
    'Date',
    'Store Name',
    'Address',
    'TIN #',
    'Amount (₱)',
    'Expense Type',
    'Project',
    'Notes',
  ];

  const expenseRows = expenses.map((e) => [
    formatDate(e.date),
    e.storeName || '',
    e.address || '',
    e.tin || '',
    Number(e.amount) || 0,
    expenseTypeLabel(e.type),
    e.projectName || '',
    e.notes || '',
  ]);

  const ws1Data = [expenseHeaders, ...expenseRows];
  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);

  // Column widths
  ws1['!cols'] = [
    { wch: 14 }, // Date
    { wch: 28 }, // Store Name
    { wch: 32 }, // Address
    { wch: 16 }, // TIN
    { wch: 14 }, // Amount
    { wch: 20 }, // Type
    { wch: 28 }, // Project
    { wch: 36 }, // Notes
  ];

  // Style header row (bold background)
  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '1E3A8A' } },
    alignment: { horizontal: 'center' },
  };

  expenseHeaders.forEach((_, idx) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: idx });
    if (ws1[cellRef]) {
      ws1[cellRef].s = headerStyle;
    }
  });

  XLSX.utils.book_append_sheet(wb, ws1, 'Expense Log');

  // ─── Sheet 2: Project Summary ─────────────────────────────────────────────
  const projectHeaders = [
    'Project Name',
    'Client',
    'Contract Amount (₱)',
    'Project Expenses (₱)',
    'Remaining (₱)',
    'Expense %',
    'Status',
  ];

  const projectMap = {};
  expenses.forEach((e) => {
    if (e.type === 'project' && e.projectId) {
      if (!projectMap[e.projectId]) {
        projectMap[e.projectId] = { name: e.projectName || 'Unknown', total: 0 };
      }
      projectMap[e.projectId].total += Number(e.amount) || 0;
    }
  });

  const projectRows = projects.map((p) => {
    const expenses = projectMap[p.id]?.total || 0;
    const remaining = (p.contractAmount || 0) - expenses;
    const pct = p.contractAmount ? ((expenses / p.contractAmount) * 100).toFixed(1) + '%' : '0%';
    return [
      p.name || '',
      p.client || '',
      Number(p.contractAmount) || 0,
      expenses,
      remaining,
      pct,
      p.status || '',
    ];
  });

  const ws2Data = [projectHeaders, ...projectRows];
  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);

  ws2['!cols'] = [
    { wch: 32 }, // Project
    { wch: 24 }, // Client
    { wch: 22 }, // Contract
    { wch: 22 }, // Expenses
    { wch: 20 }, // Remaining
    { wch: 12 }, // %
    { wch: 14 }, // Status
  ];

  projectHeaders.forEach((_, idx) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: idx });
    if (ws2[cellRef]) {
      ws2[cellRef].s = headerStyle;
    }
  });

  XLSX.utils.book_append_sheet(wb, ws2, 'Project Summary');

  // ─── Download ─────────────────────────────────────────────────────────────
  const filename = `SE_Trading_Expenses${dateLabel ? '_' + dateLabel : ''}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
};
