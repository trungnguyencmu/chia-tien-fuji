# Phase 1: API & Data Model

## Context
- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** None
- **Parallel Group:** A (can run with Phase 2)

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-03-23 |
| Description | Update Trip/TripMember/MemberBalance interfaces, API functions, and i18n keys |
| Priority | P2 |
| Status | pending |
| Review | not reviewed |

## Key Insights
- `isActive` boolean should be replaced with `status: 'active' | 'upcoming' | 'settled'`
- `startDate` and `endDate` are optional ISO date strings
- `MemberBalance.isSettled` comes from member's manual settlement flag, not balance calculation
- New API endpoints needed: `PATCH /trips/:tripId/members/:userId/settled` and `GET /trips/:tripId/settlement`

## Requirements

### Data Model Changes

**Trip interface (src/api/api.ts):**
```typescript
export interface Trip {
  tripId: string;
  userId: string;
  tripName: string;
  createdAt: string;
  status: 'active' | 'upcoming' | 'settled';  // NEW
  startDate?: string;  // NEW - ISO date "2025-03-15"
  endDate?: string;    // NEW - ISO date "2025-03-22"
  inviteCode?: string;
  imageS3Key?: string;
  imageUrl?: string;
}
```

**TripMember interface (src/api/api.ts):**
```typescript
export interface TripMember {
  tripId: string;
  userId: string;
  displayName: string;
  email: string;
  role: 'owner' | 'member';
  joinedAt: string;
  isSettled: boolean;  // NEW
}
```

**MemberBalance interface (src/utils/calculation.ts):**
```typescript
export interface MemberBalance {
  member: string;
  totalPaid: number;
  share: number;
  balance: number;
  isSettled: boolean;  // NEW - from member's manual settlement flag
}
```

### API Functions

**createTrip (src/api/api.ts):**
```typescript
export async function createTrip(
  tripName: string,
  imageS3Key?: string,
  status?: 'active' | 'upcoming' | 'settled',
  startDate?: string,
  endDate?: string
): Promise<Trip>
```

**updateTrip (src/api/api.ts):**
```typescript
export async function updateTrip(
  tripId: string,
  data: {
    tripName?: string;
    imageS3Key?: string;
    status?: 'active' | 'upcoming' | 'settled';
    startDate?: string;
    endDate?: string;
  }
): Promise<Trip>
```

**New: updateMemberSettled:**
```typescript
export async function updateMemberSettled(
  tripId: string,
  userId: string,
  isSettled: boolean
): Promise<TripMember>
```

**New: fetchSettlement:**
```typescript
export interface SettlementStatus {
  userId: string;
  displayName: string;
  isSettled: boolean;
  balance: number;
}

export async function fetchSettlement(tripId: string): Promise<SettlementStatus[]>
```

### i18n Keys

**en.ts & vi.ts - Add ~10 new keys:**
```typescript
// Trip status
statusUpcoming: 'Upcoming' | 'Sắp tới'
statusInProgress: 'In Progress' | 'Đang diễn ra'
statusSettled: 'Settled' | 'Đã thanh toán'
startsInDays: 'Starts in {days} days' | 'Bắt đầu sau {days} ngày'
tripDates: '{startDate} - {endDate}'
tripInProgress: 'In progress'
tripSettled: 'Settled'

// Member settlement
settled: 'Settled'
unsettled: 'Unsettled'
markSettled: 'Mark Settled'
markUnsettled: 'Mark Unsettled'
```

## Related Code Files

**Exclusive ownership (no overlap with Phase 2):**
- src/api/api.ts
- src/utils/calculation.ts
- src/i18n/translations/en.ts
- src/i18n/translations/vi.ts

## Implementation Steps

1. **Update Trip interface in api.ts**
   - Replace `isActive: boolean` with `status: 'active' | 'upcoming' | 'settled'`
   - Add `startDate?: string` and `endDate?: string`

2. **Update TripMember interface in api.ts**
   - Add `isSettled: boolean`

3. **Update createTrip function**
   - Accept status, startDate, endDate parameters
   - Pass them in request body

4. **Update updateTrip function**
   - Accept status, startDate, endDate in data param
   - Pass them in PATCH request body

5. **Add updateMemberSettled function**
   - PATCH /trips/:tripId/members/:userId/settled

6. **Add SettlementStatus interface and fetchSettlement function**
   - GET /trips/:tripId/settlement

7. **Update MemberBalance interface in calculation.ts**
   - Add `isSettled: boolean`

8. **Add new i18n keys to en.ts and vi.ts**

## Todo List

- [ ] Update Trip interface
- [ ] Update TripMember interface
- [ ] Update createTrip function
- [ ] Update updateTrip function
- [ ] Add updateMemberSettled function
- [ ] Add SettlementStatus interface and fetchSettlement
- [ ] Update MemberBalance interface
- [ ] Add i18n keys (en + vi)

## Success Criteria

- Trip interface includes status, startDate, endDate
- TripMember interface includes isSettled
- MemberBalance interface includes isSettled
- New API functions exist: updateMemberSettled, fetchSettlement
- All i18n keys added for status and settlement UI

## Conflict Prevention

Phase 1 exclusively owns:
- src/api/api.ts (data model + API functions)
- src/utils/calculation.ts (MemberBalance)
- src/i18n/translations/*.ts (i18n keys)

Phase 2 owns UI components. No file overlap.

## Risk Assessment

- **Low Risk**: Additive changes only, no breaking changes to existing API contracts
- **Backend dependency**: Frontend changes assume backend supports new fields

## Security Considerations

- updateMemberSettled should only be callable by trip owner
- Input validation needed for date format (ISO 8601)
