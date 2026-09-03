# Pulse Health — Mobile App

Expo 54 / React Native 0.81.5 / TypeScript app for the Pulse healthcare platform.
Screens live under `src/app/` (expo-router), UI state in Zustand stores
(`src/stores/`), and all HTTP lives in `src/lib/api/` — the only place that
touches the network.

## Prerequisites

- Node 20+ and npm
- Expo tooling: `npx expo start` (or the Expo Go app on a device)

## Setup

```bash
npm ci                 # reproducible install (lockfile present)
npx expo start         # dev server; press a for Android emulator, i for iOS
```

## Environment (`.env` — copy from `.env.example`)

| Variable               | Default                     | Meaning                                                                                                                                                     |
| ---------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`  | `http://localhost:8080/api` | Backend base URL. Android emulator: `http://10.0.2.2:8080/api`; physical device: your machine's LAN IP; live backend: `https://pulse-o3gj.onrender.com/api` |
| `EXPO_PUBLIC_USE_MOCK` | unset → **mock mode**       | Run on store seeds. Set to `false` to call the real API                                                                                                     |

> ⚠️ Mock mode is the default: the app shows seeded data until
> `EXPO_PUBLIC_USE_MOCK=false` is set (same pattern as `pulse-web`).

## Demo credentials (live backend)

| Role    | Identifier | Password     |
| ------- | ---------- | ------------ |
| Patient | `PT-00101` | `patient123` |

Login uses `{identifier, password}` → JWT directly (no OTP step for login;
OTP verification is signup-only). The JWT is persisted in AsyncStorage under
`pulse_token`.

## Verification

```bash
npx tsc --noEmit                       # typecheck — must exit 0
npm run lint                           # eslint 0 errors (prettier baseline: 72 files)
npx expo export --platform android     # deep bundle check → "Exported: dist"
```

## API contract

The backend contract lives in `BACKEND_SPEC.md` (web repo) and `ARCHITECTURE.md`
§5.2/§8 (Pulse repo root). Store interfaces in `src/stores/` ARE the API shapes —
never rename a field without aligning the backend DTO.
