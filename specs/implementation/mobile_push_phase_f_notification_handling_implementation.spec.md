# Mobile Push Phase F Notification Handling Implementation Specification

## Context

YTPipeMobile is a React Native/Expo TypeScript app. Phase D added push settings, registration, test push support, `expo-notifications`, `src/notifications/pushRegistration.ts`, `src/storage/pushInstallationStorage.ts`, Settings UI, and push status/test/register APIs. Phase E added per-channel push preferences using the dedicated endpoint, Channels list badges, and a Channel Detail push switch.

`specs/mobile_push_rn_handoff.spec.md` is the definitive backend contract. `specs/implementation/mobile_push_notifications_implementation.spec.md` contains the Phase F summary. Phase F adds client-side notification tap handling only: new-video pushes open Activity and refetch activity; test pushes open Settings and refresh diagnostics where practical.

Existing navigation and query context:
- `App.tsx` wraps `NavigationContainer` around `RootNavigator`; `QueryClient` is currently local in `App.tsx`.
- `AppTabsParamList` includes `Dashboard`, `Channels`, and `Activity`.
- `AppStackParamList` currently includes `MainTabs: undefined`, `Settings: undefined`, and `ChannelDetail: { channel: Channel }`.
- `ActivityScreen` uses `useActivityQuery`, backed by `queryKeys.activityInfinite(baseUrl, status)`, and already handles loading, empty, error, and stale states.
- `src/api/queryKeys.ts` has `queryKeys.isActivity`, `QUERY_ROOT.activity`, and mobile push query keys from Phase D.
- `expo-notifications` is installed and mocked in `jest.setup.ts`.

## Requirements

- [ ] Preserve supported push payload contracts:
  - New video: `{ type: 'new_video', activity_id, delivery_id, video_id, channel_id, sent_at }`
  - Test: `{ type: 'test', sent_at }`
- [ ] Treat IDs as optional navigation context only; do not require them to navigate.
- [ ] On new-video notification tap, navigate to the Activity tab and invalidate/refetch all Activity queries.
- [ ] On test notification tap, navigate to Settings and invalidate mobile push status/diagnostic queries where practical.
- [ ] Do not deep-link to video, channel, or activity detail screens in this phase.
- [ ] Handle cold start, warm/background, and runtime notification responses.
- [ ] If navigation is not ready, queue the action briefly in memory and flush when navigation becomes ready; do not persist queued notification actions.
- [ ] Unknown or malformed payloads must no-op and never crash.
- [ ] Payloads and logs must never expose bearer tokens, internal tokens, provider credentials, raw Expo tokens, internal URLs, stack traces, or sensitive diagnostics.
- [ ] Foreground notification behavior must use a minimal Expo SDK 54-compatible handler that allows alert/banner/sound according to installed `expo-notifications` typings.

## Technical Approach

### Files/Modules to Create or Modify

- Create `src/notifications/pushNotificationPayloads.ts`
  - Export a const object for payload type names, e.g. `new_video` and `test`.
  - Export type guards/parsers that accept `unknown` and return a narrow parsed result or `null`/`undefined`.
  - Accept optional numeric or string IDs as context only.
  - Validate `type` and tolerate absent optional IDs.
  - Avoid logging raw payload values.
- Create `src/notifications/PushNotificationHandler.tsx`
  - Root component mounted under `QueryClientProvider` and inside/near navigation setup.
  - Registers notification response listeners once and cleans up subscriptions on unmount.
  - Handles `Notifications.getLastNotificationResponseAsync()` once on mount.
  - Handles `Notifications.addNotificationResponseReceivedListener()` for runtime responses.
  - Unknown/malformed payloads no-op.
- Create `src/navigation/navigationRef.ts` or equivalent
  - Export a typed navigation ref and helper functions for notification navigation.
  - Support queued in-memory actions while navigation is not ready.
  - Provide a flush hook/helper for `NavigationContainer.onReady`.
- Modify `App.tsx`
  - Pass the typed navigation ref to `NavigationContainer`.
  - Flush queued navigation actions from `onReady`.
  - Mount `PushNotificationHandler` under `QueryClientProvider` so it can use `useQueryClient`.
  - Keep the existing app structure otherwise unchanged.
- Modify navigation types where needed
  - Update `AppStackParamList.MainTabs` to support nested tab navigation, likely `NavigatorScreenParams<AppTabsParamList>`.
  - Navigate to Activity via root stack `MainTabs` with nested screen `Activity`, or an equivalent React Navigation-supported approach.
- Modify or create a notification foreground handler module if needed
  - Configure `Notifications.setNotificationHandler` once from a dedicated module or root effect.
  - Use installed Expo SDK 54 typings for exact handler keys, keeping behavior minimal and platform-safe.

### Navigation Plan

- Add a typed navigation ref based on the root stack param list.
- Implement helpers such as `navigateToActivityFromNotification()` and `navigateToSettingsFromNotification()`.
- For new-video taps, navigate to `MainTabs` with nested `Activity` screen.
- For test taps, navigate to `Settings`.
- If `navigationRef.isReady()` is false, enqueue a short-lived in-memory action and execute it from `NavigationContainer.onReady`.
- Do not store notification actions in AsyncStorage or any persistent queue.

### Query Invalidation Plan

- Prefer implementing `PushNotificationHandler` as a component under `QueryClientProvider` and using `useQueryClient()` to avoid exporting a mutable singleton.
- If component placement makes that impractical, an exported app `QueryClient` singleton may be introduced only if `App.tsx` and the handler use the same instance consistently.
- For parsed `new_video` taps, call `queryClient.invalidateQueries({ predicate: queryKeys.isActivity })` or the project’s equivalent predicate-based invalidation API.
- For parsed `test` taps, invalidate `queryKeys.isMobilePush` or the narrowest available mobile push status query predicate/key so Settings diagnostics refresh.
- Do not refactor `ActivityScreen` query behavior beyond what notification invalidation requires.

### Notification Parser Plan

- Parse notification response data from `response.notification.request.content.data` as `unknown`.
- Supported parsed outcomes:
  - `new_video`: requires `type === 'new_video'`; accepts optional `activity_id`, `delivery_id`, `video_id`, `channel_id`, and `sent_at` when they are strings or numbers where applicable.
  - `test`: requires `type === 'test'`; accepts optional `sent_at`.
  - unknown/malformed: returns no parsed action and no-ops.
- Do not log raw payload objects or values. If logging is necessary for development, log only a static message and parsed payload type.

### Handler Plan

- Configure foreground notification handling once using Expo’s default/simple handler semantics that allow alert/banner/sound according to Expo SDK 54 APIs. Implementer must follow the installed `expo-notifications` typings if exact keys differ.
- `PushNotificationHandler` should:
  - Register listeners exactly once for the component lifecycle.
  - Await and handle `getLastNotificationResponseAsync()` once on mount for cold-start/last-response behavior.
  - Register `addNotificationResponseReceivedListener()` for warm/background/runtime taps.
  - Clean up notification subscriptions on unmount.
  - Parse payloads through `pushNotificationPayloads.ts` only.
  - For `new_video`, invalidate Activity queries then navigate to Activity, or navigate then invalidate; both are acceptable if tests verify both effects.
  - For `test`, navigate to Settings and invalidate mobile push status where practical.
  - For unknown/malformed payloads, do nothing and do not throw.

## Implementation Steps

1. Add notification payload constants and safe parser/type guard utilities in `src/notifications/pushNotificationPayloads.ts`.
2. Add a typed navigation ref/helper module in `src/navigation/navigationRef.ts` with Activity and Settings navigation helpers plus in-memory queue/flush support.
3. Update navigation param types so `MainTabs` supports nested tab navigation to `Activity`.
4. Add `src/notifications/PushNotificationHandler.tsx` using `useQueryClient`, Expo notification response APIs, parser utilities, navigation helpers, and cleanup on unmount.
5. Configure the foreground notification handler once in a dedicated module or root effect using installed `expo-notifications` typings.
6. Update `App.tsx` to pass the navigation ref to `NavigationContainer`, flush pending actions on ready, and mount `PushNotificationHandler` under `QueryClientProvider`.
7. Add focused tests for parser behavior, notification response handling, query invalidation, and navigation helper behavior where practical.
8. Run verification commands and perform manual Android validation later during Phase G.

## Acceptance Criteria

- [ ] Valid `new_video` notification taps from cold start or runtime open the Activity tab.
- [ ] Valid `new_video` notification taps invalidate/refetch all Activity queries using `queryKeys.isActivity`.
- [ ] Valid `test` notification taps open Settings.
- [ ] Valid `test` notification taps invalidate mobile push status/diagnostic queries when the relevant query key/predicate exists.
- [ ] Unknown, malformed, or missing payload data produces no navigation, no invalidation, and no crash.
- [ ] Notification response listeners are registered once and cleaned up on unmount.
- [ ] Last notification response is handled once on handler mount.
- [ ] Navigation actions received before navigation readiness are queued in memory and flushed when ready.
- [ ] No raw payload values or sensitive data are logged.
- [ ] Foreground notifications continue to show alert/banner/sound according to Expo SDK 54-supported handler keys.
- [ ] Existing Activity UI states and tests do not require broad rewrites.

## Tests

- Payload parser tests:
  - valid `new_video` payload with all IDs parses successfully;
  - valid `new_video` payload with omitted optional IDs still parses;
  - valid `test` payload parses successfully;
  - unknown `type`, non-object data, malformed fields, and missing data no-op without throwing.
- Handler tests with mocked `expo-notifications`, navigation helper/ref, and QueryClient:
  - runtime `new_video` tap opens Activity and invalidates Activity queries;
  - cold-start/last-response `new_video` tap opens Activity and invalidates Activity queries;
  - `test` tap opens Settings and invalidates mobile push status/diagnostic queries;
  - unknown/malformed payload no-ops;
  - listener subscription cleanup is called on unmount.
- Navigation helper/type tests where practical:
  - Activity helper uses the supported nested `MainTabs` → `Activity` navigation shape;
  - queued action flushes after navigation readiness.

## Verification

- [ ] Run `npm run typecheck`.
- [ ] Run focused notification parser/handler tests.
- [ ] Run full `npm test`.
- [ ] Defer real-device Android validation with actual test and new-video pushes to Phase G.

## Out of Scope

- Phase G staging/device validation.
- Deep links to video, channel, or activity detail screens.
- Notification preference changes.
- Background data fetch.
- Custom in-app notification center.
- Receipt dashboard.
- New backend endpoints.
- Mock server changes unless separately requested.
