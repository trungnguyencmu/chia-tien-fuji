---
title: "Phase 3: Cover Upload Optimization"
status: pending
priority: P2
created: 2026-03-24
---

# Phase 3: Cover Upload Optimization

## Context
Parent plan: [plan.md](./plan.md)

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-03-24 |
| Description | Update local trip state instead of refetching after cover photo operations |
| Priority | P2 |
| Status | Pending |
| Review Status | Not reviewed |

## Key Insights
- `handleCoverUpload` (lines 119-153) makes separate `fetchCurrentTrip` call after upload (line 146)
- `handleRemoveCover` (lines 155-167) makes separate `fetchCurrentTrip` call after removal (line 160)
- These are 2 extra API calls that could be avoided by updating local state

## Issues
1. After cover upload: calls `updateTrip` then `fetchCurrentTrip` to get new imageUrl
2. After cover removal: calls `updateTrip` then `fetchCurrentTrip` to get updated trip

## Requirements
1. After successful `updateTrip` with imageS3Key, update local `trip` state directly
2. No need to refetch the entire trip object

## Architecture
```
handleCoverUpload:
  1. getImageUploadUrl()
  2. fetch(uploadUrl) to S3
  3. saveImage()
  4. updateTrip(tripId, { imageS3Key: s3Key })
  5. setTrip(prev => ({ ...prev, imageS3Key: s3Key, imageUrl: newUrl })) // Instead of fetchCurrentTrip

handleRemoveCover:
  1. updateTrip(tripId, { imageS3Key: '' })
  2. setTrip(prev => ({ ...prev, imageS3Key: '', imageUrl: '' })) // Instead of fetchCurrentTrip
```

## Related Code Files
- `src/pages/TripDetailPage.tsx` (lines 119-167)

## Implementation Steps
1. In `handleCoverUpload`: after `updateTrip` succeeds, update `setTrip` with new imageS3Key and imageUrl from S3 URL pattern
2. In `handleRemoveCover`: after `updateTrip` succeeds, update `setTrip` with empty imageS3Key and imageUrl
3. Remove `fetchCurrentTrip` calls from both handlers

## Todo List
- [ ] Remove fetchCurrentTrip from handleCoverUpload
- [ ] Update local trip state with new imageS3Key after upload
- [ ] Remove fetchCurrentTrip from handleRemoveCover
- [ ] Update local trip state with empty imageS3Key after removal
- [ ] Test cover upload shows new image immediately
- [ ] Test cover removal hides image immediately

## Success Criteria
- Cover upload removes extra `fetchCurrentTrip` API call
- Cover removal removes extra `fetchCurrentTrip` API call
- UI updates immediately after operations without flicker

## Risk Assessment
- **Risk**: Low - updating local state instead of refetching
- **Impact**: 1 less API call per cover operation
- **Mitigation**: Ensure the new imageUrl can be constructed locally

## Security Considerations
None - this is client-side state management.

## Next Steps
Proceed to [Phase 4: React Query Caching Layer](./phase-04-react-query-caching.md)
