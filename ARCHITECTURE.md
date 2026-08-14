# Pulse Mobile: Architecture & Status Report

A structural audit of the `pulse-mobile` repository — current stack, screen inventory, data-flow reality, and the gaps standing between today's UI shell and a working product.

- **Repo:** pulse-app (Expo)
- **Reviewed:** 2026-08-14
- **Branch:** main
- **Screens audited:** 15
- **Components audited:** 30

## Scope correction

This report was originally briefed against a **web dashboard** architecture — a Next.js `app/` router with `/d/` (admin) and `/w/` (doctor) workspaces, Zustand, TanStack Query, Axios, and Shadcn. None of that exists in this repository.

**pulse-mobile** is an Expo / React Native application with a single, patient-facing flow only — there is no admin workspace, no doctor workspace, no API client, and no state store anywhere in the tree. Sections below are restructured to reflect what's actually here, mapped as closely as possible onto the original outline.

**At a glance:** 15 screens built & styled · 0 global state stores · 0 live API integrations · 0 auth/session checks.

---

## 1. Tech Stack & Tooling

Expo-managed React Native, not Next.js. No bundler decision to make (Metro is the Expo default); the "Turbopack vs. Webpack" question doesn't apply to this runtime.

### Framework & runtime

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Framework | `expo` | ^54.0.0 | Managed workflow; `expo-router` as sole entry (`main: "expo-router/entry"`) |
| UI runtime | `react` | 19.1.0 | react-native `0.81.5` |
| Router | `expo-router` | ~6.0.23 | File-based, group segments — see §2 |
| Animation | `react-native-reanimated` | ~4.1.1 | + `react-native-worklets` 0.5.1 (Reanimated 4 stack) |
| Bundler | Metro | (implicit) | No custom `metro.config.js` beyond Expo defaults |

### Styling & component system

NativeWind (Tailwind for RN) is installed and configured — but the app is a mix of two uncoordinated systems, which is itself worth flagging (see §5).

| Package | Version | Actually used in screens? |
|---|---|---|
| `nativewind` | latest | **In use** — `className` props throughout auth/onboarding |
| `tailwindcss` | ^3.4.0 | **In use** |
| `class-variance-authority`, `clsx`, `tailwind-merge` | — | **Partial** — wired via `lib/utils.ts` `cn()`, only consumed by the unused shadcn-style scaffold |
| `@rn-primitives/dropdown-menu` | ^1.2.0 | **Dead** — the app's actual `Dropdown` is a hand-rolled `Modal`, not this primitive |
| `@rn-primitives/slot` | ^1.2.0 | **Dead** — only referenced by unused `ui/text.tsx` |

`components.json` declares a `shadcn`-schema registry (style `new-york`, `rsc:false`) — this is the React Native port of shadcn ("react-native-reusables"), not web shadcn/ui. It generated `ui/button.tsx`, `ui/text.tsx`, `ui/icon.tsx`, and `lib/theme.ts`, but **none of the 15 screens import them**. Every real screen instead hand-rolls its UI with `StyleSheet.create` + `@expo/vector-icons`.

### State management, data fetching, API client

| Concern | Status |
|---|---|
| Global state (Zustand / Redux / Context) | **Not present** — every screen uses local `useState` only |
| Server-state cache (TanStack Query) | **Not present** — not a dependency |
| HTTP client (Axios / fetch wrapper) | **Not present** — zero network calls anywhere in `src/` |
| API base layer (`lib/api`) | **Doesn't exist** |

Both are explicitly *planned* in code comments: `src/services/mock/hospital-schedule.ts` says it returns data "in the exact shape your TanStack Query expects," and `(screens)/reschedule.tsx` notes "here is where Zustand will eventually fire an action." Neither package is installed yet.

### Other key packages

| Package | Role |
|---|---|
| `lucide-react-native` | Wrapped by `ui/icon.tsx` (shadcn scaffold) — that wrapper is never imported by a screen. All real icon usage is `@expo/vector-icons` (Ionicons, FontAwesome5/6, MaterialIcons/MaterialCommunityIcons — see `constants/medical-category.ts`). |
| `date-fns` | ^4.1.0 — used once, inside the unused mock service |
| `react-native-keyboard-aware-scroll-view` | Onboarding step 1 only, to dodge an Android keyboard-overlap bug |
| `expo-clipboard`, `expo-linear-gradient`, `expo-linking` | Splash gradient, family-code copy/share on onboarding step 3 |
| Validation (zod / yup / react-hook-form) | **Not present** — forms gate submission with a manual `isFormValid` boolean, no field-level error messaging |
| Persistence (AsyncStorage / SecureStore) | **Not present** — nothing survives a reload |
| Tests (Jest / RNTL) | **Not configured** — no test script in `package.json` |

---

## 2. Directory Tree & Architecture Overview

A flat, screen-first tree — no `hooks/`, no `stores/`, no `api/` layer exists yet to break out.

```
src/
├── app/                        # expo-router file-based routes
│   ├── _layout.tsx              root Stack, headerShown:false
│   ├── index.tsx                splash → hard-redirects to /login after 3s
│   ├── (auth)/                  login, signup, otp
│   ├── (onboarding)/             step1-identity, step2-clinical, step3-family
│   ├── (tabs)/                   _layout (custom FAB tab bar) + home, queue, book-appointment, records, profile
│   └── (screens)/                hospital-details, reschedule  # modal-style pushed routes
├── components/
│   ├── book-appointment/         date-strip, month-selector, time-slot-picker
│   ├── cards/                    live-queue-card, quick-action, visit-history, health-tip-banner
│   ├── profile/                  profile-header, settings-card, settings-row
│   ├── queue/                    instruction-list
│   ├── records/                  category-tab, medical-banner, medical-record-card
│   ├── shared/                   section-header, tab-navigator # tab-navigator: unused
│   └── ui/                       2 parallel systems — see §1 & §5
├── constants/                    theme.ts (COLORS), medical-category.ts (department icon map)
├── lib/                          utils.ts (cn()), theme.ts (NAV_THEME — defined, never applied)
└── services/
    └── mock/                     hospital-schedule.ts # the only "data layer" file; unused by any screen

absent:  hooks/  stores/  api/  types/  __tests__/
```

### Data flow, as it actually exists today

```
Screen (.tsx) → local useState → hardcoded literal / inline mock object
             ✕ no hook layer   ✕ no API layer   ✕ no backend
```

The intended shape — `Component → Hook/TanStack Query → API layer / mock switch → Backend` — is visible only as intent (see the code comments quoted in §1). Today, every screen is its own island: `hospital-details.tsx` and `reschedule.tsx` each define their *own* inline `HARDCODED_AVAILABILITY` object rather than importing the shared mock service, so the two booking flows can already drift out of sync with each other.

### Routing

File-based via `expo-router`, four group segments (`(auth)`, `(onboarding)`, `(tabs)`, `(screens)`) under one root `Stack`. There is no `_layout.tsx`-level auth guard — segment membership is purely a folder convention, not an enforced access boundary (elaborated in §5).

---

## 3. Route Segmentation

No admin (`/d/`) or doctor (`/w/`) workspace exists in this codebase — this is a single patient-facing app. Table below is the real segmentation, standing in for that part of the original brief.

Legend: **Built** = visually complete, styled, navigable · **Partial** = UI done, interactions are placeholders · **Stub** = exists but functionally inert.

### Public / Auth / Onboarding

| Route | Screen | Status | Notes |
|---|---|---|---|
| `/` | Splash | Partial | Animated logo; unconditionally `router.replace('/login')` after 3s — no session check |
| `/(auth)/login` | Login | Partial | Full UI incl. Google/Apple buttons; "Sign In" navigates with no credential check |
| `/(auth)/signup` | Sign Up | Partial | Pushes to OTP; no request fired |
| `/(auth)/otp` | OTP verify | Partial | 6-box input w/ paste support works; "Resend Code" and verification are both cosmetic |
| `/(onboarding)/step1-identity` | Personal details | Built | Full validation gating on required fields |
| `/(onboarding)/step2-clinical` | Clinical profile | Built | Blood type, allergies, NHIS/private insurance w/ provider search |
| `/(onboarding)/step3-family` | Family & emergency contact | Built | Generates a shareable family code client-side; finishes into `(tabs)/home` |

### Main tabs — `(tabs)/`

| Route | Screen | Status | Notes |
|---|---|---|---|
| `/(tabs)/home` | Home | Partial | Live-queue hero, quick actions, recent visits — 3 of 4 quick actions and "See All" are no-op `onPress` |
| `/(tabs)/queue` | Live Queue | Partial | "Arrived"/"Cancel" fire `Alert.alert` only; Directions/Desk buttons inert; "Reschedule" is the one real link |
| `/(tabs)/book-appointment` | Find & book | Built | Animated collapsing header, category pills, 3 hospital cards w/ scroll-linked SOS reveal — fully styled |
| `/(tabs)/records` | Medical records | Partial | 3 record cards render; all `onPress` are no-ops, search bar has no handler |
| `/(tabs)/profile` | Profile & settings | Partial | Settings rows are static; only the notification toggle has working local state |

### Modal / pushed screens — `(screens)/`

| Route | Screen | Status | Notes |
|---|---|---|---|
| `/(screens)/hospital-details` | Hospital detail + booking | Built | Parallax hero, department dropdown, 14-day date strip, grouped time slots; "Proceed" fires a bare `alert()` |
| `/(screens)/reschedule` | Reschedule appointment | Built | Toast warnings for closed/full dates; "Confirm Reschedule" `onPress` is an empty function with a Zustand TODO comment |

---

## 4. State Management & Data Layer Status

There is no data layer to describe caching or polling cadence for — this section documents its absence precisely, so it's actionable as sprint scope.

### Global stores

**None** — no Zustand, Redux, Jotai, or React Context providers exist anywhere in `src/`. Cross-screen state (a booking in progress, queue position, profile edits) does not persist between tabs today; navigating away and back resets it.

### Mock vs. real API, by domain

| Domain | Backing | Detail |
|---|---|---|
| Hospital availability (booking) | Mock, unused | `services/mock/hospital-schedule.ts` simulates an 800ms delay + realistic slot/closed/full logic — but no screen imports it |
| Hospital availability (details & reschedule screens) | Inline hardcoded | Each screen defines its own `HARDCODED_AVAILABILITY` literal — two independent copies |
| Hospitals, queue, records, profile, auth | Inline hardcoded | Literal JSX/object data embedded directly in each screen file |
| Anything | Real endpoint | Zero — no network call exists in the codebase |

### TanStack Query hooks & caching

**None exist.** Not installed as a dependency. The mock service's own comment — "return the exact shape your TanStack Query expects" — indicates the data shape was pre-designed for it, which should shorten the integration once the package is added.

---

## 5. Progress vs. Gaps

The visual product is far ahead of the functional one. Below: what's genuinely done, and the specific gaps that block turning this into a working app.

### Fully built & styled

All 15 screens render polished, Ghana-specific UI end to end — NHIS/private insurance flows, Ghana Card references, GHS currency, named local hospitals (KNUST, Komfo Anokye, HopeXchange). Onboarding (3 steps), booking discovery, hospital detail + slot picker, and reschedule are the strongest work: real client-side validation, scroll-linked header animations, and thoughtful empty/disabled states.

### Stubbed, mock-only, or partial

- Every list, card, and record on every screen is literal hardcoded data — nothing is fetched.
- At least 8 `onPress` handlers are bare no-ops (`() => {}`) across home and records alone; queue actions resolve to `Alert.alert` placeholders; the booking "Proceed" button fires a raw `alert()`.
- Forms gate on a manual `isFormValid` boolean with no per-field error messaging and no validation library.

### Critical technical gaps

**[Critical] No authentication or session gating**
Splash unconditionally routes to `/login` regardless of any prior session; "Sign In" performs no credential check and just navigates; nothing is persisted (no AsyncStorage / SecureStore usage anywhere) so no session could survive a reload even if one were created. Deep-linking straight into `(tabs)` or `(onboarding)` is not prevented by any route guard.

**[Critical] No data layer — everything is a dead end**
Zero HTTP calls, zero mutations, zero persisted writes anywhere in the app. Booking a slot, cancelling a queue ticket, and toggling a setting all discard state on navigation. This is the single largest gap standing between the current shell and a usable product.

**[High] Two uncoordinated component systems**
A shadcn-style RN registry (`components.json`, `ui/button.tsx`, `ui/text.tsx`, `ui/icon.tsx`, `lib/theme.ts` NAV_THEME, three `@rn-primitives` packages) was scaffolded but never adopted — every real screen bypasses it with bespoke `StyleSheet` components and `@expo/vector-icons`. Worth an explicit decision: finish adopting the scaffold, or remove it before it accumulates more drift.

**[High] Duplicated, drifting mock data**
`hospital-details.tsx` and `reschedule.tsx` each hand-maintain their own `HARDCODED_AVAILABILITY` object instead of sharing `services/mock/hospital-schedule.ts`, which already exists and already simulates network latency correctly.

**[Medium] Dark theme is scaffolded but inert**
`lib/theme.ts` defines full light/dark HSL token sets and a `NAV_THEME`, but no `ThemeProvider` wraps the root `Stack` — consistent with `app.json`'s `userInterfaceStyle: "light"`, but the unused scaffolding is worth pruning or wiring up deliberately, not leaving ambiguous.

**[Medium] No automated test coverage**
No Jest/RNTL configuration in `package.json`. Fine at current UI-shell maturity, but becomes a real risk the moment state/data-layer work lands in the next sprint.

---

*Compiled from a direct read of `src/`, `package.json`, and config files — no assumptions carried over from the original brief.*
