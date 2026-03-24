import { Expense } from '../utils/calculation';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Trip {
  tripId: string;
  userId: string;
  tripName: string;
  createdAt: string;
  status: 'active' | 'upcoming' | 'settled';
  startDate?: string;
  endDate?: string;
  inviteCode?: string;
  imageS3Key?: string;
  imageUrl?: string;
  memberCount?: number;
}

export interface TripMember {
  tripId: string;
  userId: string;
  displayName: string;
  email: string;
  role: 'owner' | 'member';
  joinedAt: string;
  isSettled: boolean;
}

export interface CreateExpenseRequest {
  payer: string;
  title: string;
  amount: number;
  date: string;
  billId?: string;
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

export async function createTrip(
  tripName: string,
  imageS3Key?: string,
  status?: 'active' | 'upcoming' | 'settled',
  startDate?: string,
  endDate?: string
): Promise<Trip> {
  const body: Record<string, string> = { tripName };
  if (imageS3Key) body.imageS3Key = imageS3Key;
  if (status) body.status = status;
  if (startDate) body.startDate = startDate;
  if (endDate) body.endDate = endDate;
  return apiFetch<Trip>('/trips', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateTrip(tripId: string, data: {
  tripName?: string;
  imageS3Key?: string;
  status?: 'active' | 'upcoming' | 'settled';
  startDate?: string;
  endDate?: string;
}): Promise<Trip> {
  return apiFetch<Trip>(`/trips/${tripId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteTrip(tripId: string): Promise<void> {
  return apiFetch<void>(`/trips/${tripId}`, { method: 'DELETE' });
}

export async function fetchCurrentTrip(tripId: string): Promise<Trip> {
  return apiFetch<Trip>(`/trips/${tripId}`);
}

export async function regenerateInviteCode(tripId: string): Promise<Trip> {
  return apiFetch<Trip>(`/trips/${tripId}/regenerate-invite-code`, { method: 'POST' });
}

// --- Members ---

export async function fetchTripMembers(tripId: string): Promise<TripMember[]> {
  return apiFetch<TripMember[]>(`/trips/${tripId}/members`);
}

export async function addTripMember(tripId: string, email: string): Promise<TripMember> {
  return apiFetch<TripMember>(`/trips/${tripId}/members`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function removeTripMember(tripId: string, userId: string): Promise<void> {
  return apiFetch<void>(`/trips/${tripId}/members/${userId}`, { method: 'DELETE' });
}

export async function updateMyDisplayName(displayName: string): Promise<void> {
  return apiFetch<void>('/members/me', {
    method: 'PATCH',
    body: JSON.stringify({ displayName }),
  });
}

export async function updateMemberSettled(
  tripId: string,
  userId: string,
  isSettled: boolean
): Promise<TripMember> {
  return apiFetch<TripMember>(`/trips/${tripId}/members/${userId}/settled`, {
    method: 'PATCH',
    body: JSON.stringify({ isSettled }),
  });
}

export interface SettlementStatus {
  userId: string;
  displayName: string;
  isSettled: boolean;
  balance: number;
}

export async function fetchSettlement(tripId: string): Promise<SettlementStatus[]> {
  return apiFetch<SettlementStatus[]>(`/trips/${tripId}/settlement`);
}

// --- User Search ---

export interface UserSearchResult {
  userId: string;
  email: string;
  displayName: string;
}

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  return apiFetch<UserSearchResult[]>(`/users/search?query=${encodeURIComponent(query)}`);
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
  billImageUrl?: string;
}

function mapExpense(e: ExpenseResponse): Expense {
  return {
    id: e.expenseId,
    tripId: e.tripId,
    payer: e.payer,
    title: e.title,
    amount: e.amount,
    date: e.date,
    createdAt: e.createdAt,
    billImageUrl: e.billImageUrl,
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
): Promise<void> {
  return apiFetch<void>(`/trips/${tripId}/expenses/${expenseId}`, {
    method: 'DELETE',
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

// --- Images ---

export interface TripImage {
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

interface UploadUrlResponse {
  uploadUrl: string;
  imageId: string;
  s3Key: string;
}

export async function getImageUploadUrl(
  tripId: string,
  fileName: string,
  contentType: string,
  size: number,
): Promise<UploadUrlResponse> {
  return apiFetch<UploadUrlResponse>(`/trips/${tripId}/images/upload-url`, {
    method: 'POST',
    body: JSON.stringify({ fileName, contentType, size }),
  });
}

export async function saveImage(
  tripId: string,
  data: { imageId: string; fileName: string; size: number; contentType: string; caption?: string },
): Promise<TripImage> {
  return apiFetch<TripImage>(`/trips/${tripId}/images`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchImages(tripId: string): Promise<TripImage[]> {
  return apiFetch<TripImage[]>(`/trips/${tripId}/images`);
}

export async function deleteImage(tripId: string, imageId: string): Promise<void> {
  return apiFetch<void>(`/trips/${tripId}/images/${imageId}`, { method: 'DELETE' });
}

// --- Bill Scanning ---

interface BillUploadUrlResponse {
  uploadUrl: string;
  s3Key: string;
  billId: string;
}

export async function getBillUploadUrl(
  tripId: string,
  fileName: string,
  contentType: string,
): Promise<BillUploadUrlResponse> {
  return apiFetch<BillUploadUrlResponse>(`/trips/${tripId}/scan-bill/upload-url`, {
    method: 'POST',
    body: JSON.stringify({ fileName, contentType }),
  });
}

export interface ScannedBill {
  billId: string;
  totalAmount: number;
  currency: string;
  billDate: string;
  s3Key: string;
}

export async function scanBill(tripId: string, s3Key: string): Promise<ScannedBill> {
  return apiFetch<ScannedBill>(`/trips/${tripId}/scan-bill`, {
    method: 'POST',
    body: JSON.stringify({ s3Key }),
  });
}

