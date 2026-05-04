# Mobile Phase 6 Activity Product Specification

## Phase

Phase 6: Activity history, as listed in `specs/mobile_app_phase_index.spec.md`.

## Product Goal

Provide mobile users with a recent, read-only history of detected videos and their delivery state so they can understand what was found, whether it was delivered, and what needs attention.

## Product Decisions

- Activity is a read-only history surface backed by `GET /internal/activity`.
- Default filter is `All`.
- Status filters are shown as segmented controls or chips: All, Pending, Delivered, Retry, Failed.
- Activity items show video title, channel, delivery status, detected/published time, and an external YouTube link action.
- Detail UX uses expandable rows in the same list, not a separate detail screen.
- YouTube links open externally in the browser or YouTube app.
- Pagination uses infinite scroll.
- Delivery errors show for `failed` and `pending_retry`; normal states hide errors unless expanded or needed.
- After Run Poll, Activity data is automatically refreshed when Activity is mounted or when the user enters Activity.

## Activity Screen UX

- The Activity screen presents recent detected videos in reverse-recency order as provided by the backend contract.
- Each row should make the video identity, channel, delivery state, and relevant time information scannable.
- The screen should be useful immediately with the default `All` filter and should not require a user to pick a status first.
- The screen must not offer actions that mutate delivery state.

## Filtering UX

- Users can filter Activity by delivery status using segmented controls or chips.
- Filter labels map to backend status values:
  - All -> `all`
  - Pending -> `pending`
  - Delivered -> `delivered`
  - Retry -> `pending_retry`
  - Failed -> `failed`
- Changing filters updates the visible list and resets pagination context for that filter.
- Filter changes should preserve a clear sense of loading versus empty results.

## Activity Item And Expandable Detail UX

- Collapsed rows show:
  - video title
  - channel title
  - delivery status
  - detected and/or published time, with labels clear enough to distinguish them
  - external YouTube link action when `youtube_url` is available
- Expanded rows may show additional available metadata such as activity ID, delivery ID, video IDs, channel ID, last attempt time, and relevant delivery error details.
- Expansion happens inline within the list and must not navigate to a separate detail screen.
- Missing optional metadata should be handled gracefully without broken labels or raw null-like values.

## YouTube Link UX

- The YouTube action opens `youtube_url` externally in the user’s browser or installed YouTube app.
- Opening YouTube should not navigate away from the Activity screen inside the mobile app.
- If no YouTube URL is available, the link action should be hidden or disabled with a clear non-error affordance.

## Pagination And Refresh Behavior

- Activity uses infinite scroll for additional history.
- Initial load should show a loading state; loading more should not block already visible results.
- Pull-to-refresh or equivalent manual refresh may be provided if consistent with the mobile app’s existing refresh patterns.
- After Dashboard Run Poll completes, Activity queries should be invalidated/refreshed when the Activity screen is mounted or when the user next enters Activity.
- Phase 5 ownership remains unchanged: the Run Poll action itself lives in Dashboard manual actions.
- A later implementation spec will define infinite-scroll mechanics, page size, query keys, external link handling, and expansion state details.

## Delivery Error UX

- `last_error` is primarily relevant for `pending_retry` and `failed` deliveries.
- Failed and Retry rows should surface that an error exists without overwhelming the list.
- Expanded details for Failed and Retry rows should show `last_error` when available.
- Normal states should hide `last_error` unless expanded or otherwise needed for troubleshooting.
- Technical details should remain optional and aligned with Phase 2 friendly-error behavior.

## Read-Only Safety Requirements

- Viewing Activity must not trigger polling, retries, email sends, or YouTube API calls.
- Activity interactions are limited to reading history, filtering, pagination, refresh, expansion, and opening external YouTube links.
- The screen must not expose controls to retry deliveries, send emails, or run polling.

## Error, Loading, Empty, And Stale States

- Loading states should distinguish first load from loading additional pages.
- Empty states should be filter-aware, e.g. no failed activity versus no activity at all.
- Errors should use Phase 2 friendly messaging with optional technical details.
- Conservative retry behavior from Phase 2 applies; the UI should avoid aggressive repeated requests.
- If stale data is visible after an error or refresh failure, keep the stale list visible with a warning.

## Security Requirements

- Activity access requires the existing mobile/admin bearer token expected by `GET /internal/activity`.
- The UI must not display or log bearer tokens.
- External YouTube links should use the provided URL only and should not append sensitive app or auth data.
- Authorization failures should be presented as friendly access/session errors consistent with earlier phases.

## Out Of Scope

- Delivery retry actions.
- Poll execution controls; those remain in Dashboard manual actions.
- Email sending or delivery mutation.
- YouTube API reads or writes from the Activity screen.
- A separate activity detail screen.
- Backend endpoint changes.
- Exact component, file, hook, cache, query-key, or pagination implementation details.

## Product Acceptance Criteria

- [ ] Activity screen is available for Phase 6 as a read-only history view.
- [ ] Default filter is All.
- [ ] Users can filter by All, Pending, Delivered, Retry, and Failed.
- [ ] Activity rows show video title, channel, delivery status, detected/published time, and YouTube link action when available.
- [ ] Rows can expand inline to show additional details without navigating to another screen.
- [ ] Failed and Retry rows show relevant delivery error information when expanded.
- [ ] YouTube links open externally in browser/app and do not perform internal navigation.
- [ ] Infinite scroll supports loading additional Activity results.
- [ ] Activity data refreshes after Run Poll when Activity is mounted or when the user enters Activity.
- [ ] Loading, empty, error, and stale states follow Phase 2 product behavior.
- [ ] Viewing or interacting with Activity does not trigger polling, retries, email sends, YouTube API calls, or delivery mutations.
- [ ] Activity access uses the protected mobile/admin bearer-token flow without exposing credentials.

## Open Questions For Later Phases

- Should Activity eventually support search by video title or channel?
- Should users be able to copy IDs or links from expanded details?
- Should delivery status labels include richer explanations or help text?
- Should Activity support date-range filtering or grouping by channel?
