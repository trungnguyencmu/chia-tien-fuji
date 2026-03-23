import { Trip } from './api';
import { Expense, MemberBalance, Transaction } from '../utils/calculation';
import { getGuestToken, clearGuestToken } from '../utils/guest-storage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// --- Types ---

export interface GuestTokenResponse {
  token: string;
  tripId: string;
  userId: string;
  displayName: string;
  expiresIn: number;
}

export interface TripMember {
  tripId: string;
  userId: string;
  displayName: string;
  email: string;
  role: 'owner' | 'member' | 'guest';
  joinedAt: string;
}

export interface GuestSettlement {
  balances: MemberBalance[];
  transactions: Transaction[];
  totalExpenses: number;
  participantCount: number;
}

export interface CreateGuestExpenseRequest {
  payer: string;
  title: string;
  amount: number;
  date: string;
}

// --- Auth error for 401 handling ---

export class GuestAuthError extends Error {
  constructor() {
    super('Guest session expired');
    this.name = 'GuestAuthError';
  }
}

// --- Fetch wrapper ---

async function guestApiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getGuestToken();
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

  if (response.status === 401) {
    clearGuestToken();
    throw new GuestAuthError();
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text);
}

// --- Public endpoint (no auth) ---

export async function joinTrip(
  code: string,
  displayName: string,
): Promise<GuestTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/trips/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, displayName }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Invalid or expired invite code');
  }

  return response.json();
}

// --- Authenticated guest endpoints ---

export async function fetchGuestTrip(tripId: string): Promise<Trip> {
  return guestApiFetch<Trip>(`/trips/${tripId}`);
}

export async function fetchGuestMembers(tripId: string): Promise<TripMember[]> {
  return guestApiFetch<TripMember[]>(`/trips/${tripId}/members`);
}

interface GuestExpenseResponse {
  tripId: string;
  expenseId: string;
  payer: string;
  title: string;
  amount: number;
  date: string;
  createdAt: string;
}

function mapExpense(e: GuestExpenseResponse): Expense {
  return {
    id: e.expenseId,
    tripId: e.tripId,
    payer: e.payer,
    title: e.title,
    amount: e.amount,
    date: e.date,
    createdAt: e.createdAt,
  };
}

export async function fetchGuestExpenses(tripId: string): Promise<Expense[]> {
  const data = await guestApiFetch<GuestExpenseResponse[]>(
    `/trips/${tripId}/expenses`,
  );
  return data.map(mapExpense);
}

export async function createGuestExpense(
  tripId: string,
  expense: CreateGuestExpenseRequest,
): Promise<Expense> {
  const data = await guestApiFetch<GuestExpenseResponse>(
    `/trips/${tripId}/expenses`,
    {
      method: 'POST',
      body: JSON.stringify(expense),
    },
  );
  return mapExpense(data);
}

export async function updateGuestExpense(
  tripId: string,
  expenseId: string,
  expense: Partial<CreateGuestExpenseRequest>,
): Promise<Expense> {
  const data = await guestApiFetch<GuestExpenseResponse>(
    `/trips/${tripId}/expenses/${expenseId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(expense),
    },
  );
  return mapExpense(data);
}

export async function fetchGuestSettlement(
  tripId: string,
): Promise<GuestSettlement> {
  return guestApiFetch<GuestSettlement>(`/trips/${tripId}/settlement`);
}

// --- Images ---

export interface GuestTripImage {
  imageId: string;
  tripId: string;
  uploadedBy: string;
  uploaderDisplayName: string;
  fileName: string;
  contentType: string;
  size: number;
  url: string;
  caption?: string;
  createdAt: string;
}

interface GuestUploadUrlResponse {
  uploadUrl: string;
  imageId: string;
  s3Key: string;
}

export async function getGuestImageUploadUrl(
  tripId: string,
  fileName: string,
  contentType: string,
  size: number,
): Promise<GuestUploadUrlResponse> {
  return guestApiFetch<GuestUploadUrlResponse>(`/trips/${tripId}/images/upload-url`, {
    method: 'POST',
    body: JSON.stringify({ fileName, contentType, size }),
  });
}

export async function saveGuestImage(
  tripId: string,
  data: { imageId: string; fileName: string; size: number; contentType: string; caption?: string },
): Promise<GuestTripImage> {
  return guestApiFetch<GuestTripImage>(`/trips/${tripId}/images`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchGuestImages(tripId: string): Promise<GuestTripImage[]> {
  return guestApiFetch<GuestTripImage[]>(`/trips/${tripId}/images`);
}

export async function deleteGuestImage(tripId: string, imageId: string): Promise<void> {
  return guestApiFetch<void>(`/trips/${tripId}/images/${imageId}`, { method: 'DELETE' });
}
