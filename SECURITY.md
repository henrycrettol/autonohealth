# Security policy

## Reporting a vulnerability

Please do not open a public issue for a vulnerability or suspected credential
exposure. Contact the project owner privately and include the affected path,
the impact, and reproduction steps that do not access another person's data.

## Credentials

This repository must never contain OpenAI, Google AI Studio, service-account,
Apple signing, or other private credentials. Firebase web configuration and
reCAPTCHA site keys are public identifiers; provider API secrets belong in
Google Secret Manager.

If a credential is committed, revoke it first. Deleting the line or rewriting
Git history does not make the credential trustworthy again.

## Supported deployment

The supported deployment uses Firebase Hosting, Firestore security rules,
Firebase App Check, and the `askOtto` Cloud Function. Direct browser-to-model
API access is intentionally unsupported.
