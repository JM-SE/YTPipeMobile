# Mobile Phase 0 Foundations Implementation Specification

## Context

Phase 0 establishes the Expo mobile application foundation only. The repo currently has no `package.json` or Expo scaffold, and prior implementation specs are superseded by this phase-specific specification. Product decisions for phases 0-7 are closed; phases 8/9 are deferred.

The MVP uses Expo + TypeScript, React Navigation direct routing, and a config-gated root flow. Primary bottom tabs are Dashboard, Channels, and Activity only. Settings is reached from a header/app-shell action. There is no standalone Actions tab; manual actions are embedded in Dashboard in Phase 5.

## Requirements

- [ ] Scaffold an Expo TypeScript app in the repo root using current Expo-compatible defaults.
- [ ] Do not use Expo Router for the MVP; if a template includes router setup, remove or avoid it and use React Navigation directly.
- [ ] Add or verify Expo-compatible dependencies for Phase 0 and upcoming MVP work:
  - React Navigation core/native-stack/bottom-tabs plus Expo/RN-required peer dependencies.
  - TanStack Query.
  - Expo SecureStore and AsyncStorage.
  - React Hook Form, Zod, and `@hookform/resolvers`.
  - `date-fns`.
  - Jest Expo test setup and React Native Testing Library.
- [ ] Establish a pragmatic `src/` structure for app composition, navigation, screens, components, theme, config, storage, API, hooks, types, and tests.
- [ ] Centralize root provider composition for safe area, navigation, TanStack Query, config state, and theme as appropriate for the chosen Expo scaffold.
- [ ] Implement placeholder navigation and screens only; do not implement real API calls, real Settings validation/storage, Dashboard data, Channels data, Activity data, or manual action execution.
- [ ] Implement config-gating as a replaceable abstraction without hardcoded secrets or real token handling.
- [ ] Configure a minimal Jest + React Native Testing Library harness with smoke coverage for the shell, gating, or placeholder screens.

## Technical Approach

Use the Expo-managed TypeScript baseline and keep Phase 0 focused on structure, navigation, providers, placeholder UI, and testability. Dependency versions should follow Expo compatibility guidance rather than arbitrary latest versions.

Proposed `src/` structure:

```text
src/
  app/                # Root composition/providers if not kept directly in App.tsx
  navigation/         # Root flow, setup stack, app tabs, screen params
  screens/            # Welcome, Settings placeholder, Dashboard, Channels, Activity
  components/         # Shared primitive UI/app-shell pieces
  theme/              # Colors, spacing, typography constants
  config/             # Config status provider/interface abstraction
  storage/            # Storage boundaries/placeholders for later phases
  api/                # API client boundaries/placeholders for later phases
  hooks/              # Shared hooks
  types/              # Shared TypeScript types
  test/ or __tests__/ # Test utilities/smoke tests
```

Root composition should remain clean and centralized. Expected provider order is conceptually: SafeArea provider, TanStack Query client provider, config status provider, theme context/constants if introduced, and `NavigationContainer`. Exact placement may vary by the Expo template, but app bootstrapping should avoid scattering provider setup through screens.

Navigation architecture:

- Root flow gates between setup/welcome flow and main app shell based on a minimal config status abstraction.
- Setup stack includes `Welcome` and a `Settings` placeholder/entry screen for Phase 1.
- Main app shell uses bottom tabs for `Dashboard`, `Channels`, and `Activity` only.
- `Settings` is accessible from a header/app-shell action as a placeholder until Phase 1.
- Placeholder screens use pure React Native primitives and simple YTPipe branding.

Config-gating should be abstraction-first. Define a minimal provider/interface such as `unknown | missing | present` or equivalent that Phase 1 can replace/expand with real secure storage and authenticated status testing. Do not hardcode real tokens, request or store `INTERNAL_API_BEARER_TOKEN`, or implement real Save/Test behavior in Phase 0. If a temporary development/test mechanism is needed to view the app shell, it must be clearly marked temporary, avoid secrets, and be easy to remove.

Theme/branding should use simple constants for colors, spacing, and text styles where useful. Prefer pure React Native primitives initially and avoid introducing a component framework in Phase 0.

## Implementation Steps

1. Scaffold the Expo TypeScript app at the repo root using current Expo-compatible defaults.
2. Remove or bypass any Expo Router artifacts if generated, ensuring the app starts from direct React Navigation composition.
3. Install and verify dependencies listed in Requirements, using Expo-compatible versions and peer dependency guidance.
4. Create the `src/` folder structure and minimal TypeScript path/import conventions supported by the scaffold.
5. Implement centralized app root/provider composition with Safe Area, TanStack Query, config status, theme constants, and React Navigation.
6. Implement the root gated navigation flow, setup stack, bottom tab app shell, and Settings header/app-shell action.
7. Add placeholder screens for Welcome, Settings, Dashboard, Channels, and Activity with pure RN primitives and simple YTPipe branding.
8. Add minimal config status provider/interface with no real secret handling, persistence, Save/Test, or API calls.
9. Configure Jest Expo and React Native Testing Library.
10. Add minimum smoke tests for app render/navigation shell/config gating or a representative placeholder screen.
11. Verify Expo startup, TypeScript/build checks, and tests using the scripts generated or added by the scaffold.

## Acceptance Criteria

- [ ] The Expo app starts successfully from the repo root using generated package scripts.
- [ ] TypeScript checks/builds and Jest tests pass using appropriate generated or added scripts.
- [ ] The project uses React Navigation directly and contains no active Expo Router route setup.
- [ ] Root flow is gated by a replaceable config status abstraction.
- [ ] Setup flow includes Welcome and Settings placeholder/entry screen.
- [ ] Main app bottom tabs are exactly Dashboard, Channels, and Activity.
- [ ] Settings is reachable via header/app-shell action, not as a primary bottom tab.
- [ ] There is no standalone Actions tab.
- [ ] Placeholder screens use pure React Native primitives with simple YTPipe branding.
- [ ] No real API calls, real settings validation/storage, dashboard data, channel data, activity data, or manual action execution is implemented.
- [ ] No hardcoded tokens or requests/storage for `INTERNAL_API_BEARER_TOKEN` exist.
- [ ] Test harness includes at least one smoke test covering app/navigation shell/config gating or placeholder rendering.
- [ ] Handoff is clear that Phase 1 replaces Settings placeholders with real validation/storage and authenticated `/status` Save/Test behavior.
