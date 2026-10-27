# Daily Fuel — native apps (Android & iOS)

This folder wraps the Daily Fuel web app (`../calorie-tracker`) in a native shell with
[Capacitor](https://capacitorjs.com), adding what a web app can't do:

- **Steps, weight and active energy from Apple Health / Android Health Connect**
  (`@capacitor/health-fitness`), synced when the app opens, with weights you log written back.
- **Reminders that arrive with the app closed** (`@capacitor/local-notifications`): meal times,
  water, weigh-in and "fast complete", scheduled on the phone from Settings → Reminders. Tap
  **Allow notifications** there once; on Android 13+ the system asks for permission.
- A real app icon, splash screen and store-ready project.

The web app is copied into `www/` by `node build-www.js` on every sync, so the native apps
always ship the latest version of `../calorie-tracker` (minus dev files).

## Layout
```
build-www.js            copies ../calorie-tracker → www/ (skips originals, key, README)
capacitor.config.json   app id com.dailyfuel.app, name "Daily Fuel"
android/                Android Studio / Gradle project (Health Connect configured)
  healthfitness.config.json   which Health Connect permissions the app declares
ios/App/                Xcode project (Swift Package Manager, HealthKit entitlement + usage strings)
assets/                 icon + splash sources (regenerate: npx capacitor-assets generate)
```

## Android — build an APK on this PC
Prerequisites already set up on this machine: JDK 21 in `D:\jdk`, Android SDK in
`D:\android-sdk` (platform 36, build-tools 36), Node 24.

```bash
cd daily-fuel-native
npm install                      # first time only
npm run android                  # = build www, cap sync, gradlew assembleDebug
```
The APK lands at `android/app/build/outputs/apk/debug/app-debug.apk`.

If `java` isn't on the PATH, set `JAVA_HOME=D:\jdk\jdk-21...` and `ANDROID_HOME=D:\android-sdk`
first (`android/local.properties` already points at the SDK).

**Install on your phone:** copy the APK to the phone (USB, Drive, email), open it and allow
"install from this source"; or with USB debugging on: `D:\android-sdk\platform-tools\adb install -r app-debug.apk`.

**Health Connect:** on first launch go to Settings → Health sync → Connect and approve
steps, weight and active energy. Android 14+ has Health Connect built in; on Android 9–13
install "Health Connect by Android" from the Play Store first. Steps are whatever your
phone/watch writes to Health Connect (Google Fit, Samsung Health, Fitbit, Garmin all can).

**Play Store (optional, US$25 once):** build a signed release (`gradlew bundleRelease` with a
keystore), and in Play Console declare the Health Connect permissions with the privacy
policy at https://thaidinhhh-jpg.github.io/daily-fuel/privacy.html.

## iOS — build with Xcode (needs a Mac)
This PC can't compile iOS apps, but the project is complete:

1. On a Mac with Xcode 16+, copy this folder (or clone the repo), run `npm install` then
   `node build-www.js && npx cap sync ios`.
2. `npx cap open ios` (opens `ios/App/App.xcodeproj`). Swift packages resolve automatically.
3. Select the App target → Signing & Capabilities → pick your Apple ID team. HealthKit is
   already in `App.entitlements`; if Xcode asks, tick **HealthKit** under Capabilities.
4. Plug in the iPhone, choose it as the run target, press Run. With a free Apple ID the app
   stays installed for 7 days; with the US$99/yr Developer Program it's permanent and can go
   to TestFlight / the App Store.
5. In the app: Settings → Health sync → Connect, and allow Steps, Weight and Active Energy.

**No Mac?** [Codemagic](https://codemagic.io) builds iOS apps in the cloud from a GitHub
repo (free tier covers a few builds a month); you still need an Apple Developer account to
sign and install.

## iPhone without the native app — Shortcuts hook
The web app accepts `?steps=N`, `?weight=KG` and `?water=ML` (optional `&date=YYYY-MM-DD`)
and logs them, so a Shortcuts automation can push Health data without any app build:

1. Shortcuts → Automation → **+** → **Time of Day** (e.g. 9:00 pm, Daily) → Run Immediately.
2. Actions: **Find Health Samples** (Type: Steps, Start Date: today, End Date: now) →
   **Calculate Statistics** (Sum) → **Open URLs** with
   `https://thaidinhhh-jpg.github.io/daily-fuel/?steps=` followed by the Sum variable.
3. Optionally add a second **Find Health Samples** for Weight (latest) and append
   `&weight=` + value.

Limitation: iOS opens that URL in Safari, and a home-screen (installed) PWA keeps its own
separate storage, so this works if you use Daily Fuel **in Safari**. The native app above is
the proper fix.

## Updating the apps after web changes
Any change in `../calorie-tracker` → `npm run sync` (or `npm run android` for a new APK), and
re-run from Xcode for iOS.
