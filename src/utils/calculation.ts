export interface Expense {
  id: string;
  payer: string;
  title: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface MemberBalance {
  member: string;
  totalPaid: number;
  share: number;
  balance: number;
}

export interface Transaction {
  from: string;
  to: string;
  amount: number;
}

/**
 * Calculate settlement balances for all members
 * If payerNames is provided, split equally among ALL payer names (not just those who paid)
 * Otherwise, split only among members who have paid
 */
export function calculateBalances(expenses: Expense[], payerNames?: string[]): MemberBalance[] {
  if (expenses.length === 0 && (!payerNames || payerNames.length === 0)) return [];

  // Calculate total and gather payment data
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const memberPayments = new Map<string, number>();

  expenses.forEach((expense) => {
    const current = memberPayments.get(expense.payer) || 0;
    memberPayments.set(expense.payer, current + expense.amount);
  });

  // Determine which members to include in calculation
  let members: string[];
  if (payerNames && payerNames.length > 0) {
    // Use all payer names from admin, even if they haven't paid yet
    members = payerNames;
  } else {
    // Fallback to only those who have paid
    members = Array.from(memberPayments.keys());
  }

  if (members.length === 0) return [];

  const sharePerPerson = total / members.length;

  // Calculate balances for each member
  return members.map((member) => {
    const totalPaid = memberPayments.get(member) || 0;
    const balance = totalPaid - sharePerPerson;

    return {
      member,
      totalPaid,
      share: sharePerPerson,
      balance,
    };
  });
}

/**
 * Calculate optimal transactions to settle debts
 * Uses greedy algorithm: match largest debtor with largest creditor
 */
export function calculateTransactions(balances: MemberBalance[]): Transaction[] {
  const transactions: Transaction[] = [];

  // Separate debtors (negative balance) and creditors (positive balance)
  const debtors = balances
    .filter((b) => b.balance < -0.01) // Small epsilon for float comparison
    .map((b) => ({ member: b.member, amount: -b.balance }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = balances
    .filter((b) => b.balance > 0.01)
    .map((b) => ({ member: b.member, amount: b.balance }))
    .sort((a, b) => b.amount - a.amount);

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);

    transactions.push({
      from: debtor.member,
      to: creditor.member,
      amount: Math.round(amount), // Round to avoid floating point issues
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return transactions;
}

/**
 * Format transaction as human-readable string
 */
export function formatTransaction(transaction: Transaction): string {
  return `${transaction.from} owes ${transaction.to} ${transaction.amount.toLocaleString()} VND`;
}

/**
 * Format member balance as human-readable string
 */
export function formatBalance(balance: MemberBalance): string {
  if (Math.abs(balance.balance) < 0.01) {
    return `${balance.member} is settled`;
  } else if (balance.balance > 0) {
    return `${balance.member} should receive ${Math.round(balance.balance).toLocaleString()} VND`;
  } else {
    return `${balance.member} owes ${Math.round(-balance.balance).toLocaleString()} VND`;
  }
}
