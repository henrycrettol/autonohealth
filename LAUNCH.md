# AutonoHealth secure launch checklist

This repository is designed for Firebase Hosting, Firestore, Authentication,
App Check, and one Cloud Function named `askOtto`. Complete the steps in order.

## 1. Revoke old credentials

Delete any Google AI Studio key that was previously placed in browser code or
shared documentation. Removing a key from source does not make it safe again.
No OpenAI key belongs anywhere in this repository.

## 2. Review the new repository before publishing

Create a genuinely new repository rather than a fork or import. Before the
first push, inspect the staged file list and confirm it does not contain:

- `.env` files
- `.firebase/` or `node_modules/`
- service-account JSON files
- `GoogleService-Info.plist`
- `.pem`, `.p12`, or provisioning-profile files
- Xcode `xcuserdata`

Firebase web configuration, `.firebaserc`, `firebase.json`, `firestore.rules`,
and a reCAPTCHA site key are public identifiers and may be committed.

After the first GitHub push, enable Secret Protection with push protection,
Dependabot alerts and security updates, and CodeQL default setup in the
repository's **Settings → Advanced Security** page. Dependabot version checks
are configured in `.github/dependabot.yml`.

## 3. Configure Firebase

In Firebase Console:

1. Select project `autonohealth-13207`.
2. Enable Google sign-in under Authentication.
3. Add `autonohealth.com` and `www.autonohealth.com` as authorized domains.
4. Create Firestore in production mode and deploy the repository's rules.
5. Upgrade to Blaze before deploying the function.
6. Set a small Google Cloud budget alert.

In Google Cloud Console under **APIs & Services → Credentials**, open the
Firebase-provisioned browser key and confirm it is restricted to Firebase APIs.
In particular, the Generative Language API must not be allowed on that public
key. Test the site before tightening an existing production allowlist.

The browser configuration already lives in `assets/firebase.js`. If the web
app registration changes, replace that public configuration block.

## 4. Configure Firebase App Check

1. In Google Cloud Console, open reCAPTCHA Enterprise and enable its API.
2. Create a score-based Website key. Do not select a checkbox challenge.
3. Allow these domains: `autonohealth.com`, `www.autonohealth.com`,
   `autonohealth-13207.web.app`, and `autonohealth-13207.firebaseapp.com`.
4. In Firebase Console, open **Security → App Check**, register the web app
   with the reCAPTCHA Enterprise provider, and paste the public site key.
5. Paste that same public site key into `APP_CHECK_SITE_KEY` in
   `autonohealth-website/assets/firebase.js`.
6. Deploy with enforcement still off and verify that App Check metrics show
   valid requests from the production site.
7. Enable enforcement for Firestore in Firebase Console.
8. In `autonohealth-website/functions/.env.autonohealth-13207`, set:

   ```text
   APP_CHECK_ENFORCEMENT=true
   ```

   This file is intentionally ignored by Git. Redeploy the function, then
   verify that requests without App Check receive HTTP 401.

App Check helps deter unauthorized clients; it is not a substitute for usage
budgets or server-side validation.

## 5. Configure OpenAI

1. Create a dedicated OpenAI project for AutonoHealth.
2. Add only the credit you are comfortable using and set conservative project
   usage limits and alerts.
3. Create a project API key, not an organization admin key.
4. Store it in Google Secret Manager through Firebase:

   ```sh
   firebase functions:secrets:set OPENAI_KEY
   ```

5. Never paste the key into JavaScript, Markdown, `.env`, GitHub Actions, an
   issue, or a screenshot.

The function fixes the model, reasoning effort, request size, output ceiling,
trusted prompt, and storage setting on the server. Browser requests cannot
replace those controls.

## 6. Install and validate

From `autonohealth-website/functions`:

```sh
npm install
npm test
```

From the repository root:

```sh
firebase emulators:exec --only firestore "npm --prefix autonohealth-website/functions test"
```

## 7. Deploy in safe stages

From the repository root:

```sh
firebase deploy --only firestore
firebase deploy --only functions
firebase deploy --only hosting
```

Deploy App Check client support before turning on enforcement. Otherwise valid
visitors will be locked out of Firestore and Otto.

## 8. Configure rate-limit cleanup

The function stores short-lived rate-limit records in the `rateLimits`
collection group with an `expireAt` timestamp. In Google Cloud Console, open
Firestore **Time-to-live policies** and create a TTL policy for collection
group `rateLimits`, field `expireAt`.

TTL deletion is asynchronous. The records contain only a server-keyed HMAC of
the request IP, a counter, and timestamps—not the raw address.

## 9. Test production

On both the Firebase URL and custom domain:

1. Confirm all pages, fonts, images, and videos load without CSP errors.
2. Sign in, save one tracker entry, reload, and delete it.
3. Confirm Otto answers a normal site question.
4. Confirm the local emergency response appears immediately for an emergency
   phrase.
5. Confirm App Check metrics report valid requests.
6. Confirm repeated Otto requests eventually receive HTTP 429.
7. Confirm provider errors shown to visitors are generic and detailed errors
   remain only in Cloud Function logs.
8. View source and search for `sk-`, private-key blocks, and service-account
   data. None should exist.

## 10. Operational safeguards

- Review OpenAI and Google Cloud usage weekly after launch.
- Keep billing alerts enabled, but remember that alerts are notifications—not
  guaranteed hard spending caps.
- Rotate any credential after suspected exposure.
- Keep dependencies updated and rerun `npm audit` before releases.
- Do not enable Otto's tracker-summary feature without a clear privacy policy
  explaining that an optional summary is sent to OpenAI for processing.
