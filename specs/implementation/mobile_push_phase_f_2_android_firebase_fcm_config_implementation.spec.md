# Mobile Push Phase F.2 Android Firebase/FCM Config Implementation Specification

## Context

Phase F.1 restored Expo Go and Android development build compatibility. The Android development build now launches directly in the emulator, but push registration from Settings fails with the native error: `Default FirebaseApp is not initialized in this process com.ytpipe.mobile. Make sure to call FirebaseApp.initializeApp(Context) first`.

This indicates Android Firebase/FCM configuration is missing for `expo-notifications` in the development build. The current Android package is `com.ytpipe.mobile`.

## Requirements
- [ ] Configure Android development/native builds so `expo-notifications` can initialize Firebase/FCM and obtain an Expo push token.
- [ ] Add `android.googleServicesFile` to app config pointing to the chosen `google-services.json` path.
- [ ] Generate `google-services.json` from Firebase for Android package `com.ytpipe.mobile`.
- [ ] Do not commit real sensitive Firebase/service credentials if project policy treats the file as secret; if committed, confirm it contains only standard mobile client config and no server keys.
- [ ] Document the repository policy for `google-services.json` explicitly.
- [ ] Preserve the Expo Go smoke workflow and Phase F.1 guard.
- [ ] Rebuild the Android development build after adding config; a Metro-only restart is not sufficient.

## Technical Approach

1. Complete Firebase setup as a manual prerequisite:
   - Create or select the Firebase project for this app.
   - Add an Android app with package `com.ytpipe.mobile`.
   - Download the generated `google-services.json`.
2. Decide the file location:
   - Recommended default: repository root `./google-services.json`.
   - If repository policy prefers a non-root or environment-specific location, use a documented path such as `config/google-services.json`.
3. Update `app.json` Android config with `android.googleServicesFile` pointing to the selected file path.
4. Re-run the native build flow with `npm run android:dev-build` so the Firebase config is included in generated/native Android artifacts.
5. Test Settings push setup in the Android development build until the native Firebase initialization error is gone.
6. Treat any remaining `requested resource was not found (404)` error against the repo mock API as a separate backend/mock endpoint concern covered by Phase F.3.
7. If EAS is adopted later, document credential/config handling implications separately; EAS pipeline work is out of scope for this phase.

## Implementation Steps
1. Confirm Firebase project ownership and whether `google-services.json` may be committed under project policy.
2. Generate `google-services.json` for Android package `com.ytpipe.mobile`.
3. Place the file at the approved path.
4. Add `android.googleServicesFile` to the Expo app config.
5. Rebuild with `npm run android:dev-build`.
6. Launch the rebuilt development build and retry Settings push registration.
7. Capture verification evidence and note whether failures have advanced to token retrieval/backend behavior rather than Firebase initialization.

## Verification
- [ ] Run the Android development build after the config change using `npm run android:dev-build`.
- [ ] In the development build, open Settings and press `Set push notifications`.
- [ ] Capture logs/screenshots showing the Firebase initialization error no longer appears.
- [ ] Capture whether registration reaches Expo token retrieval or a backend/mock response.
- [ ] Confirm Expo Go still launches and the general smoke flow works without remote push runtime error.
- [ ] Run typecheck/tests if code or config changes are made.

## Acceptance Criteria
- [ ] Dev build no longer shows `Default FirebaseApp is not initialized` when requesting/registering push.
- [ ] `getExpoPushTokenAsync` progresses to token retrieval or to a backend/mock error, but not a Firebase initialization error.
- [ ] Expo Go still launches without remote push runtime error.
- [ ] Typecheck/tests pass if code/config changes are made.

## Out of Scope
- Adding mock `/internal/mobile-push/*` endpoints.
- Backend provider credentials or server-side push send configuration.
- EAS build pipeline setup.
- Fixing unrelated warnings.
