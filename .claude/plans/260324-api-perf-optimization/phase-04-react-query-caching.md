---
title: "Phase 4: React Query Caching Layer"
status: pending
priority: P2
created: 2026-03-24
---

# Phase 4: React Query Caching Layer

## Context
Parent plan: [plan.md](./plan.md)

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-03-24 |
| Description | Add React Query to cache API responses and prevent redundant fetches |
| Priority | P2 |
| Status | Pending |
| Review Status | Not reviewed |

## Key Insights
- Currently NO caching layer - every page load = fresh API calls
- User navigates away and back = all data refetched
- React Query would provide automatic caching + stale-while-revalidate

## Issues
1. No caching - data fetched on every component mount
2. No deduplication - same query fired twice = two API calls
3. No background refetch - data becomes stale on focus

## Requirements
1. Install React Query (@tanstack/react-query)
2. Wrap app in QueryClientProvider
3. Convert fetchTrips, fetchCurrentTrip, fetchExpenses, fetchTripMembers, fetchImages to useQuery
4. Add staleTime configuration (e.g., 5 minutes for trips, 1 minute for expenses)

## Architecture
```
main.tsx:
  <QueryClientProvider client={queryClient}>
    <App />

api.ts:
  // Existing functions stay the same (raw fetch)
  // Consumers use useQuery hook instead

Components:
  const { data } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => fetchCurrentTrip(tripId),
    staleTime: 5 * 60 * 1000,
  })
```

## Related Code Files
- `src/main.tsx` (add QueryClientProvider)
- `src/api/api.ts` (no changes needed - functions remain)
- All page components that use API calls

## Implementation Steps
1. Install `@tanstack/react-query`
2. Add QueryClientProvider to main.tsx
3. Create queryClient with default options
4. Convert TripsPage to use useQuery for fetchTrips
5. Convert TripDetailPage to use useQuery for all data fetches
6. Set appropriate staleTime per query type:
   - Trips list: 5 minutes
   - Trip detail: 2 minutes
   - Expenses: 1 minute
   - Members: 2 minutes
   - Images: 2 minutes

## Todo List
- [ ] Install @tanstack/react-query
- [ ] Add QueryClientProvider to main.tsx
- [ ] Configure queryClient with default options
- [ ] Convert TripsPage to use useQuery
- [ ] Convert TripDetailPage to use useQuery for all queries
- [ ] Set staleTime per query type
- [ ] Test that data persists when navigating between pages

## Success Criteria
- Navigating away and back to TripsPage shows cached data instantly
- Navigating away and back to TripDetailPage shows cached data instantly
- Background refetch updates stale data when app regains focus
- No duplicate API calls for same data

## Risk Assessment
- **Risk**: Medium - adding new library and changing data fetching patterns
- **Impact**: Much faster page navigation, better UX
- **Mitigation**: Test thoroughly, ensure cache invalidation works on mutations

## Security Considerations
- React Query stores data in memory (not localStorage) - no sensitive data persistence
- Cache is per-session, clears on page refresh

## Next Steps
None - this is the final phase.
