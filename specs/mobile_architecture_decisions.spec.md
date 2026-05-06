# Mobile Architecture Decisions Specification

## Expo + TypeScript Baseline

- Decision: Bootstrap the mobile app with Expo and TypeScript.
- Rationale: Expo reduces native setup overhead and TypeScript keeps API-facing code safer.
- Consequence: Native capabilities should prefer Expo-supported modules first.

## React Navigation Direct For MVP

- Decision: Use React Navigation directly instead of Expo Router for MVP.
- Rationale: The primary goal is to learn React Native fundamentals, including navigators, stacks, tabs, params, and screen composition.
- Future: Add an optional learning phase to compare or migrate to Expo Router after the MVP is stable.

## MVP Navigation Shape

- Decision: Use a React Navigation direct app shell with a config-gated root flow and bottom tabs for Dashboard, Channels, and Activity.
- Decision: Settings is reachable through a header/app-shell action, not as a primary bottom tab.
- Decision: Manual actions are embedded in the Dashboard Manual actions section; MVP has no standalone Actions tab.
- Deferred: Expo Router remains deferred to a later comparison/migration phase.

## TanStack Query For Server State

- Decision: Use TanStack Query for backend server state, caching, refetching, loading states, errors, and mutations.
- Rationale: YTPipe data is remote operational state and should not be duplicated into Zustand or ad hoc local stores.
- Consequence: Local storage/state is limited to app configuration, preferences, and transient UI state.

## Storage Split

- Decision: Store `mobileApiToken` in Expo SecureStore and non-sensitive settings/preferences such as `apiBaseUrl` in AsyncStorage.
- Rationale: The bearer token is sensitive; base URL and display preferences are not secret.
- Consequence: Token rotation requires updating app settings; missing config gates API screens.

## Settings Validation

- Decision: Use React Hook Form + Zod for settings/config validation.
- Rationale: Settings inputs need clear validation and user-facing errors.
- Future: Consider Zod response validation during hardening for high-risk API payloads.

## UI Library

- Decision: Use pure React Native primitives initially.
- Rationale: This supports learning fundamentals and avoids premature design-system dependency.
- Future: Evaluate React Native Paper after core flows are working.

## Tab Bar Icon Strategy (Temporary vs Enterprise)

- Current MVP Decision: Keep bottom tabs label-only temporarily to avoid instability from the observed `@expo/vector-icons` / Metro module-resolution issue.
- Reason: The immediate priority is a stable Phase 3 build and predictable local/dev behavior.
- Follow-up: Replace this temporary fallback with an enterprise-quality icon strategy using the dedicated design and implementation specs.
- References:
  - `specs/mobile_tab_icons_design.spec.md`
  - `specs/implementation/mobile_tab_icons_implementation.spec.md`

## Testing Tooling

- Decision: Use Jest + React Native Testing Library for unit/component tests.
- Rationale: These tools cover core component behavior and screen state without requiring full device automation.
- Deferred: Maestro, Sentry, advanced analytics, and deeper enterprise tooling.

## Push Notifications

- Decision: Treat push notifications as planned future scope, not MVP.
- Rationale: The current backend contract has no push support or device-token registration endpoint.
- Consequence: Roadmap specs must define prerequisites before implementation assumptions.

## Security Model

- Decision: The mobile app uses only the mobile/admin bearer token for a personal single-user API.
- Rationale: There is no public multi-user auth model, mobile OAuth, or account system.
- Requirement: Never hardcode, store, log, or expose `INTERNAL_API_BEARER_TOKEN` in the mobile app.
