# Mobile Phase 0 Product Foundations Specification

## Phase

0. Foundations and bootstrap.

## Product Goal

Establish the first-run experience and navigation foundation for a personal YTPipe admin companion app while keeping the app useful for learning React Native fundamentals.

## Product Decisions

- First launch without configuration shows a short welcome/onboarding entry point before setup.
- After configuration, the main app uses bottom tabs.
- Initial UI uses pure React Native primitives with simple YTPipe branding.
- Enterprise-style patterns should be visible but lightweight: providers, typed boundaries, folder conventions, and a minimal test harness.
- React Navigation is used directly for learning; Expo Router remains deferred.

## First-Run Experience

When the app has no saved backend configuration, the user should see a welcome/setup flow instead of the main app shell.

The welcome screen should:

- Explain that this is a personal/admin companion app for YTPipe.
- Explain that backend URL and mobile API token are required.
- Link users into setup/settings.
- Avoid mentioning or requesting the internal automation token.

## Main Navigation Shape

After required configuration exists, the app should present bottom tabs for the core MVP areas:

- Dashboard
- Channels
- Activity

Sync/Poll manual actions are embedded in the Dashboard in Phase 5 and are not a primary bottom tab.

Settings should remain reachable from the app through a header/app-shell action, but it is not a primary bottom tab for the MVP.

## Branding And UI Direction

The initial product should have simple, consistent branding without adopting a component library yet.

Minimum branding includes:

- App name: YTPipe Mobile.
- Basic color palette suitable for operational/admin screens.
- Reusable spacing/text styles where useful.
- Clear empty/loading/error states as phases introduce real data.

React Native Paper remains a future evaluation option after the core flows exist.

## Learning Goals

Phase 0 should expose these learning concepts clearly:

- React Native app structure.
- React Navigation container, stack navigation, and bottom tabs.
- Provider composition at the app root.
- Config-gated navigation.
- Basic screen/component testing.
- TypeScript-first project organization.

## Out Of Scope

- Real API calls beyond placeholders; settings/API details are refined in Phase 1 and Phase 2.
- Dashboard data presentation; refined in Phase 3.
- Channel management, manual actions, activity history, push notifications, and Expo Router migration.

## Product Acceptance Criteria

- A new user understands that the app requires YTPipe backend configuration before use.
- The configured app presents Dashboard, Channels, and Activity as the only primary bottom tabs.
- The configured app does not include a standalone Actions tab.
- The app has a simple recognizable YTPipe identity without adding a UI component library.
- The foundation teaches React Navigation directly rather than hiding navigation behind Expo Router.
- The phase creates enough structure for future implementation specs without over-designing product behavior.

## Open Questions For Later Phases

- Whether Settings should become a dedicated tab after the MVP grows.
- Whether a future dedicated admin/actions destination is needed after MVP.
- Whether React Native Paper should be adopted after the first full vertical slice.
