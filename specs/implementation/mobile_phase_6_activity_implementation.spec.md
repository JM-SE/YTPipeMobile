# Mobile Phase 6 Activity Implementation Specification

## Context

Product source: `specs/mobile_phase_6_activity_product.spec.md`.

Current implementation evidence:

- `src/screens/ActivityScreen.tsx` is still a placeholder.
- `src/api/mobileApi.ts` already exposes `getActivity(config, query)` for `GET /internal/activity`.
- `src/api/types.ts` already defines `ActivityStatusFilter`, `DeliveryStatus`, `ActivityItem`, `ActivityResponse`, and `ActivityQuery`.
- `src/api/queryKeys.ts` includes `queryKeys.activity(baseUrl, status, limit, offset)` and Phase 5 invalidates activity queries by `query.queryKey[0] === 'activity'` after Run Poll.
- Existing patterns to follow include `src/api/useChannelsQuery.ts`, `src/screens/ChannelsScreen.tsx`, `ChannelFilterTabs`, `ChannelErrorBanner`, dashboard relative-time helpers in `src/components/dashboard/dashboardFormatters.ts`, and React Native `Linking` for external URLs.

## Requirements

- [ ] Replace the Activity placeholder with a read-only activity feed backed by `GET /internal/activity`.
- [ ] Use an infinite `FlatList` with fixed page size `25` and offset based on loaded item count.
- [ ] Provide reusable Activity-specific filter chips/tabs for All, Pending, Delivered, Retry, and Failed.
- [ ] Allow only one expanded activity row at a time.
- [ ] Open the provided YouTube URL externally with `Linking.openURL`; show inline row-level error if opening fails.
- [ ] Display timestamps as relative time with safe fallback, clearly distinguishing published, detected, and last attempt times.
- [ ] Expanded details include available fields: `activity_id`, `delivery_id`, `video_id`, `youtube_video_id`, `channel_id`, published/detected timestamps, `last_attempt_at`, and `last_error` when relevant.
- [ ] Collapsed Failed/Retry rows show a status badge plus short hint that error details are available; full error appears only when expanded.
- [ ] Rely on existing activity query invalidation/stale refetch after Dashboard Run Poll; avoid extra forced focus refetch unless implementation proves it necessary.
- [ ] Cover hook and critical UI behavior with tests.

## Technical Approach

Add an Activity infinite-query hook and Activity UI components while preserving read-only safety.

Likely files/modules to add or update:

- `src/api/useActivityQuery.ts` for the infinite query hook.
- `src/components/activity/ActivityStatusFilterTabs.tsx` for Activity filter chips/tabs.
- `src/components/activity/ActivityListItem.tsx` for collapsed/expanded activity rows.
- `src/components/activity/ActivityErrorBanner.tsx`, or reuse/generalize an existing shared error banner if project style supports it.
- `src/components/activity/activityFormatters.ts`, or reuse dashboard formatter helpers where sufficient.
- `src/screens/ActivityScreen.tsx` to compose filters, list, states, expansion, refresh, and bottom-tab padding.

Query behavior:

- Use `useInfiniteQuery` following `useChannelsQuery.ts` conventions and active API config gating.
- Query keys must begin with `['activity', baseUrl, status, limit]` or otherwise remain compatible with `query.queryKey[0] === 'activity'` invalidation.
- Query keys must not include bearer tokens, authorization headers, or secrets.
- Use `limit=25` for every page.
- Compute `offset` from the number of loaded items/pages; fetch the next page only while the previous page returned enough data or the API indicates more data.
- Enable the query only when active API config is available.
- Retry conservatively: max `1` retry for network/timeout/5xx errors; do not retry auth, not-found, validation, or other client/prerequisite failures.

UI behavior:

- Render with React Native `FlatList`, `RefreshControl`, `ListEmptyComponent`, `ListFooterComponent`, and `onEndReached` for pagination.
- Use `useBottomTabBarHeight` for bottom padding consistent with `ChannelsScreen.tsx`.
- Activity filters should use `accessibilityRole="tablist"` for the container where supported and `accessibilityRole="tab"` for each filter item, with selected state/labels.
- Activity rows should be `Pressable` with accessible labels and state for expansion.
- Maintain a single `expandedActivityId` in screen state; selecting a new row collapses the previous row.
- Open only the URL provided by the Activity item via `Linking.openURL`; do not append auth data, tokens, or extra query params.
- If `Linking.openURL` rejects or cannot open the URL, display a concise inline error on that row and keep the app stable.

State and messaging:

- First load should show an Activity-specific loading state.
- Pull refresh should preserve visible content while indicating refresh.
- Load-more should show footer progress and should not replace existing rows.
- Empty copy must be filter-aware, e.g. distinguish no activity from no failed/retry/pending items.
- If stale data is visible and a refetch fails, keep stale rows visible and show a warning/banner.
- Full-screen error is acceptable only when no data is available.
- Failed/Retry collapsed rows should show a short hint such as “Error details available”; expanded rows may show `last_error`.

Read-only safety:

- Do not add delivery retry actions, polling actions, email send actions, YouTube API calls, or backend mutations.
- The only external side effect is opening the provided YouTube URL in the browser/app.
- Do not expose bearer tokens or backend secrets in UI, query keys, errors, logs, or URLs.

## Implementation Steps

1. Review the Phase 6 product spec and existing Channels infinite-list, filter-tabs, error-banner, bottom-padding, and dashboard formatter patterns.
2. Add `useActivityQuery` wrapping `getActivity(config, query)` with active-config gating, `limit=25`, status filter, computed offset, no-token query keys, and conservative retry behavior.
3. Implement Activity filter tabs/chips for All, Pending, Delivered, Retry, and Failed with accessible selected state and labels.
4. Implement Activity row rendering with status badge, relative published/detected copy, short failed/retry hint, single-row expansion support, and expanded ID/timestamp/error details.
5. Add safe timestamp formatting helpers or reuse dashboard helpers, ensuring fallback text for missing/invalid timestamps.
6. Wire `ActivityScreen.tsx` with filter state, `FlatList`, `RefreshControl`, infinite scroll, bottom tab padding, first-load/loading-more/empty/error/stale states, and single expanded row state.
7. Add YouTube external-link handling through `Linking.openURL` with row-level inline failure messaging and no auth data appended.
8. Add tests for `useActivityQuery`: active-config gating, query key shape, status/limit/offset parameters, pagination, retry policy, and no-token key behavior.
9. Add critical UI tests for filters, infinite scroll trigger, pull refresh, row expansion/collapse, YouTube link success/failure handling, empty states, first-load error, and stale-data refetch error warning.
10. Verify with `npm run typecheck`, `npm test`, and manual validation against the mock API using Activity filters and Dashboard Run Poll invalidation flow.

## Acceptance Criteria

- [ ] Activity tab renders a functional read-only activity feed instead of a placeholder.
- [ ] Activity data is fetched through `getActivity(config, query)` using active API config only.
- [ ] Infinite pagination uses `limit=25` and correct offsets without duplicate or skipped rows.
- [ ] Query keys start with `activity`, include base URL/status/limit compatibility, exclude tokens, and remain invalidated by Phase 5 Run Poll predicate invalidation.
- [ ] Filters show All, Pending, Delivered, Retry, and Failed and refetch/render filter-specific results.
- [ ] `FlatList` supports pull refresh, load-more footer, filter-aware empty states, and bottom tab bar padding.
- [ ] Only one row can be expanded at a time.
- [ ] Expanded details include required IDs, timestamps, `last_attempt_at`, and relevant error text.
- [ ] Failed/Retry collapsed rows show a badge and short hint without exposing full error text.
- [ ] Timestamps distinguish detected vs published and degrade safely when values are missing/invalid.
- [ ] YouTube action opens the provided URL externally and shows inline error if opening fails.
- [ ] No retry delivery, polling, email send, YouTube API, or other mutation behavior is added.
- [ ] First-load, load-more, refresh, empty, full-error, stale-warning, and inline link-error states are handled.
- [ ] Tests cover hook behavior and critical UI behavior listed in the implementation steps.
- [ ] `npm run typecheck` passes.
- [ ] `npm test` passes.
- [ ] Manual validation passes against mock API for Activity filters, pagination, expansion, YouTube link handling, and post-Run-Poll stale refetch behavior.

## Out of Scope

- Backend API changes or new Activity DTO fields.
- Delivery retry/resend, polling, notification sending, or any mutation from the Activity screen.
- In-app YouTube playback, OAuth flows, or direct YouTube API calls.
- Push notifications, background refresh, or forced focus refetch beyond existing stale query behavior.
