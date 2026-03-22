import { Expense } from '../utils/calculation';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Trip {
  tripId: string;
  tripName: string;
  createdAt: string;
  isActive: boolean;
}

export interface CreateExpenseRequest {
  payer: string;
  title: string;
  amount: number;
  date: string;
}

function getAuthToken(): string | null {
  // Use idToken because Cognito access tokens lack the `aud` claim
  // that the backend JWT strategy validates
  return localStorage.getItem('auth_id_token');
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  // Handle empty responses (DELETE endpoints)
  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text);
}

// --- Trips ---

export async function fetchTrips(): Promise<Trip[]> {
  return apiFetch<Trip[]>('/trips');
}

export async function createTrip(tripName: string): Promise<Trip> {
  return apiFetch<Trip>('/trips', {
    method: 'POST',
    body: JSON.stringify({ tripName }),
  });
}

export async function deleteTrip(tripId: string): Promise<void> {
  return apiFetch<void>(`/trips/${tripId}`, { method: 'DELETE' });
}

// --- Expenses ---

interface ExpenseResponse {
  tripId: string;
  expenseId: string;
  payer: string;
  title: string;
  amount: number;
  date: string;
  createdAt: string;
}

function mapExpense(e: ExpenseResponse): Expense {
  return {
    id: e.expenseId,
    payer: e.payer,
    title: e.title,
    amount: e.amount,
    date: e.date,
    createdAt: e.createdAt,
  };
}

export async function fetchExpenses(tripId: string): Promise<Expense[]> {
  const data = await apiFetch<ExpenseResponse[]>(
    `/trips/${tripId}/expenses`,
  );
  return data.map(mapExpense);
}

export async function createExpense(
  tripId: string,
  expense: CreateExpenseRequest,
): Promise<Expense> {
  const data = await apiFetch<ExpenseResponse>(
    `/trips/${tripId}/expenses`,
    {
      method: 'POST',
      body: JSON.stringify(expense),
    },
  );
  return mapExpense(data);
}

export async function deleteExpense(
  tripId: string,
  expenseId: string,
  password: string,
): Promise<void> {
  return apiFetch<void>(`/trips/${tripId}/expenses/${expenseId}`, {
    method: 'DELETE',
    headers: { 'x-admin-password': password },
  });
}

export async function deleteAllExpenses(
  tripId: string,
  password: string,
): Promise<void> {
  return apiFetch<void>(`/trips/${tripId}/expenses`, {
    method: 'DELETE',
    headers: { 'x-admin-password': password },
  });
}

// --- Participants ---

export async function fetchPayerNames(tripId: string): Promise<string[]> {
  return apiFetch<string[]>(`/trips/${tripId}/participants/names`);
}

export async function addPayerNameToBackend(
  tripId: string,
  name: string,
): Promise<void> {
  return apiFetch<void>(`/trips/${tripId}/participants`, {
    method: 'POST',
    body: JSON.stringify({ participantName: name }),
  });
}

export async function deletePayerNameFromBackend(
  tripId: string,
  name: string,
): Promise<void> {
  return apiFetch<void>(
    `/trips/${tripId}/participants/${encodeURIComponent(name)}`,
    { method: 'DELETE' },
  );
}
