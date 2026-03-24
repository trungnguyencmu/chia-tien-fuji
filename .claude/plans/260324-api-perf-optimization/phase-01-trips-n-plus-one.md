---
title: "Phase 1: TripsPage N+1 Query Fix"
status: pending
priority: P1
created: 2026-03-24
---

# Phase 1: TripsPage N+1 Query Fix

## Context
Parent plan: [plan.md](./plan.md)

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-03-24 |
| Description | Remove unnecessary `fetchTripMembers` calls from trips list page |
| Priority | P1 |
| Status | Pending |
| Review Status | Not reviewed |

## Key Insights
- Lines 43-52 of TripsPage.tsx fetch members for EACH trip just to get member count
- If user has 10 trips, this generates 11 API calls (1 fetchTrips + 10 fetchTripMembers)
- Backend will include `memberCount` directly in the Trip response
- No client-side change needed once backend implements this - just wait for API change

## Requirements
1. Wait for backend to add `memberCount` to Trip model
2. Trip interface in api.ts already needs to include `memberCount?: number`
3. Remove the Promise.all with `fetchTripMembers` calls - use `trip.memberCount` instead
4. Keep memberCount display in UI (just use the field from trip instead of separate API call)

## Architecture
Simple removal - no architectural changes needed.

## Related Code Files
- `src/pages/TripsPage.tsx` (lines 16-19, 43-52, 474, 511)

## Implementation Steps
1. Update Trip interface in api.ts to include `memberCount?: number` (if not already)
2. Remove `fetchTripMembers` from imports (line 6)
3. Simplify `loadTrips` to use `trip.memberCount` instead of fetching each trip's members
4. Update trip card rendering to use `trip.memberCount` (lines 474, 511)
5. Change trips state from `TripCardData[]` to `Trip[]` and use trip.memberCount

## Todo List
- [ ] Update Trip interface with memberCount field
- [ ] Remove fetchTripMembers import
- [ ] Simplify loadTrips function - use trip.memberCount instead of Promise.all
- [ ] Update trip card UI to use trip.memberCount
- [ ] Test that page loads with 1 API call and member count shows correctly

## Success Criteria
- TripsPage loads with 1 API call (fetchTrips) instead of 1+N calls
- Member count shown on trip cards via trip.memberCount (from backend)
- No breaking changes to other functionality
- Backend provides memberCount in trip response

## Risk Assessment
- **Risk**: Low - removing unnecessary data fetching
- **Impact**: Faster page load, fewer API calls
- **Mitigation**: Test that trip creation, deletion, navigation still work

## Security Considerations
None - this is a removal of unnecessary API calls.

## Next Steps
Proceed to [Phase 2: TripDetailPage Granular Reloads](./phase-02-tripdetail-granular-reloads.md)
