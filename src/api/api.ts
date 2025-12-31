import { Expense } from '../utils/calculation';

// Replace with your deployed Apps Script Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycbyWuXCfJrHyKkK2Eb44m3D-gz-VLsQcXwoezyiApigGCokIHs9wYFWMZaDYFB9XqQ4/exec';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateExpenseRequest {
  payer: string;
  title: string;
  amount: number;
  date: string;
}

/**
 * Fetch all expenses from the backend
 */
export async function fetchExpenses(): Promise<Expense[]> {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      redirect: 'follow',
    });

    const result: ApiResponse<Expense[]> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch expenses');
    }

    return result.data || [];
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
}

/**
 * Create a new expense
 */
export async function createExpense(expense: CreateExpenseRequest): Promise<Expense> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      body: JSON.stringify({ action: 'addExpense', ...expense }),
    });

    const result: ApiResponse<Expense> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to create expense');
    }

    if (!result.data) {
      throw new Error('No data returned from server');
    }

    return result.data;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
}

/**
 * Fetch all payer names from the backend
 */
export async function fetchPayerNames(): Promise<string[]> {
  try {
    const response = await fetch(`${API_URL}?action=payers`, {
      method: 'GET',
      redirect: 'follow',
    });

    const result: ApiResponse<string[]> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch payer names');
    }

    return result.data || [];
  } catch (error) {
    console.error('Error fetching payer names:', error);
    throw error;
  }
}

/**
 * Add a new payer name
 */
export async function addPayerNameToBackend(name: string): Promise<string[]> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      body: JSON.stringify({ action: 'addPayer', name }),
    });

    const result: ApiResponse<string[]> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to add payer name');
    }

    return result.data || [];
  } catch (error) {
    console.error('Error adding payer name:', error);
    throw error;
  }
}

/**
 * Delete a payer name
 */
export async function deletePayerNameFromBackend(name: string): Promise<string[]> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      body: JSON.stringify({ action: 'deletePayer', name }),
    });

    const result: ApiResponse<string[]> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete payer name');
    }

    return result.data || [];
  } catch (error) {
    console.error('Error deleting payer name:', error);
    throw error;
  }
}

/**
 * Delete all expenses (requires password 'ok')
 */
export async function deleteAllExpenses(password: string): Promise<void> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      body: JSON.stringify({ action: 'deleteAllExpenses', password }),
    });

    const result: ApiResponse<void> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete expenses');
    }
  } catch (error) {
    console.error('Error deleting expenses:', error);
    throw error;
  }
}
