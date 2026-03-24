---
title: "Phase 2: TripDetailPage Granular Reloads"
status: pending
priority: P1
created: 2026-03-24
---

# Phase 2: TripDetailPage Granular Reloads

## Context
Parent plan: [plan.md](./plan.md)

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-03-24 |
| Description | Replace full loadData() with targeted reload functions for expenses and members |
| Priority | P1 |
| Status | Pending |
| Review Status | Not reviewed |

## Key Insights
- `onExpenseDeleted={loadData}` (line 319) reloads trip, expenses, members, images when only expenses changed
- `onMembersChanged={loadData}` (line 328) reloads trip, expenses, members, images when only members changed
- Settlement calculation only needs expenses + memberNames + memberSettledStatus
- Images are independent of expenses/members

## Issues
1. **ExpenseList** passes `loadData` as `onExpenseDeleted` callback - causes full reload
2. **TripMembers** passes `loadData` as `onMembersChanged` callback - causes full reload

## Requirements
1. Create `reloadExpenses()` that only fetches expenses
2. Create `reloadMembers()` that only fetches members
3. Pass these granular reload functions to child components instead of `loadData`

## Architecture
```
TripDetailPage
├── loadData() - full reload (initial load only)
├── reloadExpenses() - only fetchExpenses(tripId)
├── reloadMembers() - only fetchTripMembers(tripId)
└── Children
    ├── ExpenseList → gets reloadExpenses
    └── TripMembers → gets reloadMembers
```

## Related Code Files
- `src/pages/TripDetailPage.tsx` (lines 56-79, 95-98, 319, 328)
- `src/components/ExpenseList.tsx` (line 12 - interface change)
- `src/components/TripMembers.tsx` (line 8 - interface change)

## Implementation Steps
1. Add `reloadExpenses` callback using useCallback that only calls `fetchExpenses`
2. Add `reloadMembers` callback using useCallback that only calls `fetchTripMembers`
3. Change `onExpenseDeleted` prop to use `reloadExpenses` instead of `loadData`
4. Change `onMembersChanged` prop to use `reloadMembers` instead of `loadData`
5. Update ExpenseList interface if needed (may need to accept different callback signature)

## Todo List
- [ ] Add reloadExpenses function (only fetches expenses)
- [ ] Add reloadMembers function (only fetches members)
- [ ] Pass reloadExpenses to ExpenseList
- [ ] Pass reloadMembers to TripMembers
- [ ] Test delete expense → only expenses reload
- [ ] Test add/remove member → only members reload

## Success Criteria
- Deleting an expense only reloads expenses (not trip, images, members)
- Adding/removing a member only reloads members (not trip, expenses, images)
- Initial page load still fetches all data in parallel

## Risk Assessment
- **Risk**: Medium - changing callback propagation
- **Impact**: Faster UX when deleting expenses or changing members
- **Mitigation**: Test each callback path thoroughly

## Security Considerations
None - this is refactoring existing API calls.

## Next Steps
Proceed to [Phase 3: Cover Upload Optimization](./phase-03-cover-upload-optimization.md)
