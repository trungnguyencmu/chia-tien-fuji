export interface Expense {
  id: string;
  tripId: string;
  payerUserId: string;
  payerName?: string;
  title: string;
  amount: number;
  date: string;
  createdAt: string;
  billImageUrl?: string;
}

export interface MemberBalance {
  member: string;
  userId?: string;
  totalPaid: number;
  share: number;
  balance: number;
  isSettled?: boolean;
}

export interface Transaction {
  from: string;
  to: string;
  fromUserId?: string;
  toUserId?: string;
  amount: number;
}

export interface BalanceMember {
  userId: string;
  displayName: string;
}

/**
 * Calculate settlement balances for all members, keyed by userId.
 * Expense.payerUserId is expected to contain the payer's userId.
 * If `members` is provided, splits equally among ALL listed members
 * (even those who haven't paid). Otherwise, only those who have paid are
 * included and their userId is used as the displayName fallback.
 */
export function calculateBalances(
  expenses: Expense[],
  members?: BalanceMember[],
): MemberBalance[] {
  if (expenses.length === 0 && (!members || members.length === 0)) return [];

  // Gather payment data keyed by userId.
  // Unattributable expenses (legacy data with no resolvable payer) are
  // excluded from both the per-member totals and the shared total so that
  // balances remain consistent (sum to ~0 across participants).
  const paymentsByUserId = new Map<string, number>();

  // Build resolution maps when members are known so legacy expenses
  // (missing payerUserId, or with payer storing displayName/userId) can
  // still be attributed to the correct participant.
  const userIdSet = new Set<string>(members?.map((m) => m.userId) ?? []);
  const userIdByName = new Map<string, string>();
  members?.forEach((m) => {
    if (m.displayName) userIdByName.set(m.displayName, m.userId);
  });

  const resolvePayerUserId = (expense: Expense): string | undefined => {
    const direct = expense.payerUserId;
    if (direct && (userIdSet.size === 0 || userIdSet.has(direct))) return direct;
    // payerName may hold either a userId (legacy) or a displayName
    if (expense.payerName) {
      if (userIdSet.has(expense.payerName)) return expense.payerName;
      if (userIdByName.has(expense.payerName)) return userIdByName.get(expense.payerName);
    }
    // Raw legacy `payer` field, in case it survived mapping
    const legacyPayer = (expense as Expense & { payer?: string }).payer;
    if (legacyPayer) {
      if (userIdSet.has(legacyPayer)) return legacyPayer;
      if (userIdByName.has(legacyPayer)) return userIdByName.get(legacyPayer);
    }
    return direct; // last resort: keep whatever we got (may be undefined)
  };

  let attributedTotal = 0;
  expenses.forEach((expense) => {
    const userId = resolvePayerUserId(expense);
    if (!userId) return;
    const current = paymentsByUserId.get(userId) || 0;
    paymentsByUserId.set(userId, current + expense.amount);
    attributedTotal += expense.amount;
  });

  // Determine which members to include in calculation
  let participants: BalanceMember[];
  if (members && members.length > 0) {
    participants = members;
  } else {
    // Fallback: only payers who appear in expenses
    participants = Array.from(paymentsByUserId.keys()).map((userId) => ({
      userId,
      displayName: userId,
    }));
  }

  if (participants.length === 0) return [];

  const sharePerPerson = attributedTotal / participants.length;

  return participants.map(({ userId, displayName }) => {
    const totalPaid = paymentsByUserId.get(userId) || 0;
    const balance = totalPaid - sharePerPerson;

    return {
      member: displayName,
      userId,
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

  // Separate debtors (negative balance) and creditors (positive balance).
  // Identity is keyed by userId when available; displayName is kept for display.
  const debtors = balances
    .filter((b) => b.balance < -0.01) // Small epsilon for float comparison
    .map((b) => ({ userId: b.userId, member: b.member, amount: -b.balance }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = balances
    .filter((b) => b.balance > 0.01)
    .map((b) => ({ userId: b.userId, member: b.member, amount: b.balance }))
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
      fromUserId: debtor.userId,
      toUserId: creditor.userId,
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
