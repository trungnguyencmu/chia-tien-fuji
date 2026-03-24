# API & Data Model Research

## 1. Trip Interface Changes

**File:** `src/api/api.ts` (lines 5-14)

**Add to Trip interface:**
```typescript
status: 'active' | 'upcoming' | 'settled';
startDate?: string;  // ISO date "2025-03-15"
endDate?: string;    // ISO date "2025-03-22"
```

**Remove:** `isActive: boolean` (replaced by status)

## 2. TripMember Interface Changes

**File:** `src/api/api.ts` (lines 16-23)

**Add:**
```typescript
isSettled: boolean;
```

## 3. MemberBalance Interface Changes

**File:** `src/utils/calculation.ts` (lines 11-16)

**Add:**
```typescript
isSettled: boolean;
```

## 4. API Functions to Update

### createTrip (line 74)
Add `status`, `startDate`, `endDate` parameters

### updateTrip (line 83)
Extend data param to include `status`, `startDate`, `endDate`

### fetchCurrentTrip (line 94)
No changes needed once interface updated

## 5. New API Functions Needed

```typescript
// PATCH /trips/:tripId/members/:userId/settled
export async function updateMemberSettled(
  tripId: string,
  userId: string,
  isSettled: boolean
): Promise<TripMember>

// GET /trips/:tripId/settlement
export async function fetchSettlement(tripId: string): Promise<SettlementStatus[]>
```

## 6. Auth Context

- User identity via `userEmail` from localStorage
- JWT tokens: `auth_id_token`, `auth_access_token`, `auth_refresh_token`
- No changes needed to auth context
