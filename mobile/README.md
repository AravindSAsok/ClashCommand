# CoC Battle Assistant (Android)

A lightweight, on-device Clash of Clans battle companion. The first milestone is the React Native app shell; screen capture and analysis will be added in later milestones.

## Stack

- React Native + Expo + TypeScript
- Android-first
- Local processing only; no account, backend, or cloud AI
- Kotlin native modules will be introduced only for Android capabilities that require them

## Run locally

From this directory:

```bash
npm install
npx expo start
```

To run a native Android development build (requires Android SDK and Java):

```bash
npx expo run:android
```

## Milestones

1. App shell and Battle Command Center visual direction.
2. Android MediaProjection consent flow and screenshot preview.
3. Basic on-device recognition of visible base structures.
4. Human-readable attack and spell recommendations.
5. Floating guidance overlay, subject to Android permission and lifecycle constraints.

The app provides advice only. It does not automate gameplay or tap game controls.
