# Mobile Settings And API Client Specification

## Context

The mobile app needs safe runtime configuration for the YTPipe mobile/admin API. `apiBaseUrl` is non-sensitive, while `mobileApiToken` is sensitive and must be protected. API access must follow the backend contract and use TanStack Query for server state.

## Requirements

- [ ] Provide a Settings screen for `apiBaseUrl` and `mobileApiToken`.
- [ ] Validate settings with React Hook Form + Zod.
- [ ] Store `mobileApiToken` in Expo SecureStore.
- [ ] Store `apiBaseUrl` and non-sensitive preferences in AsyncStorage.
- [ ] Provide test calls for public `/health` and authenticated `/status`.
- [ ] Implement a shared API fetch wrapper with auth headers and error mapping.
- [ ] Provide a TanStack Query provider and endpoint query/mutation conventions.
- [ ] Never hardcode or request `INTERNAL_API_BEARER_TOKEN`.

## Technical Approach

Use a settings form with Zod validation for URL shape, required token, and basic trimming/normalization. Persist values only after successful validation. Use a shared `apiFetch` wrapper that builds URLs from `apiBaseUrl`, adds `Authorization: Bearer <mobileApiToken>` for protected endpoints, parses JSON safely, and maps HTTP/network errors into user-facing categories.

## Implementation Steps

1. Define a settings schema for `apiBaseUrl` and `mobileApiToken`.
2. Build the Settings screen with validation errors and save/reset actions.
3. Add storage helpers for SecureStore token access and AsyncStorage config access.
4. Implement `/health` test call without auth and `/status` test call with mobile token auth.
5. Implement `apiFetch` with base URL joining, JSON handling, auth injection, and typed errors.
6. Add TanStack Query hooks for health/status checks and establish retry/refetch defaults.
7. Surface missing config, invalid URL, unauthorized, network, and server errors clearly in UI.

## Acceptance Criteria

- [ ] Invalid URL input blocks save and shows a validation error.
- [ ] Missing `apiBaseUrl` or `mobileApiToken` routes the user to settings/setup before API screens.
- [ ] `/health` can be tested without a token.
- [ ] `/status` sends `Authorization: Bearer <mobileApiToken>`.
- [ ] A 401 response is shown as an authentication/configuration problem with guidance to update the token.
- [ ] Network/server errors are distinguishable from validation and authentication errors.
- [ ] `mobileApiToken` is stored only in SecureStore and is not logged or displayed after save.
- [ ] `apiBaseUrl` is stored in AsyncStorage.
- [ ] The app never hardcodes a real token and never uses `INTERNAL_API_BEARER_TOKEN`.
