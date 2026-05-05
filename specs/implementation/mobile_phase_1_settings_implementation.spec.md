# Mobile Phase 1 Settings Implementation Specification

## Context

Phase 1 replaces Phase 0 temporary in-memory configuration with persistent, secure backend configuration. The source product spec is `specs/mobile_phase_1_settings_product.spec.md`.

Current app evidence:
- Expo SDK 54 + TypeScript app exists.
- `src/config/ConfigStatusContext.tsx` currently stores temporary `status: 'missing' | 'present'`; upgrade/replace it with persistent config loading.
- `src/screens/SettingsScreen.tsx` is placeholder UI; replace it with the real settings form.
- `src/navigation/AppNavigator.tsx` exposes Settings from the header; `RootNavigator` gates by config status.
- Existing dependencies include React Hook Form, Zod 4, `@hookform/resolvers`, Expo SecureStore, AsyncStorage, TanStack Query, React Navigation, and Jest/RNTL.

## Requirements

- [ ] Store `mobileApiToken` only in Expo SecureStore; store `apiBaseUrl` and non-sensitive metadata only in AsyncStorage.
- [ ] Never request, store, display outside the password field, log, or send `INTERNAL_API_BEARER_TOKEN`.
- [ ] On startup, read local storage and show a loading/splash-like state while loading; if config is complete, enter app shell directly without calling `/status`; if incomplete, enter setup flow.
- [ ] Settings contains only `apiBaseUrl` and `mobileApiToken`, with token masked by default and editable via show/hide toggle.
- [ ] Validate HTTP/HTTPS URLs, including `localhost`, `127.0.0.1`, and Android Emulator `10.0.2.2`; trim input and normalize base URL by stripping trailing slashes.
- [ ] Save and Test must validate locally, call authenticated `GET ${apiBaseUrl}/status`, and persist/activate config only after success.
- [ ] After successful Save and Test, activate config and return to app shell/Dashboard.
- [ ] Failed Save and Test must not activate or overwrite active config.
- [ ] Clear Config deletes saved base URL/token, clears active config status, clears/invalidates TanStack Query cache if available, and returns to setup flow.
- [ ] Settings helper text mentions `http://10.0.2.2:4000` for Android Emulator, `http://localhost:4000` for host/web, and token `dev-mobile-token` for local mock development.

## Technical Approach

Suggested files/modules:
- Update `src/config/ConfigStatusContext.tsx` or replace with a small config provider module exposing persistent config state.
- Add config storage helpers, e.g. `src/config/configStorage.ts`.
- Add config validation/schema helpers, e.g. `src/config/configSchema.ts`.
- Update `src/screens/SettingsScreen.tsx` for the RHF + Zod form.
- Update `src/navigation/RootNavigator.tsx`/`AppNavigator.tsx` only as needed for loading, setup/app-shell routing, and post-save navigation.
- Add/update Jest/RNTL tests for storage, validation, Settings behavior, and startup gating.

Storage keys and responsibilities:
- SecureStore key: `ytpipe.mobileApiToken` for the mobile bearer token only.
- AsyncStorage key: `ytpipe.apiBaseUrl` for normalized base URL.
- Optional AsyncStorage metadata key: `ytpipe.configMetadata` for non-sensitive fields such as `lastValidatedAt` or environment/readiness summary from `/status`.

Config provider shape:
- State should support `loading`, `missing`, `present`, and optionally `error`.
- Expose active config as `{ apiBaseUrl, mobileApiToken }` only to code that needs authenticated requests; avoid logging provider state because it contains the token.
- Expose actions such as `reloadConfig()`, `activateConfig(config)`, and `clearConfig()`.

Save/Test flow:
- Use React Hook Form with Zod 4 resolver.
- Fields: `apiBaseUrl`, `mobileApiToken`.
- Normalize by trimming both fields and stripping trailing slashes from `apiBaseUrl` before testing/storing.
- Call `GET ${apiBaseUrl}/status` with `Authorization: Bearer <mobileApiToken>`.
- Use `AbortController` timeout, recommended 8-15 seconds.
- Treat 2xx with parseable JSON as success; store only after success, set active config, invalidate/clear relevant query cache, and navigate to Dashboard/app shell.
- On failure, keep previous active config unchanged unless this was first setup with no active config.

Error mapping:
- `401`: token/base URL authentication guidance; do not auto-delete config.
- Network/fetch failure: connectivity, emulator host mapping, backend unavailable, or sleeping guidance.
- Timeout: backend may be sleeping or unreachable; suggest retry.
- `422`: show validation/detail message if response includes detail.
- `502`/`503`/`504`: backend gateway/degraded/sleeping guidance.
- Non-2xx unexpected status: show status code and generic configuration/backend guidance.
- Invalid JSON on 2xx: show unexpected `/status` response guidance and do not save.

Out of scope:
- Phase 2 full API/server-state layer, query key strategy, Dashboard data, Channels, Activity, manual actions, push notifications, Expo Router migration, and backend changes.

## Implementation Steps

1. Add config schema/storage helpers with Zod validation, URL normalization, SecureStore token persistence, AsyncStorage base URL persistence, and clear helpers.
2. Upgrade the config provider to load local storage at startup, expose `loading/missing/present/error`, and gate setup/app shell from local completeness only.
3. Replace the placeholder Settings screen with the RHF + Zod form, password visibility toggle, dev helper copy, loading states, and success/error messages.
4. Implement Save and Test with authenticated `/status`, timeout handling, response/error mapping, persistence only on success, provider activation, query cache clear/invalidate, and Dashboard/app-shell navigation.
5. Implement Clear Config in Settings to remove SecureStore/AsyncStorage config, clear active provider state, clear/invalidate query cache, and return to setup flow.
6. Add focused tests for validation, storage, startup gating, Settings form behavior, Save/Test success/failure, and Clear Config with mocked `fetch`, SecureStore, and AsyncStorage.

## Acceptance Criteria

- [ ] First launch with no saved config routes to setup; launch with saved complete config enters app shell without calling `/status`.
- [ ] Settings loads saved base URL and token into editable fields; token is masked by default and can be shown/hidden.
- [ ] Invalid URLs/tokens show field-level errors and are not saved/activated.
- [ ] HTTP/HTTPS, `localhost`, `127.0.0.1`, and `10.0.2.2` URLs are accepted when syntactically valid.
- [ ] Save and Test sends `Authorization: Bearer <mobileApiToken>` to `/status`, never sends `INTERNAL_API_BEARER_TOKEN`, and never logs the token.
- [ ] Successful 2xx JSON `/status` stores token in SecureStore, base URL in AsyncStorage, marks config present, and returns to Dashboard/app shell.
- [ ] Failed `/status`, invalid JSON, timeout, network failure, or mapped error status does not activate a new config and shows actionable guidance.
- [ ] Clear Config removes stored config, clears active state/query cache as applicable, and returns to setup flow.
- [ ] Tests cover storage helpers, validation schema, Settings success/failure behavior, startup gating smoke, and Clear Config.
- [ ] Verification passes with typecheck and tests; manual check uses `npm run mock:api`, `http://10.0.2.2:4000` on Android Emulator or `http://localhost:4000` on host/web, and token `dev-mobile-token`.
