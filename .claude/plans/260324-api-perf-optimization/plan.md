---
title: "API Performance Optimization"
description: "Eliminate redundant API calls across TripsPage and TripDetailPage"
status: pending
priority: P2
effort: 4h
branch: main
tags: [performance, api, react]
created: 2026-03-24
---

# API Performance Optimization Plan

## Context
User reported page load performance issues due to redundant API calls. Example: TripsPage fetches members for each trip unnecessarily.

## Issues Found

| Location | Issue | Severity |
|----------|-------|----------|
| TripsPage:43-52 | N+1 query - fetches members for each trip just for member count | Critical |
| TripDetailPage:319 | `onExpenseDeleted=loadData` reloads ALL data instead of just expenses | High |
| TripDetailPage:328 | `onMembersChanged=loadData` reloads ALL data instead of just members | High |
| TripDetailPage:146,160 | Cover operations call `fetchCurrentTrip` separately | Medium |
| TripMembers:41 | Redundant fetch on mount (parent already fetched) | Medium |
| Global | No caching layer (React Query) | High |

## Phases

### [Phase 1: TripsPage N+1 Fix](./phase-01-trips-n-plus-one.md)
Remove N+1 query - backend will include `memberCount` in Trip response. Use that instead of per-trip member fetch.

### [Phase 2: TripDetailPage Granular Reloads](./phase-02-tripdetail-granular-reloads.md)
Replace full `loadData()` with targeted reload functions. Delete expense → only reload expenses. Member change → only reload members.

### [Phase 3: TripDetailPage Cover Upload Optimization](./phase-03-cover-upload-optimization.md)
**SKIPPED** - Requires backend to return `imageUrl` in `updateTrip` response. Currently still calls `fetchCurrentTrip` after cover operations.

### [Phase 4: React Query Caching Layer](./phase-04-react-query-caching.md)
Add React Query with staleTime configuration to cache API responses and prevent redundant fetches.

## Files to Modify
- `src/pages/TripsPage.tsx`
- `src/pages/TripDetailPage.tsx`
- `src/components/ExpenseList.tsx`
- `src/components/TripMembers.tsx`
- `src/components/TripPhotos.tsx`
- `src/api/api.ts` (add query functions if using React Query)

## Status
- [x] Plan created
- [x] Phase 1: TripsPage N+1 Fix
- [x] Phase 2: TripDetailPage Granular Reloads
- [x] Phase 3: Skipped (requires backend)
- [x] Phase 4: React Query Caching Layer
