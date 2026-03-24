# Phase 2: UI Components

## Context
- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** Phase 1 (API types and i18n keys must exist first)
- **Parallel Group:** A (can run with Phase 1)

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-03-23 |
| Description | Update TripsPage, TripDetailPage, TripMembers, and Settlement components |
| Priority | P2 |
| Status | pending |
| Review | not reviewed |

## Key Insights
- Trip cards need status badge and date range display
- TripDetailPage needs edit controls for status and dates (owner only)
- TripMembers table needs isSettled column with owner toggle
- Settlement component should accept memberSettledStatus prop
- **Status filter dropdown** added to TripsPage (user can filter by active/upcoming/settled)
- **Member.isSettled overrides** calculated balance for settlement display
- **Status colors**: upcoming=blue, active=green, settled=gray

## Requirements

### TripsPage.tsx

**Status filter dropdown (add above trip cards):**
```tsx
<div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
  <button
    className={filter === 'all' ? 'btn btn-primary' : 'btn btn-secondary'}
    onClick={() => setFilter('all')}
  >
    {t('allTrips')}
  </button>
  <button
    className={filter === 'active' ? 'btn btn-primary' : 'btn btn-secondary'}
    onClick={() => setFilter('active')}
  >
    {t('statusInProgress')}
  </button>
  <button
    className={filter === 'upcoming' ? 'btn btn-primary' : 'btn btn-secondary'}
    onClick={() => setFilter('upcoming')}
  >
    {t('statusUpcoming')}
  </button>
  <button
    className={filter === 'settled' ? 'btn btn-primary' : 'btn btn-secondary'}
    onClick={() => setFilter('settled')}
  >
    {t('statusSettled')}
  </button>
</div>
```

**Trip Card Display (lines ~355-379):**
```tsx
// Status badge after trip name (colors: upcoming=blue, active=green, settled=gray)
<span className={`badge badge-${trip.status === 'upcoming' ? 'info' : trip.status === 'active' ? 'success' : 'neutral'}`}>
  {t(`status${trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}`)}
</span>

// Date range (if startDate && endDate)
{trip.startDate && trip.endDate && (
  <span>📅 {formatDateRange(trip.startDate, trip.endDate)}</span>
)}

// Status-specific content:
// - upcoming: "Starts in X days" (from today to startDate)
// - active: "In progress" (today between startDate and endDate)
// - settled: "Settled"
```

### TripDetailPage.tsx

**Add after trip header (around line 271):**
```tsx
{/* Status and dates section - owner only */}
{isOwner && (
  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
    <select
      value={trip.status}
      onChange={(e) => updateTrip(tripId, { status: e.target.value })}
      className="form-input"
    >
      <option value="upcoming">{t('statusUpcoming')}</option>
      <option value="active">{t('statusInProgress')}</option>
      <option value="settled">{t('statusSettled')}</option>
    </select>
    <input
      type="date"
      value={trip.startDate || ''}
      onChange={(e) => updateTrip(tripId, { startDate: e.target.value })}
    />
    <span>-</span>
    <input
      type="date"
      value={trip.endDate || ''}
      onChange={(e) => updateTrip(tripId, { endDate: e.target.value })}
    />
  </div>
)}
```

### TripMembers.tsx

**Table column (after Role column):**
```tsx
<th>{t('settled')}</th>
```

**Member row (after role badge):**
```tsx
<td>
  {member.isSettled ? (
    <span className="badge badge-success">✓ {t('settled')}</span>
  ) : (
    <span className="badge badge-neutral">{t('unsettled')}</span>
  )}
</td>
```

**Owner toggle button (in actions column, member.role !== 'owner'):**
```tsx
<button
  onClick={() => handleToggleSettled(member)}
  className="btn btn-sm"
  title={t('toggleSettled')}
>
  {member.isSettled ? t('markUnsettled') : t('markSettled')}
</button>
```

**Handler:**
```typescript
const handleToggleSettled = async (member: TripMember) => {
  await updateMemberSettled(trip.tripId, member.userId, !member.isSettled);
  await loadMembers();
};
```

### Settlement.tsx

**Accept memberSettledStatus prop (passed from TripDetailPage):**
```typescript
interface SettlementProps {
  expenses: Expense[];
  payerNames?: string[];
  memberSettledStatus?: Map<string, boolean>;  // member name -> isSettled
}
```

**In balance row - member.isSettled overrides balance calculation:**
```typescript
// Manual member.isSettled flag takes precedence over balance-based calculation
const isMemberSettled = memberSettledStatus?.get(balance.member) ?? (!isPositive && !isNegative);
```

**Note:** memberSettledStatus is fetched in TripDetailPage and passed down to Settlement.tsx

## Related Code Files

**Exclusive ownership (no overlap with Phase 1):**
- src/pages/TripsPage.tsx
- src/pages/TripDetailPage.tsx
- src/components/TripMembers.tsx
- src/components/Settlement.tsx

## Implementation Steps

### TripsPage.tsx
1. Add `filter` state: `'all' | 'active' | 'upcoming' | 'settled'`
2. Add status filter buttons above trip cards
3. Update `filter((t) => t.isActive)` to filter by status based on selected filter
4. Add `formatDateRange()` helper
5. Update trip card rendering to show status badge (upcoming=blue, active=green, settled=gray)
6. Update trip card meta to show date range
7. Add conditional status message (starts in X days / in progress / settled)

### TripDetailPage.tsx
1. Add `isOwner` check (based on trip.inviteCode existence)
2. Add handlers: `handleStatusChange`, `handleStartDateChange`, `handleEndDateChange`
3. Add status selector and date pickers (owner only)
4. Call `updateTrip()` when values change

### TripMembers.tsx
1. Import `updateMemberSettled` from api
2. Add `isSettled` column to table header
3. Add settlement status badge to each member row
4. Add toggle button for owner (excluding self and other owners)
5. Add `handleToggleSettled()` function

### Settlement.tsx
1. Add optional `memberSettledStatus` prop
2. Update balance row to use `memberSettledStatus` when provided
3. Visual distinction: settled members get checkmark + green styling

## Todo List

- [ ] TripsPage: Add status filter dropdown (all/active/upcoming/settled)
- [ ] TripsPage: Add status badge and date range display
- [ ] TripsPage: Add status-specific messages
- [ ] TripDetailPage: Add status selector and date pickers
- [ ] TripDetailPage: Fetch settlement status and pass to Settlement component
- [ ] TripMembers: Add isSettled column and toggle
- [ ] Settlement: Add memberSettledStatus prop (manual flag overrides balance)

## Success Criteria

- TripsPage has status filter buttons (all/active/upcoming/settled)
- Trip cards display status badge (blue/green/gray), date range, and status-specific messages
- TripDetailPage allows owner to edit status and dates
- TripMembers shows isSettled indicator per member with checkmark
- Owner can toggle member's settled status via API call
- Settlement component shows isSettled status from member data (manual flag overrides balance)

## Conflict Prevention

Phase 2 exclusively owns UI component files. Phase 1 owns API/types/i18n. No file overlap.

## Risk Assessment

- **Low Risk**: Additive UI changes
- **Display logic complexity**: Date range formatting and "starts in X days" calculation needs care

## Security Considerations

- Status/date editing only available to trip owner (isOwner check)
- Toggle settlement only available to trip owner
