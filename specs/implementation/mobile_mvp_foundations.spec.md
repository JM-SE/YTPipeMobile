# Mobile MVP Foundations Specification

## Context

The repository is ready for a new personal Expo React Native app but has not been bootstrapped. The app should use selected MVP libraries while preserving React Native fundamentals and matching the existing YTPipe mobile API contract.

## Requirements

- [ ] Bootstrap an Expo app with TypeScript.
- [ ] Install MVP libraries: React Navigation, TanStack Query, Expo SecureStore, AsyncStorage, React Hook Form, Zod, date-fns, Jest, and React Native Testing Library.
- [ ] Establish a practical folder structure for screens, navigation, API, storage, components, hooks, and tests.
- [ ] Create a React Navigation shell without Expo Router.
- [ ] Gate API-facing screens behind required config presence.
- [ ] Add a minimal testing harness skeleton.

## Technical Approach

Use Expo TypeScript as the app baseline. Keep navigation explicit with React Navigation root stacks/tabs. Add a config-gated root navigator that routes users to settings/setup when required configuration is missing, and to the app shell when valid configuration exists. Keep initial UI on pure React Native primitives.

## Implementation Steps

1. Bootstrap the Expo TypeScript project in the repository.
2. Add dependencies for navigation, server state, secure/local storage, forms/validation, dates, and tests.
3. Create source folders for `api`, `components`, `hooks`, `navigation`, `screens`, `storage`, and `test` utilities.
4. Create root providers for navigation and TanStack Query.
5. Create placeholder screens for Settings and Dashboard.
6. Implement config-gated root navigation using stored config presence only; detailed validation belongs to the settings phase.
7. Add one smoke component/screen test proving the test harness works.

## Acceptance Criteria

- [ ] The app starts in Expo with TypeScript enabled.
- [ ] Navigation uses React Navigation directly, not Expo Router.
- [ ] Users without required config are routed to setup/settings.
- [ ] Users with required config can reach the app shell/dashboard placeholder.
- [ ] TanStack Query provider is present at the app root.
- [ ] Test tooling can run a minimal React Native Testing Library smoke test.
- [ ] No product code contains real API tokens or `INTERNAL_API_BEARER_TOKEN` values.
