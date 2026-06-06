import * as XLSX from 'xlsx';
import { Expense, calculateBalances, calculateTransactions, BalanceMember } from './calculation';

interface ExportOptions {
  tripName: string;
  expenses: Expense[];
  members: BalanceMember[];
  currency?: string;
  /** Optional map of userId -> settled status to surface in the Balances sheet. */
  memberSettledStatus?: Map<string, boolean>;
}

function resolvePayerName(
  expense: Expense,
  nameById: Map<string, string>,
): string {
  return (
    expense.payerName
    ?? nameById.get(expense.payerUserId)
    ?? expense.payerUserId
    ?? ''
  );
}

function sanitizeSheetName(name: string): string {
  // Excel sheet name: max 31 chars, none of: \ / ? * [ ]
  return name.replace(/[\\/?*[\]]/g, '').slice(0, 31) || 'Sheet';
}

function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim() || 'expenses';
}

export function exportExpensesToExcel({
  tripName,
  expenses,
  members,
  currency = 'VND',
  memberSettledStatus,
}: ExportOptions): void {
  const nameById = new Map<string, string>();
  members.forEach((m) => nameById.set(m.userId, m.displayName));

  // --- Sheet 1: Expenses ---
  const sortedExpenses = [...expenses].sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    if (da !== db) return da - db;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const expenseRows = sortedExpenses.map((e) => ({
    Date: e.date,
    Title: e.title,
    Payer: resolvePayerName(e, nameById),
    [`Amount (${currency})`]: e.amount,
    Receipt: e.billImageUrl ? 'Yes' : '',
    'Created At': e.createdAt,
  }));

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalsRow = {
    Date: '',
    Title: 'TOTAL',
    Payer: '',
    [`Amount (${currency})`]: totalAmount,
    Receipt: '',
    'Created At': '',
  };

  const expensesSheet = XLSX.utils.json_to_sheet(
    expenseRows.length > 0 ? [...expenseRows, totalsRow] : [totalsRow],
  );

  expensesSheet['!cols'] = [
    { wch: 12 }, // Date
    { wch: 40 }, // Title
    { wch: 18 }, // Payer
    { wch: 18 }, // Amount
    { wch: 10 }, // Receipt
    { wch: 22 }, // Created At
  ];

  // --- Sheet 2: Balances (summary + per-member table) ---
  const balances = calculateBalances(expenses, members);
  const transactions = calculateTransactions(balances);
  const hasSettledInfo = !!memberSettledStatus && memberSettledStatus.size > 0;
  const sharePerPerson = balances.length > 0
    ? Math.round(balances.reduce((s, b) => s + b.share, 0) / balances.length)
    : 0;

  type BalanceRow = Record<string, string | number>;
  const balanceRows: BalanceRow[] = balances.map((b) => {
    const row: BalanceRow = {
      Member: b.member,
      [`Paid (${currency})`]: Math.round(b.totalPaid),
      [`Share (${currency})`]: Math.round(b.share),
      [`Balance (${currency})`]: Math.round(b.balance),
    };
    if (hasSettledInfo) {
      const settled = (b.userId && memberSettledStatus!.get(b.userId))
        ?? (!(b.balance > 0.01) && !(b.balance < -0.01));
      row.Status = settled ? 'Settled' : 'Unsettled';
    }
    return row;
  });

  // Top section: summary stats
  const summaryAoa: (string | number)[][] = [
    ['Summary'],
    ['Trip', tripName],
    ['Total Expenses', totalAmount],
    ['Members', members.length],
    ['Share per Person', sharePerPerson],
    ['Currency', currency],
    [],
    ['Member Balances'],
  ];
  const balancesSheet = XLSX.utils.aoa_to_sheet(summaryAoa);

  // Per-member table below the summary
  const balancesTableOrigin = `A${summaryAoa.length + 1}`;
  XLSX.utils.sheet_add_json(
    balancesSheet,
    balanceRows.length > 0
      ? balanceRows
      : [{ Member: '(no members)', [`Paid (${currency})`]: 0, [`Share (${currency})`]: 0, [`Balance (${currency})`]: 0 }],
    { origin: balancesTableOrigin },
  );

  balancesSheet['!cols'] = hasSettledInfo
    ? [{ wch: 22 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 12 }]
    : [{ wch: 22 }, { wch: 16 }, { wch: 16 }, { wch: 16 }];

  // --- Sheet 3: Settlement (Who Owes Who) ---
  const settlementSheet = XLSX.utils.aoa_to_sheet([
    ['Settlement'],
    ['Trip', tripName],
    [],
    ['Who Owes Who'],
  ]);

  if (transactions.length === 0) {
    XLSX.utils.sheet_add_aoa(
      settlementSheet,
      [['All settled up — no transfers needed.']],
      { origin: 'A5' },
    );
  } else {
    XLSX.utils.sheet_add_json(
      settlementSheet,
      transactions.map((tx) => ({
        From: (tx.fromUserId && nameById.get(tx.fromUserId)) || tx.from,
        To: (tx.toUserId && nameById.get(tx.toUserId)) || tx.to,
        [`Amount (${currency})`]: tx.amount,
      })),
      { origin: 'A5' },
    );
  }
  settlementSheet['!cols'] = [{ wch: 22 }, { wch: 22 }, { wch: 18 }];

  // --- Workbook ---
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, expensesSheet, sanitizeSheetName('Expenses'));
  XLSX.utils.book_append_sheet(workbook, balancesSheet, sanitizeSheetName('Balances'));
  XLSX.utils.book_append_sheet(workbook, settlementSheet, sanitizeSheetName('Settlement'));

  const dateStamp = new Date().toISOString().slice(0, 10);
  const fileName = `${sanitizeFileName(tripName)}-${dateStamp}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
