# Mobile App Phase Index Specification

## Goal

Build a personal Expo React Native companion app for the YTPipe mobile/admin API, focused on learning React Native fundamentals while safely managing single-user backend operations.

## Constraints

- Use Expo + TypeScript.
- Use React Navigation directly for MVP; Expo Router is deferred to a future comparison/migration phase.
- Use `MOBILE_API_BEARER_TOKEN` only; never store or expose `INTERNAL_API_BEARER_TOKEN` in the app.
- Store `mobileApiToken` in Expo SecureStore and non-sensitive preferences like `apiBaseUrl` in AsyncStorage.
- Use TanStack Query for server state; do not duplicate server data into local stores.
- Use pure React Native UI primitives initially; defer React Native Paper evaluation.
- MVP bottom tabs are Dashboard, Channels, and Activity only.
- Settings is reachable through a header/app-shell action, not a primary bottom tab.
- Manual actions are embedded in the Dashboard Manual actions section; there is no standalone Actions tab for MVP.
- Current backend contract has no push notification endpoints; push notifications are planned future scope requiring backend changes.

## Phases

0. **Foundations and bootstrap**: Bootstrap Expo TypeScript app, install selected libraries, create folder structure, navigation shell, config-gated root flow, and test harness skeleton.
1. **Settings and secure config**: Build settings screen, validate `apiBaseUrl` and `mobileApiToken`, persist settings securely, and support Save/Test using authenticated `/status` according to product Phase 1. No separate `/health` button appears in Settings.
2. **API client and server-state layer**: Implement fetch wrapper, auth headers, typed endpoint functions, error mapping, QueryClient provider, and query conventions.
3. **Dashboard MVP**: Display `/status` operational summaries for readiness, polling, email, quota, and channel counts with loading/error/refresh states, including non-executable Sync/Poll affordances/placeholders until Phase 5.
4. **Channels and monitoring controls**: List/search channels, filter monitoring state, and enable/disable monitoring according to backend contract rules.
5. **Manual actions**: Add direct-execution Sync subscriptions and Run poll actions in the Dashboard Manual actions section with no confirmation, mutation feedback, quota-blocked messaging, and post-action refreshes. No standalone Actions tab.
6. **Activity history**: Display detected uploads, notification/email activity, and relevant timestamps using date-fns.
7. **Testing and hardening**: Expand Jest + React Native Testing Library coverage, response validation where valuable, offline/error handling, accessibility, and security review.
8. **Push notifications foundation/integration**: Planned future work covering mobile permission/device token foundation and backend notification contracts once backend support exists.
9. **Expo Router comparison/migration learning phase**: Optional future learning phase to compare React Navigation direct usage with Expo Router patterns and migration tradeoffs.

## Risks

- Backend contract may evolve while app phases are implemented.
- Single-user bearer token auth requires careful storage and no accidental logging/exposure.
- Push notifications require backend endpoints and delivery semantics that do not exist yet.
- Expo Router migration may affect navigation structure if deferred too long.
- Staging fake email behavior may differ from future production email/push behavior.
