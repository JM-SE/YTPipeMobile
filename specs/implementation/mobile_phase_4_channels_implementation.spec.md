# Mobile Phase 4 Channels Implementation Specification

## Context

Product source: `specs/mobile_phase_4_channels_product.spec.md`.

Phase 0-3 are implemented and committed; Phase 3 Dashboard is complete. `src/screens/ChannelsScreen.tsx` remains a placeholder explaining that monitored/unmonitored tabs and toggles arrive in Phase 4.

Existing implementation evidence:

- `src/api/mobileApi.ts` provides `getChannels(config, query)` and `updateChannelMonitoring(config, channelId, payload)`.
- `src/api/types.ts` includes `Channel`, `ChannelsResponse`, `ChannelsQuery`, `MonitoringFilter`, `UpdateChannelMonitoringPayload`, and `UpdateChannelMonitoringResponse`.
- `src/api/queryKeys.ts` includes `queryKeys.channels(baseUrl, monitoring, query, limit, offset)`; query keys must not include bearer tokens.
- `src/api/useStatusQuery.ts` is the style reference for active-config gating, previous data, and conservative retry.
- Navigation has `AppTabsParamList` with Dashboard, Channels, Activity and `AppStackParamList` with MainTabs, Settings; `AppNavigator` can add a stack-level `ChannelDetail` route above tabs.
- `ScreenShell` content has `flex: 1`; Dashboard solved tab bar overlap with `useBottomTabBarHeight()` and bottom padding.
- The mock server supports `GET /internal/channels` and `PATCH /internal/channels/:channel_id/monitoring`.

## Requirements

- [ ] Replace the Channels placeholder with a real Channels screen that defaults to monitored channels.
- [ ] Support segmented filters for Monitored, Unmonitored, and All, mapped to `monitoring=monitored|unmonitored|all`.
- [ ] Support debounced search with a 400ms delay before issuing list queries.
- [ ] Implement offset-based infinite scroll using `FlatList` and `onEndReached` with fixed page size `25`.
- [ ] Support pull-to-refresh and visible loading, empty, stale, and error states.
- [ ] Add direct monitoring switches with optimistic update, rollback on failure, friendly banner errors, and optional technical details following the Phase 2 pattern.
- [ ] Disable only the affected channel switch while its mutation is pending to prevent repeated changes.
- [ ] Show first-activation baseline/polling education once per install/config and persist acknowledgement in AsyncStorage.
- [ ] Add a simple stack-level Channel Detail screen opened by tapping a channel row; tabs may be hidden on the depth screen.
- [ ] Invalidate/refetch affected channel queries and `/status` after successful monitoring changes so Dashboard monitored counts reconcile.
- [ ] Use only React Native primitives and existing theme/tokens; do not add a UI library.
- [ ] Add focused hook and critical UI tests for query/mutation behavior, filters/search, empty/error states, optimistic rollback, and basic navigation/detail behavior.
- [ ] Preserve security requirements: use the mobile bearer only, never internal tokens, never leak tokens in query keys, error details, logs, or UI.

## Technical Approach

Create dedicated channel API hooks:

- `src/api/useChannelsQuery.ts`
  - Use `useInfiniteQuery` or equivalent TanStack Query pagination.
  - Enable only when active API config is available.
  - Query key must use config-aware `baseUrl`, `monitoring`, debounced query text, `limit`, and `offset` only; never include bearer token.
  - Use default `monitoring='monitored'` and `limit=25`.
  - Use offset-based pagination: first page offset `0`, next page offset derived from loaded item count or response pagination metadata.
  - Preserve previous data where practical and use conservative retry behavior consistent with `useStatusQuery`.
- `src/api/useUpdateChannelMonitoringMutation.ts`
  - Wrap `updateChannelMonitoring(config, channelId, payload)`.
  - Perform optimistic cache updates across relevant channels list queries.
  - Roll back all touched cache snapshots on failure.
  - On success/settle, reconcile channel list queries and invalidate status query data because monitored count can change.

Pagination decision: use `limit=25`. This keeps first render lightweight on mobile, limits payload size during search/filter changes, and still provides enough rows for smooth scrolling; `onEndReached` loads subsequent pages as needed.

Recommended UI modules under `src/components/channels/`:

- Segmented filter control for Monitored, Unmonitored, All.
- Search input with local draft state and 400ms debounced committed query.
- Channel row/card with title, monitored/unmonitored badge, monitoring switch, and latest video snippet when available.
- Latest video snippet that uses neutral copy when data is absent.
- Empty state, error/banner, stale warning, and first-activation education modal components.

`ChannelsScreen.tsx` behavior:

- Use `FlatList`, `RefreshControl`, and the Dashboard bottom tab padding pattern via `useBottomTabBarHeight()`.
- Maintain selected filter state, search draft, debounced query, and flattened pages from `useChannelsQuery`.
- Show initial loading when no data is available, stale warning when previous data remains after refetch failure, friendly no-data errors with retry/details, and filter/search-specific empty states.
- Empty state copy must guide users with no imported data or no monitored channels toward Dashboard Manual actions / Sync subscriptions, while noting Phase 5 executes those actions later.
- `onEndReached` should not request another page while fetching or when no next page exists.

Navigation/detail behavior:

- Add `ChannelDetail` to `AppStackParamList` and `AppNavigator` above tabs.
- Define route params explicitly in `src/navigation/types.ts`; include at minimum `channelId` and `title`, and optionally a lightweight channel snapshot if practical.
- Row taps navigate to `ChannelDetail`.
- `src/screens/ChannelDetailScreen.tsx` should show immediate content from params/snapshot and/or cached list data: channel title, current monitoring state/switch, latest detected video info if present, and plain-language monitoring explanation.
- Keep the MVP simple; no full activity history is required.

Monitoring toggle flow:

- Use React Native `Switch` or a Pressable equivalent; no confirmation by default.
- First attempt to enable monitoring checks AsyncStorage acknowledgement key `ytpipe:channels:first-monitoring-activation-ack:${baseUrl}`.
- If acknowledgement is missing, show education modal before the mutation. The primary action copy should be `I understand, enable monitoring`; tapping it persists acknowledgement and performs the toggle.
- Later enable/disable actions are direct.
- Education copy must explain future-only polling/baseline behavior, that unmonitored channels remain catalog entries, and that activation does not send notifications for old videos.
- On mutation failure, roll back optimistic state and show a friendly banner; include optional technical details using the Phase 2 pattern. For 401, guide the user to Settings.

Security and errors:

- Use only the configured mobile/admin bearer accepted by mobile API calls; never request or expose internal-only bearer tokens.
- Do not put tokens in query keys, error details, debug text, screenshots, or logs.
- Use friendly errors and avoid leaking raw authorization headers or credentials.

## Implementation Steps

1. Review `specs/mobile_phase_4_channels_product.spec.md`, current Phase 2/3 query patterns, and the channel DTO/query-key/API shapes.
2. Add `useChannelsQuery` with config-aware enabled state, `limit=25`, offset pagination, previous-data behavior, and conservative retry.
3. Add `useUpdateChannelMonitoringMutation` with optimistic cache updates, rollback snapshots, successful reconciliation of channel queries, and `/status` invalidation.
4. Add channel UI components for segmented filters, search input, row/card, latest video snippet, empty/error/banner states, stale warning, and first-activation education modal.
5. Update `ChannelsScreen.tsx` to render the `FlatList`, filters, debounced search, pull-to-refresh, infinite scroll, bottom tab padding, loading/empty/error/stale states, row navigation, and switch interactions.
6. Add `ChannelDetail` route params to navigation types and register `ChannelDetailScreen` in the stack above tabs.
7. Implement `ChannelDetailScreen.tsx` with immediate route-param/cached data rendering and the same monitoring switch behavior where practical.
8. Persist first-activation education acknowledgement in AsyncStorage with key `ytpipe:channels:first-monitoring-activation-ack:${baseUrl}`.
9. Add focused hook tests for channel query pagination/key safety and monitoring mutation optimistic update/rollback/invalidation.
10. Add critical UI tests for filter/search behavior, empty/error/stale states, first education flow, optimistic rollback banner, and basic row-to-detail navigation.
11. Verify with `npm run typecheck`, `npm test`, and manual mock-server validation.

## Acceptance Criteria

- [ ] Channels screen no longer renders the Phase 4 placeholder.
- [ ] Default Channels load requests monitored channels with `monitoring='monitored'`, `limit=25`, and `offset=0`.
- [ ] Monitored, Unmonitored, and All filters map to the correct backend monitoring values and reset/reconcile pagination appropriately.
- [ ] Search uses draft input plus a 400ms debounced query and does not request on every keystroke.
- [ ] `FlatList` infinite scroll loads additional offset pages only when more data exists and no page fetch is already pending.
- [ ] Pull-to-refresh refetches the current filter/search list and preserves usable previous data on refetch failure.
- [ ] Stale data warning appears when old channel data remains visible after a failed refetch.
- [ ] Initial loading, no imported channels, no monitored channels, no search results, no-data error, and stale-with-data states have friendly copy.
- [ ] Empty states direct users toward Dashboard Manual actions / Sync subscriptions where relevant without implying Phase 4 executes sync.
- [ ] Channel rows show title, monitoring state, switch, and latest detected video info or neutral absent-video copy.
- [ ] Tapping a channel row opens stack-level `ChannelDetail`; hiding tabs on detail is acceptable.
- [ ] Detail route params are explicitly typed and provide at least `channelId` and `title`.
- [ ] Detail screen shows channel title, monitoring state/switch, latest video info when available, and future-only monitoring explanation.
- [ ] Switch changes are direct except for the first enable education flow.
- [ ] First enable attempt without acknowledgement opens education modal; `I understand, enable monitoring` persists `ytpipe:channels:first-monitoring-activation-ack:${baseUrl}` and performs activation.
- [ ] Later enable/disable toggles do not show the education modal for the same persisted key.
- [ ] The affected switch is disabled while its channel mutation is pending.
- [ ] Monitoring mutation updates UI optimistically and rolls back on failure.
- [ ] Toggle failure shows a friendly banner, keeps final state clear, and provides optional technical details without token leakage.
- [ ] 401 errors guide users to Settings where practical.
- [ ] Successful toggle reconciles affected channel list queries and invalidates `/status` so Dashboard monitored counts can update.
- [ ] Channel query and mutation keys/caches never include bearer tokens.
- [ ] Tests cover hooks, query/mutation behavior, filters/search, empty/error states, optimistic rollback, first education, and basic navigation/detail behavior.
- [ ] `npm run typecheck` passes.
- [ ] `npm test` passes.
- [ ] Manual mock-server validation covers configure mock, default monitored list, filter switching, search, unmonitored-to-monitored toggle, first education modal, detail screen, and an error scenario if feasible.

## Out Of Scope

- Executing subscription sync or polling actions; this remains Phase 5.
- Push notification registration or delivery.
- Bulk monitoring changes.
- Advanced sorting, grouping, channel analytics, or metadata editing.
- Full channel activity history on detail; later phases may expand this.
- New backend endpoints or API contract changes.
- Adding a UI component library.
