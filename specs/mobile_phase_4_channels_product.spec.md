# Mobile Phase 4 Channels Product Specification

## Phase

Phase 4: Channels and monitoring controls.

## Product Goal

Allow the mobile user to review imported channel catalog entries, find channels by search/filter, and clearly control which channels are actively monitored for future polling, detection, and notifications.

## Product Decisions

- The default Channels view shows monitored channels.
- Channels are organized with segmented tabs: Monitored, Unmonitored, and All.
- Search uses debounced typing from the user's perspective.
- Monitoring changes use a direct switch with immediate feedback, loading/error handling, and no confirmation by default.
- The first time the user activates monitoring on a channel, show education explaining baseline/polling behavior.
- Channel item MVP includes title, monitored state badge/switch, and latest detected video when available.
- Phase 4 includes a simple channel detail screen.
- Post-toggle feedback is optimistic from the user's perspective; errors must be clear and reversible.
- Empty states must guide the user toward Sync subscriptions in the Dashboard Manual actions area when no imported channel data exists or when no monitored channels exist.

## Channels Screen UX

- Provide a Channels screen reachable from the app navigation.
- Show a list of channels matching the selected monitoring tab and search text.
- The Monitored tab is selected by default.
- Each visible row should make the channel title and monitoring state easy to scan.
- Tapping a channel row opens the channel detail screen.
- The screen should support manual refresh using the app's established refresh pattern.

## Search And Filtering

- Tabs map to backend monitoring filters:
  - Monitored: `monitoring=monitored`.
  - Unmonitored: `monitoring=unmonitored`.
  - All: `monitoring=all`.
- Search narrows the current tab using the backend `query` parameter.
- Search should feel responsive while avoiding a request for every keystroke.
- The implementation spec will define pagination strategy, debounce timing, mutation invalidation, and optimistic rollback details later.

## Monitoring Toggle UX

- A direct switch controls whether a channel is explicitly monitored.
- Enabling monitoring makes the channel eligible only for future polling/baseline workflow.
- Enabling monitoring must not be presented as sending notifications for old videos.
- Disabling monitoring removes the channel from future polling, detection, and notification eligibility.
- The user should see immediate visual feedback after toggling.
- While a toggle change is pending, the affected control should communicate progress and avoid confusing repeated changes.
- If the backend rejects or fails a toggle update, the UI must show a friendly error and make the resulting state clear.
- Technical detail may be revealed using the Phase 2 error-detail pattern.

## Baseline/Polling Education

- Show an educational modal the first time the user activates monitoring on a channel.
- The modal should explain:
  - Only explicitly monitored channels are polled, detected, and notified.
  - Non-monitored channels remain catalog entries that can be searched, listed, and activated later.
  - Activation affects future eligibility and does not imply notifications for older videos.
- The modal should not block future activations after the first acknowledgement unless a later phase changes this behavior.

## Channel Item And Detail UX

- Channel list item MVP includes:
  - Channel title.
  - Monitored/unmonitored state badge or equivalent label.
  - Monitoring switch.
  - Latest detected video information when it exists.
- Channel detail screen includes:
  - Channel title.
  - Current monitoring state and switch.
  - Latest detected video information when it exists.
  - Plain-language monitoring explanation for the selected channel.
- If latest detected video data is absent, use neutral copy rather than implying an error.

## Empty, Loading, And Error States

- Show clear loading states for initial screen load and list refresh.
- If stale channel data remains visible, show a warning consistent with Phase 2 behavior.
- Use friendly errors with an option to reveal technical detail.
- Use conservative retry behavior; do not aggressively repeat failed requests.
- Empty state examples:
  - No channels/imported data: explain that channels appear after subscription sync and guide the user toward Sync subscriptions in the Dashboard Manual actions area.
  - No monitored channels: explain that only monitored channels are eligible for future polling and guide the user to Unmonitored or All to activate channels.
  - No search results: suggest changing the search text or selected tab.

## Refresh And Cache Behavior

- The Channels screen should support refresh so the user can reconcile with backend state.
- Post-toggle UI should give immediate feedback and later reconcile with the backend response.
- Stale but usable channel data may remain visible with a warning.
- Dashboard Manual actions may guide users toward Sync/Poll affordances, but action execution remains Phase 5.

## Security Requirements

- Use only the mobile/admin bearer token authorized for `GET /internal/channels` and `PATCH /internal/channels/{channel_id}/monitoring`.
- Do not expose, request, store, or log internal-only bearer tokens.
- Do not show bearer tokens in error details, debug text, screenshots, or logs.
- Treat channel monitoring as an authenticated admin operation and avoid accidental unauthenticated calls.

## Out Of Scope

- Executing subscription sync or polling actions; this is Phase 5.
- Push notification registration or delivery behavior.
- Bulk monitoring changes.
- Advanced sorting, grouping, or channel analytics.
- Editing channel metadata.
- Defining exact components, files, hooks, pagination mechanics, debounce timing, mutation invalidation, or optimistic rollback implementation details.

## Product Acceptance Criteria

- [ ] Channels screen defaults to the Monitored tab.
- [ ] User can switch between Monitored, Unmonitored, and All channel tabs.
- [ ] User can search channels within the selected tab.
- [ ] User can open a simple channel detail screen from a channel item.
- [ ] Channel items show title, monitoring state, switch, and latest detected video when available.
- [ ] User can enable or disable monitoring with immediate feedback.
- [ ] First monitoring activation shows baseline/polling education before or during activation flow.
- [ ] Toggle failures show friendly, reversible, and clear error feedback.
- [ ] Empty states guide the user toward useful next steps, including Sync subscriptions in the Dashboard Manual actions area where relevant.
- [ ] Stale data, loading, refresh, and error states follow Phase 2 product behavior.
- [ ] Copy correctly states that only monitored channels are eligible for future polling/detection/notification.
- [ ] Copy correctly states that enabling monitoring does not notify old videos.
- [ ] Security requirements for bearer token usage are satisfied.

## Open Questions For Later Phases

- Should bulk activation/deactivation be added after MVP usage is validated?
- Should channel detail expand into activity history after Phase 6 data is available?
- Should Sync/Poll action shortcuts become contextual from empty states after Phase 5?
- Should users be able to permanently dismiss or revisit baseline/polling education?
