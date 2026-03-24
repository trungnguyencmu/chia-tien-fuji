---
title: "Trip Status & Per-Member Settlement"
description: "Add trip status (active/upcoming/settled), trip dates, and per-member settlement tracking"
status: completed
priority: P2
effort: 4h
branch: main
tags: [trip-status, settlement, frontend]
created: 2026-03-23
---

## Overview

Implement trip status lifecycle and per-member settlement tracking with:
- Trip status: `active | upcoming | settled`
- Trip dates: `startDate`, `endDate` (ISO date strings)
- Per-member `isSettled` boolean field
- New API endpoints for settlement management

## Phases

| Phase | Description | Parallel Group | Files |
|-------|-------------|----------------|-------|
| [Phase 1: API & Data Model](./phase-01-api-data-model.md) | Update interfaces and API functions | Group A | src/api/api.ts, src/utils/calculation.ts, src/i18n/translations/en.ts, src/i18n/translations/vi.ts |
| [Phase 2: UI Components](./phase-02-ui-components.md) | Update pages and components | Group A | src/pages/TripsPage.tsx, src/pages/TripDetailPage.tsx, src/components/TripMembers.tsx, src/components/Settlement.tsx |

## Dependency Graph

```
[Phase 1] ──┐
            ├──> (independent, can run parallel)
[Phase 2] ──┘
```

## Execution Strategy

**Parallel Execution:** Phase 1 and Phase 2 can be executed in parallel since they modify non-overlapping files.

## File Ownership Matrix

| File | Owner Phase |
|------|-------------|
| src/api/api.ts | Phase 1 |
| src/utils/calculation.ts | Phase 1 |
| src/i18n/translations/en.ts | Phase 1 |
| src/i18n/translations/vi.ts | Phase 1 |
| src/pages/TripsPage.tsx | Phase 2 |
| src/pages/TripDetailPage.tsx | Phase 2 |
| src/components/TripMembers.tsx | Phase 2 |
| src/components/Settlement.tsx | Phase 2 |

## Validation Log

### Session 1 — 2026-03-23
**Trigger:** Initial validation interview before implementation

#### Questions & Answers

1. **[Trip filtering]** The TripsPage filters trips with `filter((t) => t.isActive)`. Since we're replacing `isActive` with `status`, how should trips be filtered?
   - Options: Filter by status: active | Show all statuses | Add status selector
   - **Answer:** Add status selector
   - **Rationale:** Allows users to see upcoming/settled trips too, not just active ones

2. **[Settlement logic]** MemberBalance currently shows 'settled' when balance ≈ 0. The new `isSettled` field on TripMember is a manual flag. Which should take precedence?
   - Options: Member.isSettled overrides | Balance = 0 only | Both must be true
   - **Answer:** Member.isSettled overrides
   - **Rationale:** Manual settlement flag is explicit acknowledgment that member has been paid, regardless of whether balances perfectly zero out

3. **[Settlement data]** The plan adds `fetchSettlement` API. How should Settlement.tsx get member settlement status?
   - Options: Pass via TripDetailPage | Settlement fetches directly | Get from TripMembers
   - **Answer:** Pass via TripDetailPage
   - **Rationale:** TripDetailPage already fetches member data, can pass settlement info down as prop

4. **[Status colors]** For status badge colors, which scheme?
   - Options: upcoming=blue, active=green, settled=gray | upcoming=yellow, active=green, settled=gray | upcoming=purple, active=orange, settled=green
   - **Answer:** upcoming=blue, active=green, settled=gray
   - **Rationale:** Standard convention: blue=future, green=current/active, gray=past/complete

#### Confirmed Decisions
- **Trip filtering**: Add status selector dropdown in TripsPage (not just filter to active)
- **Settlement override**: `MemberBalance.isSettled` comes from member's manual flag, not balance calculation
- **Data flow**: TripDetailPage fetches settlement data and passes to Settlement.tsx via props
- **Status colors**: upcoming=blue (badge-info), active=green (badge-success), settled=gray (badge-neutral)

#### Action Items
- [ ] Phase 2: Add status filter dropdown to TripsPage (not just show active)
- [ ] Phase 2: Settlement.tsx receives `memberSettledStatus` prop from TripDetailPage
- [ ] Phase 2: Status badge colors per convention above

#### Impact on Phases
- Phase 2 (TripsPage): Add status filter dropdown - changes implementation approach
- Phase 2 (Settlement): Now receives settlement status from parent, not from TripMembers directly
- Phase 2 (TripMembers): Passes `memberSettledStatus` up to parent via callback
