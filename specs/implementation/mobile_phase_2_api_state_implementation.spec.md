# Mobile Phase 2 API State Implementation Specification

## Context

Product source: `specs/mobile_phase_2_api_state_product.spec.md`.

Backend/mobile API contract source: `specs/mobile_api_contract_for_rn.spec.md`.

The app is Expo SDK 54 / React Native 0.81 / React 19 / TypeScript. TanStack Query is already installed and `QueryClientProvider` already exists in `App.tsx`.

Phase 1 implemented persistent config and Settings Save/Test. `ConfigStatusContext` exposes active `config` with `apiBaseUrl` and `mobileApiToken`, plus `activateConfig`, `clearConfig`, and `reloadConfig`. Phase 2 must introduce shared API state/client infrastructure and a small Dashboard connection diagnostic card using `/status`; it must not implement the full Dashboard Phase 3 experience.

Dev mock server: `npm run mock:api`, token `dev-mobile-token`, Android emulator URL `http://10.0.2.2:4000`.

## Requirements

- [ ] Create shared API DTO types, error mapping, fetch client, endpoint functions, query keys, and `/status` query hook.
- [ ] Implement client functions for all current mobile API contract endpoints now, even though Phase 2 UI only consumes `/status`.
- [ ] Use active mobile config for protected requests: append endpoint paths to `apiBaseUrl` and send `Authorization: Bearer <mobileApiToken>`.
- [ ] Never use, expose, log, or persist backend internal tokens in the mobile client.
- [ ] Replace duplicated Settings Save/Test fetch/error behavior with the shared API client or a thin wrapper delegating to it.
- [ ] Add a small Dashboard connection/API diagnostic card in `DashboardScreen.tsx`.
- [ ] Auto-refresh `/status` every 30 seconds when the query is enabled and the screen/app state is relevant/visible.
- [ ] Hide technical error details by default behind an expandable `Show details` control.
- [ ] Keep TypeScript DTOs only for Phase 2 response typing; do not add Zod response validation.
- [ ] Add client, endpoint, hook, Dashboard diagnostic, and updated Settings tests.
- [ ] Do not implement full Dashboard Phase 3 cards, Channels UI, Activity UI, manual Sync/Poll execution, offline-first behavior, backend changes, Expo Router, or new dependencies unless specifically justified.

## Technical Approach

Recommended files/modules to create or update:

- Create `src/api/types.ts`
  - Central DTO definitions separated from hooks/UI.
  - Include DTOs and supporting types for:
    - `StatusResponse` / status readiness/environment fields per contract.
    - `Channel`, channel monitoring state, and monitoring update payload/response.
    - `LatestDetectedVideo`.
    - `Activity` / activity event DTOs.
    - Pagination request/response metadata.
    - `SyncResult` and `PollResult`.
    - Monitoring/status filters and activity filters.
- Create `src/api/errors.ts`
  - Define `ApiError` and `ApiErrorKind` or equivalent.
  - Preserve:
    - friendly user-facing message,
    - HTTP status when present,
    - machine/detail fields from the API when safe,
    - technical details for hidden diagnostic UI.
  - Error details/messages must never include `mobileApiToken`, Authorization header values, or full sensitive request metadata.
  - Recommended kinds: `auth`, `notFound`, `validation`, `server`, `network`, `timeout`, `parse`, `unknown`.
- Create `src/api/client.ts`
  - Implement a fetch wrapper that accepts active config explicitly or through a small `ApiClientConfig` object.
  - Responsibilities:
    - normalize and append paths to `apiBaseUrl`, avoiding duplicate/missing slashes,
    - add `Authorization: Bearer <mobileApiToken>` for protected requests,
    - support JSON request bodies,
    - support query params, including arrays/booleans/numbers where needed by the contract,
    - parse JSON responses and tolerate empty bodies where contract allows,
    - enforce a request timeout,
    - map HTTP, network, timeout, and parse failures to `ApiError`,
    - sanitize tokens from all thrown messages/details.
- Create `src/api/mobileApi.ts`
  - Endpoint functions backed by `client.ts`:
    - `getStatus(config)` for `/status`,
    - `getChannels(config, filters/pagination)`,
    - `updateChannelMonitoring(config, channelId, payload)`,
    - `syncSubscriptions(config, payload?)`,
    - `runPoll(config, payload?)`,
    - `getActivity(config, filters/pagination)`.
  - Function names may vary, but coverage must match the mobile API contract.
- Create `src/api/queryKeys.ts`
  - Stable TanStack Query key factory.
  - Include config identity/base URL component in keys to prevent cache leakage across configs.
  - Do not include raw `mobileApiToken` in query keys; use a non-sensitive identity such as normalized base URL plus a token presence/version marker if needed.
- Create `src/api/useStatusQuery.ts` or `src/hooks/useStatusQuery.ts`
  - Uses `ConfigStatusContext` and `getStatus`.
  - Query is enabled only when active config is present.
  - `refetchInterval`: exactly `30_000` ms when visible/relevant.
  - Conservative retry policy:
    - retry count: max `1` for network, timeout, and 5xx/server errors,
    - no retry for 401, 404, 422, validation/client errors.
  - Preserve previous data so a failed refetch can show stale data plus warning.
- Optional create `src/components/ConnectionDiagnosticCard.tsx` or `src/components/ApiStateMessage.tsx`
  - Reusable loading/error/stale/success UI for API state.
  - Must keep technical details hidden until expanded.
- Update `src/api/statusTestClient.ts`
  - Replace implementation with shared API client/status endpoint behavior, or keep as a thin `testStatusConnection` compatibility wrapper delegating to `getStatus`.
  - Avoid duplicate fetch/error mapping.
- Update `src/screens/settings/useSettingsController.ts`
  - Continue Save/Test behavior, but call the shared status/API client path.
  - Keep existing user-facing Settings behavior unless product spec says otherwise.
- Update `src/screens/DashboardScreen.tsx`
  - Replace placeholder with a small connection/API diagnostic card.
  - Do not add Phase 3 dashboard cards.
- Tests to add/update under existing `src/test/` structure.

Dashboard diagnostic UI requirements:

- Shows loading state for initial `/status` request.
- Shows success state when reachable/authenticated, with compact environment and readiness indicators.
- Shows stale warning when a refetch fails but previous status data remains available.
- Shows error state when no data is available.
- Provides a retry button wired to query refetch.
- For 401/auth errors, shows guidance to verify API base URL/token and navigate/check Settings if practical; do not automatically clear config.
- Technical details are hidden by default behind `Show details` / `Hide details`.
- Manual Sync/Poll controls remain Phase 5 placeholders only; do not execute sync or poll in Phase 2.

Phase 1 integration requirements:

- Settings Save/Test and Dashboard diagnostic must share API client/error behavior.
- On successful config activation/clear, the existing `queryClient.clear()` behavior remains acceptable.
- If replacing `queryClient.clear()` with targeted invalidation/removal, ensure no data from an old config can remain current or visible for the new config.

## Implementation Steps

1. Review `specs/mobile_phase_2_api_state_product.spec.md` and `specs/mobile_api_contract_for_rn.spec.md` for exact endpoint paths, DTO fields, payloads, and response shapes.
2. Add `src/api/types.ts` with central TypeScript DTOs for all mobile API contract endpoints and shared pagination/filter types.
3. Add `src/api/errors.ts` with `ApiError`/`ApiErrorKind`, friendly messages, safe technical details, and token sanitization rules.
4. Add `src/api/client.ts` implementing URL construction, query params, auth header, JSON parsing, timeout handling, and sanitized error mapping.
5. Add `src/api/mobileApi.ts` endpoint functions for status, channels, monitoring update, subscription sync, poll, and activity.
6. Add `src/api/queryKeys.ts` with config-aware, token-safe query keys.
7. Add `src/api/useStatusQuery.ts` or `src/hooks/useStatusQuery.ts` using config context, 30 second refresh, enabled gating, previous data, and retry policy.
8. Refactor `src/api/statusTestClient.ts` and `src/screens/settings/useSettingsController.ts` so Settings Save/Test delegates to the shared status/client implementation.
9. Add optional reusable diagnostic component, then update `src/screens/DashboardScreen.tsx` to render the Phase 2 connection diagnostic card only.
10. Add/update tests for API client, endpoint functions, status query hook, Dashboard diagnostic UI, and Settings Save/Test behavior.
11. Verify with `npm run typecheck` and `npm test`.
12. Optionally verify manually with `npm run mock:api`, Android Settings URL `http://10.0.2.2:4000`, and token `dev-mobile-token`.

## Acceptance Criteria

- [ ] `src/api/types.ts` contains central DTOs for status, channels, latest detected videos, activity, pagination, sync, poll, and monitoring/status filters.
- [ ] `src/api/errors.ts` maps client/server/network/timeout/parse failures to friendly, typed API errors with safe technical details.
- [ ] API error messages/details and query keys do not include raw tokens or Authorization header values.
- [ ] `src/api/client.ts` correctly builds URLs, appends query params, sends bearer auth, parses JSON, handles timeout, and maps errors.
- [ ] `src/api/mobileApi.ts` exposes functions for every endpoint in the mobile API contract.
- [ ] Protected requests use only `mobileApiToken`; no internal token is introduced.
- [ ] Status query is disabled without active config and refreshes every 30 seconds when enabled and relevant/visible.
- [ ] Retry policy is max `1` retry for network/timeout/5xx and no retry for 401, 404, 422, validation/client errors.
- [ ] Settings Save/Test uses the shared client/status path rather than duplicate fetch/error mapping.
- [ ] Dashboard shows a small diagnostic card with loading, success, stale-with-previous-data warning, error-without-data, retry, and hidden technical details toggle.
- [ ] 401 UI provides auth/config guidance without deleting config automatically.
- [ ] Manual Sync/Poll execution, full Dashboard Phase 3 cards, Channels UI, Activity UI, and Zod response validation are not implemented in Phase 2.
- [ ] Tests cover auth header, URL building, query params, JSON parsing, 401, 422, 5xx, network, timeout, token sanitization, all endpoint functions, status hook enabling/retry/interval behavior, Dashboard diagnostic states, retry, details toggle, and updated Settings Save/Test behavior.
- [ ] `npm run typecheck` passes.
- [ ] `npm test` passes.
