# Mobile Push Phase E Channel Preferences Implementation Specification

## Context

Phase D mobile push settings, registration, and test notification UI is implemented for the YTPipeMobile React Native/Expo TypeScript app. Phase E adds account/channel-level push preferences for monitored channels while preserving the existing Channels data contract.

Source of truth:
- `specs/mobile_push_rn_handoff.spec.md` is the definitive backend contract.
- `specs/implementation/mobile_push_notifications_implementation.spec.md` contains the Phase E summary.

Backend contract to preserve exactly:
- `GET /internal/mobile-push/channel-preferences?monitoring=monitored|all&query=&limit=&offset=` returns `{ channels: [...], pagination }` with channel objects containing `channel_id`, `youtube_channel_id`, `title`, `is_monitored`, `push_eligible`, `push_enabled`, and `preference: { explicitly_set, explicit_push_enabled, updated_at }`.
- `PATCH /internal/mobile-push/channels/{channel_id}` accepts body exactly `{ push_enabled: boolean }` and returns one channel preference object.
- Key errors: `401`, `422` for GET; `401`, `404`, `409`, `422` for PATCH.
- Existing `GET /internal/channels` remains unchanged and must not gain push fields.

Effective model: `settings.enabled AND user_channel.is_monitored AND (explicit preference if explicitly_set else settings.default_for_monitored_channels)`. Unmonitored channels never push. Global disabled can make effective `push_enabled=false`.

## Requirements

- [ ] Add Phase E DTOs and validation schemas without changing existing `Channel` or `/internal/channels` parsing.
- [ ] Add mobile push channel preference GET/PATCH API functions using the exact backend paths and snake_case payloads.
- [ ] Add query keys/page size support for mobile push channel preferences without including bearer tokens in keys.
- [ ] Add infinite query and patch mutation hooks with config/offline guards, pagination, retry behavior, invalidation, and optional optimistic rollback.
- [ ] Integrate preference status into Channels list as a badge/status overlay only; do not replace `useChannelsQuery` as the list source.
- [ ] Add Channel Detail per-channel push controls only for currently monitored channels.
- [ ] Keep monitoring and push preference toggles independent.
- [ ] Handle `401`, `404`, `409`, `422`, offline, and cached-state scenarios with user-friendly copy.
- [ ] Add focused tests for APIs, schemas, hooks, UI integration, and `/internal/channels` regression.

## Technical Approach

### Types and Schemas

Modify `src/api/types.ts` to add Phase E types only:
- `MobilePushChannelPreferencePreference` or equivalent nested preference object type:
  - `explicitly_set: boolean`
  - `explicit_push_enabled: boolean | null`
  - `updated_at: string | null`
- `MobilePushChannelPreference`:
  - `channel_id: number`
  - `youtube_channel_id: string`
  - `title: string`
  - `is_monitored: boolean`
  - `push_eligible: boolean`
  - `push_enabled: boolean`
  - `preference: <nested preference type>`
- `MobilePushChannelPreferencesResponse` with `channels: MobilePushChannelPreference[]` and existing-compatible `pagination` shape.
- `MobilePushChannelPreferencesQueryParams` with `monitoring?: 'monitored' | 'all'`, `query?: string`, `limit?: number`, `offset?: number`.
- `PatchMobilePushChannelPreferenceRequest` with `push_enabled: boolean`.
- `PatchMobilePushChannelPreferenceResponse` as the returned channel preference type or alias.

Modify `src/api/validation/schemas.ts` to add lenient `.passthrough()` Zod schemas preserving snake_case field names:
- nested preference schema.
- channel preference schema.
- channel preferences response schema.
- patch request schema if request validation helpers are used in this codebase.

Do not add push fields to `Channel`, `ChannelsResponse`, or existing `/internal/channels` schemas.

### API Layer

Extend `src/api/mobilePushApi.ts` with:
- `getMobilePushChannelPreferences(config, query)` calling `GET /internal/mobile-push/channel-preferences` with `monitoring`, `query`, `limit`, and `offset` query params. Defaulting may live in the hook, but the API must pass supplied params faithfully.
- `patchMobilePushChannelPreference(config, channelId, { push_enabled })` calling `PATCH /internal/mobile-push/channels/{channel_id}` with body exactly `{ push_enabled: boolean }`.

Both functions must use the existing authenticated mobile bearer-token request path and parse responses through the new schemas.

### Query Keys and Caching

Modify `src/api/queryKeys.ts`:
- Add a page size constant for mobile push channel preferences, preferably `25` to align with `QUERY_PAGE_SIZE.channels`.
- Add `queryKeys.mobilePush.channelPreferences(baseUrl, monitoring, query)`.
- Keep keys token-free. Include only stable config identity such as base URL plus UI query dimensions.
- Use existing `queryKeys.isMobilePush` for broad invalidation where appropriate, or add a narrowly scoped predicate only if needed.

### Hooks

Create `src/hooks/useMobilePushChannelPreferencesQuery.ts`:
- Use `useInfiniteQuery`.
- Require active config using existing config gate patterns.
- Default `monitoring` to `'monitored'`.
- Accept a caller-supplied debounced search string; do not debounce inside the hook unless this is an established app pattern.
- Use page size `25`.
- Use conservative transient retry behavior consistent with existing API hooks.
- Use previous-data placeholder behavior to avoid list flicker between query/search changes.
- Do not include tokens in query keys.

Create `src/hooks/usePatchMobilePushChannelPreferenceMutation.ts`:
- Send the exact PATCH body `{ push_enabled }`.
- Guard for offline and missing/inactive config before network calls.
- Optionally optimistically update cached mobile push channel preference pages with rollback on error.
- Invalidate mobile push channel preferences and mobile push status after settlement.
- Surface typed/friendly errors for UI copy mapping.

### UI Integration

Modify `src/screens/ChannelsScreen.tsx` and related components as needed:
- Continue using `useChannelsQuery`, `FlatList`, and `ChannelListItem` as the source of Channels list data.
- Fetch Phase E preference data separately and overlay by `channel_id`.
- Show compact push badge/status for monitored channels only when preference data is available.
- Do not add active push controls to the Channels list.
- For unmonitored/all diagnostic views, hide the badge or show passive `Not eligible`; do not expose active controls.
- Preserve existing filter/search, auth banner, and offline guard behavior.

Modify `src/screens/ChannelDetailScreen.tsx` and related controller/components as needed:
- Show a push section/switch only when the channel is currently monitored.
- Disable the switch when offline, mutation is pending, config is unavailable, or cached global/registration status indicates push is unavailable.
- If global push is disabled, show explanatory copy and either disable the switch or clearly indicate the per-channel setting is currently ineffective; choose one consistent implementation.
- The push preference switch must not toggle monitoring.
- The monitoring switch must not patch push preference.
- After monitoring changes that affect eligibility, invalidate mobile push channel preferences and status if relevant.
- If monitoring becomes disabled in detail, hide or disable the push switch immediately.

## Implementation Steps

1. Add Phase E DTOs in `src/api/types.ts`, preserving existing `Channel` and `ChannelsResponse` unchanged.
2. Add Phase E `.passthrough()` validation schemas in `src/api/validation/schemas.ts`.
3. Extend `src/api/mobilePushApi.ts` with GET channel preferences and PATCH channel preference functions.
4. Extend `src/api/queryKeys.ts` with page size and channel preference query key support.
5. Add `src/hooks/useMobilePushChannelPreferencesQuery.ts` for infinite preference loading.
6. Add `src/hooks/usePatchMobilePushChannelPreferenceMutation.ts` for per-channel preference updates and cache invalidation.
7. Integrate passive preference badges/status into Channels list by overlaying preference data by `channel_id`.
8. Integrate monitored-only per-channel push controls into Channel Detail.
9. Ensure monitoring mutations invalidate mobile push preferences where eligibility can change.
10. Add focused tests and regression coverage.

## Acceptance Criteria

- [ ] GET channel preferences uses `/internal/mobile-push/channel-preferences` with `monitoring`, `query`, `limit`, and `offset` params and parses the documented response.
- [ ] PATCH channel preference uses `/internal/mobile-push/channels/{channel_id}` and sends body exactly `{ push_enabled: boolean }`.
- [ ] Existing `/internal/channels` DTOs/schemas are unchanged and do not include push fields.
- [ ] Query keys are token-free and support invalidating mobile push channel preference data.
- [ ] Infinite query defaults to monitored channels, page size `25`, active-config gating, previous-data placeholder behavior, and conservative retry.
- [ ] Mutation handles offline/config guards, invalidates channel preferences and mobile push status, and rolls back any optimistic update on failure.
- [ ] Channels list shows only passive preference badge/status when available and no active push controls.
- [ ] Channel Detail shows push controls only for monitored channels and disables/hides them correctly for offline, pending mutation, unavailable global/registration status, or monitoring disabled.
- [ ] Error copy is implemented:
  - `401`: existing auth/config banner path.
  - `404`: “Channel no longer exists. Refreshing channel data.” and refetch.
  - `409`: “This channel is not currently monitored, so push preferences cannot be changed.” and refetch.
  - `422`: friendly backend contract mismatch/invalid request copy.
  - Offline: controls disabled while cached state remains visible.
- [ ] Tests cover API/schema GET/PATCH behavior, exact snake_case body, hook gating/pagination/cache behavior, list badge behavior, detail visibility/toggle/offline/error states, and `/internal/channels` regression.

## Tests and Verification

- API/schema tests for GET/PATCH and exact snake_case PATCH body.
- Hook tests for enabled/disabled config state, pagination, no token in keys, mutation invalidation, and optimistic rollback if implemented.
- `ChannelsScreen` tests for list badge/status and absence of active push controls in the list.
- `ChannelDetailScreen` tests for monitored switch visibility/toggle, unmonitored hidden/disabled copy, offline disabled state, and `409`/`404` error copy.
- Regression test confirming `/internal/channels` DTO/schema is not modified with push fields.
- Verification commands for implementer: `npm run typecheck`, focused tests, and full `npm test`.
- Manual validation against mock/backend if available. Mock API may need a later Phase E update for local manual testing stubs, but do not include mock server implementation unless explicitly requested.

## Out of Scope

- Modifying product code outside Phase E implementation needs.
- Adding push fields to existing `/internal/channels` responses or `Channel` DTOs.
- Notification tap handling; reserved for Phase F.
- Quiet hours.
- Moving test notification controls out of Settings.
- Per-device channel preference UI; Phase E preferences are account/channel-level.
- Mock server implementation unless explicitly requested later.
