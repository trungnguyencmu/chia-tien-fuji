import { Expense } from '../utils/calculation';

// Replace with your deployed Apps Script Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycbwwbJjyPVhfOwNgCZRpOlyt-BbtxQrc4-P81xSqqPZTbrXWHRS08n_917dz4wTVaFDi/exec';

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

/**
 * Fetch all trips
 */
export async function fetchTrips(): Promise<Trip[]> {
  try {
    const response = await fetch(`${API_URL}?action=getTrips`, {
      method: 'GET',
      redirect: 'follow',
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching trips:', error);
    throw error;
  }
}

/**
 * Create a new trip
 */
export async function createTrip(tripName: string): Promise<Trip> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      body: JSON.stringify({ action: 'createTrip', tripName }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error('Error creating trip:', error);
    throw error;
  }
}

/**
 * Delete a trip (soft delete)
 */
export async function deleteTrip(tripId: string): Promise<void> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      body: JSON.stringify({ action: 'deleteTrip', tripId }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
}

/**
 * Fetch all expenses for a specific trip
 */
export async function fetchExpenses(tripId: string): Promise<Expense[]> {
  try {
    const response = await fetch(`${API_URL}?action=getExpenses&tripId=${tripId}`, {
      method: 'GET',
      redirect: 'follow',
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
}

/**
 * Create a new expense in a specific trip
 */
export async function createExpense(tripId: string, expense: CreateExpenseRequest): Promise<Expense> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      body: JSON.stringify({ action: 'addExpense', tripId, ...expense }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
}

/**
 * Fetch all payer names for a specific trip
 */
export async function fetchPayerNames(tripId: string): Promise<string[]> {
  try {
    const response = await fetch(`${API_URL}?action=getPayerNames&tripId=${tripId}`, {
      method: 'GET',
      redirect: 'follow',
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching payer names:', error);
    throw error;
  }
}

/**
 * Add a new payer name to a specific trip
 */
export async function addPayerNameToBackend(tripId: string, name: string): Promise<string[]> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      body: JSON.stringify({ action: 'addPayerName', tripId, name }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data || [];
  } catch (error) {
    console.error('Error adding payer name:', error);
    throw error;
  }
}

/**
 * Delete a payer name from a specific trip
 */
export async function deletePayerNameFromBackend(tripId: string, name: string): Promise<string[]> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      body: JSON.stringify({ action: 'removePayerName', tripId, name }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data || [];
  } catch (error) {
    console.error('Error deleting payer name:', error);
    throw error;
  }
}

/**
 * Delete all expenses in a trip (requires password 'ok')
 */
export async function deleteAllExpenses(tripId: string, password: string): Promise<void> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      body: JSON.stringify({ action: 'deleteAllExpenses', tripId, password }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error deleting expenses:', error);
    throw error;
  }
}

/**
 * Delete a single expense (requires password 'ok')
 */
export async function deleteExpense(tripId: string, expenseId: string, password: string): Promise<void> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      body: JSON.stringify({ action: 'deleteExpense', tripId, expenseId, password }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
}
