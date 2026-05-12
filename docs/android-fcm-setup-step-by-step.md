# Android FCM Setup Step-by-Step

Android remote push notifications use Firebase Cloud Messaging (FCM). Even when notifications are sent through Expo Push Service, the Android app still needs native Firebase registration so Expo can generate an Expo push token for this device/app install.

## Prerequisites

- Google/Firebase account with access to the target Firebase project.
- Android package name: `com.ytpipe.mobile`.
- Repository path: `C:\Users\User\Desktop\Projects\YTPipeMobile`.
- Android Studio, emulator/device, and the development build flow working.
- Existing Expo config points Android builds to `./google-services.json` via `android.googleServicesFile`.
- Expo/EAS project is initialized so `extra.eas.projectId` is present in app config.

## Checklist

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Create a new Firebase project or select the existing project for YTPipe Mobile.
3. In the project overview, add an Android app.
4. Enter the Android package name exactly: `com.ytpipe.mobile`.
5. Add an app nickname if useful. This is optional.
6. Skip SHA-1 for this current push-notification setup. SHA-1 may be required later for other Firebase features, but basic FCM push registration does not need it.
7. Download the generated `google-services.json` file.
8. Place it at the repository root:

   ```text
   C:\Users\User\Desktop\Projects\YTPipeMobile\google-services.json
   ```

9. Confirm `google-services.json` remains uncommitted. It is already listed in `.gitignore`.
10. Initialize the Expo/EAS project if `app.json` does not already contain `extra.eas.projectId`:

    ```bash
    npx eas-cli login
    npx eas-cli init
    ```

    This links the local app to an Expo project. `expo-notifications` needs this project id to generate an Expo push token in a development build.

11. Rebuild the Android development build:

    ```bash
    npm run android:dev-build
    ```

    A Metro restart is not enough because `google-services.json` is consumed during the native Android build.

12. Open the app's Settings screen and press **Set push notifications**.

## Expected result

- The Firebase initialization error should disappear after the rebuilt development build uses the downloaded `google-services.json`.
- If the app is still pointed at the current mock backend, a `404` can still happen until the mock push endpoints are added in F.3. That backend/mock error is separate from Firebase initialization.

## Troubleshooting

- **Wrong package name:** Firebase must use `com.ytpipe.mobile` exactly.
- **File in wrong path:** The file must be named `google-services.json` and live at the repo root, not inside `docs/`, `android/`, or another folder.
- **Forgot rebuild:** Run `npm run android:dev-build`; restarting Metro or the app alone will not apply Firebase config changes.
- **Missing Expo project id:** Run `npx eas-cli login` and `npx eas-cli init`, then rebuild. The app should have `extra.eas.projectId` in Expo config.
- **Still using Expo Go:** Use the development build for real push setup. `npm run android` is useful for Expo Go smoke checks, but Expo Go is not the target for validating this native Firebase registration.
- **Backend/mock 404:** A `404` from push registration endpoints is not an FCM setup failure. Add or use the expected backend/mock endpoints when they are available.

## Security and policy

`google-services.json` is mobile client configuration, not a Firebase server key. However, this repository currently gitignores it, so keep it local and do not commit it. Never commit Firebase service account JSON files, server keys, or other backend credentials.
