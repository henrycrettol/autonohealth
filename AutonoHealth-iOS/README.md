# AutonoHealth for iOS

This folder contains the native SwiftUI migration of the AutonoHealth web prototype. The website in `../autonohealth-website` remains unchanged and continues to be the source for the full editorial library during migration.

## Implemented vertical slice

- Native five-tab SwiftUI navigation
- Reusable AutonoHealth color and card tokens
- Native Home and Explore screens
- Complete high-blood-pressure overview with evidence ratings and source links
- Daily tracker for mood, sleep, exercise, medication/supplement adherence, hydration, food notes, and symptoms
- Automatic local persistence using an app-support JSON file with iOS complete file protection
- Native BMI calculator
- Unit tests for tracker persistence and condition-content integrity
- Placeholder boundary for the native Otto integration

## Opening the project

1. Install Xcode 16 or newer from Apple.
2. If multiple developer directories exist, select Xcode:

   ```sh
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   ```

3. Open `AutonoHealth.xcodeproj`.
4. Select the AutonoHealth target, open Signing & Capabilities, and choose your Apple Developer team.
5. Choose an iPhone simulator and run the app.

The project uses the placeholder bundle identifier `com.autonohealth.app`. Change it if that identifier is not owned by your Apple Developer account.

## Migration phases

### Phase 1 — native foundation (current)

Validate navigation, the design system, tracker interactions, protected local persistence, and the native content layout.

### Phase 2 — structured content

Extract every condition and treatment from the HTML source into versioned JSON shared by the website and iOS app. Add schema validation so editorial content cannot silently ship incomplete.

### Phase 3 — accounts and sync

Add Firebase through Swift Package Manager, use the native Firebase Auth and Firestore SDKs, implement Sign in with Apple and Google, migrate signed-out local tracker entries after consent, and add export/deletion controls.

### Phase 4 — Otto and remaining tools

Connect a native conversation screen to the existing server-side proxy. Port sleep-debt, caffeine, creatinine-clearance, medication-schedule, and visit-plan features. Keep urgent-language detection on-device before sending any request.

### Phase 5 — release readiness

Add a final app icon, privacy policy and App Privacy answers, accessibility and Dynamic Type QA, device and UI tests, release signing, App Store screenshots, review notes, and a documented medical/editorial review process.

## Security boundary

No Gemini or other spending credential belongs in this app bundle. Otto must continue to call a server-side endpoint. Firebase client configuration may be bundled, but Firestore security rules and authentication must enforce access to each user's data.
