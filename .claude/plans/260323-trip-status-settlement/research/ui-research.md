# UI Research

## 1. TripsPage.tsx

**Display:**
- Status badge next to trip name
- Date range (startDate - endDate)
- Status-specific labels: "Starts in X days" / "In progress" / "Settled"

**Location:** Around line 355-379 (trip card content)

## 2. TripDetailPage.tsx

**Add after line 271:**
- Status selector dropdown (owner only)
- startDate/endDate date pickers
- Use `updateTrip()` to persist changes

## 3. TripMembers.tsx

**Table changes:**
- Add "Settled" column
- Owner can toggle member's settled status via `updateMemberSettled()`

**Toggle button:** In actions column, add button that calls `handleToggleSettled(member)`

## 4. Settlement.tsx

**Changes:**
- Accept optional `memberSettledStatus` prop (Map<memberName, boolean>)
- Use member's manual isSettled flag when provided, otherwise calculate from balance

## 5. Translation Keys (~10 new keys)

```
statusUpcoming, statusInProgress, statusSettled
startsInDays, tripDates, tripInProgress, tripSettled
settled, unsettled, markSettled, markUnsettled
```

## File Ownership Matrix

| File | Phase |
|------|-------|
| src/api/api.ts | Phase 1 |
| src/utils/calculation.ts | Phase 1 |
| src/i18n/translations/en.ts | Phase 1 |
| src/i18n/translations/vi.ts | Phase 1 |
| src/pages/TripsPage.tsx | Phase 2 |
| src/pages/TripDetailPage.tsx | Phase 2 |
| src/components/TripMembers.tsx | Phase 2 |
| src/components/Settlement.tsx | Phase 2 |
