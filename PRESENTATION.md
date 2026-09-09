# PULSE MOBILE — Presentation Notes (Lecture Prep)

**Repo:** `D:/Projects/pulse/pulse-mobile` — remote `https://github.com/housebuoy/pulse-mobile.git` (verified via `git remote -v`), currently checked out on branch `develop`.
**Audience style:** people will open files and ask "where is that?" — every claim below carries a real file pointer. Paths are repo-root-relative. All pointers verified with `ls`/`grep`/`read` before writing; anything that could not be verified from repo files is flagged in §6.

---

## 1. What this app is (30-second pitch)

PULSE MOBILE is the patient-facing half of the Pulse hospital platform: a single Expo/React-Native app in which a patient discovers hospitals, books appointments (date strip + time-slot picker), checks into a **live queue** and watches their ticket number climb, reads their medical records (visits / lab results / prescriptions), pays outstanding bills through a hosted checkout, and receives live toasts the moment the doctor calls them.

It is tested today on **iPhone via Expo Go**: `npx expo start`, scan the QR code, and the app talks to a **live backend on Render** (`https://pulse-o3gj.onrender.com/api`) with a full mock-data fallback whenever the API is unreachable or the mock flag is unset.

The whole app is file-based-routed expo-router: every screen is just a `.tsx` file under `src/app/`, grouped into `(auth)` / `(onboarding)` / `(tabs)` / `(screens)`, and every API call funnels through one typed `fetch` wrapper (`src/lib/api/client.ts`) that throws a single `ApiError` type — which is why error handling looks uniform across the app.

## 2. Stack, structure & how to run it

### Stack (verified in `package.json`)

| Concern | Choice (verified) |
|---|---|
| Framework | Expo SDK **57** (`expo ^57.0.19`), React Native **0.86.3**, React **19.2.3** |
| Language | TypeScript **~6.0.3**, `tsconfig.json` extends `expo/tsconfig.base`, `"strict": true`, path alias `@/* → ./src/*` |
| Routing | **expo-router ~57.0.18** — file-based routing; entry `"main": "expo-router/entry"` |
| Styling | **NativeWind v4 (Tailwind)** wired through the toolchain — `metro.config.js` wraps `withNativeWind(config, { input: './global.css' })`, `babel.config.js` sets `jsxImportSource: 'nativewind'`, `tailwind.config.js` extends colors (`primary #2a79e9`, `danger`, `success`, …). **BUT** `className` appears in only **8 of 83 `.tsx` files** — the six `(auth)` screens, splash `index.tsx`, and `components/ui/emergency-banner.tsx`. The other ~75 files use classic `StyleSheet.create` with the shared `COLORS` palette (`src/constants/theme.ts`). |
| State | **zustand ^5.0.15** slices under `src/stores/`; most persisted via `persist(createJSONStorage(() => AsyncStorage))` |
| Persistence | **@react-native-async-storage/async-storage 2.2.0** (JWT, store persistence, hospitals cache, pending-signup handoff) |
| Animations | `react-native-reanimated 4.5.1` + `react-native-worklets` (babel plugin) — but most UI animation is RN core `Animated` + `LayoutAnimation` |
| Dates | `date-fns ^4.1.0` (`format`, `parseISO`, `addDays`, `formatDistanceToNowStrict`) |
| Icons | `@expo/vector-icons` (Ionicons throughout) |
| Auth/session | JWT stored in AsyncStorage under key `pulse_token` (`TOKEN_KEY`, `src/lib/api/client.ts`) |

### Run it

```bash
npx expo start          # Metro dev server; scan QR with Expo Go on iPhone (same Wi-Fi)
npx tsc --noEmit        # type gate — README-documented; must pass (strict TS 6)
npm run lint            # eslint **/*.{js,jsx,ts,tsx} && prettier -c
```

**Environment** (`.env`, gitignored; `.env.example` present):

```ini
EXPO_PUBLIC_API_URL=https://pulse-o3gj.onrender.com/api
EXPO_PUBLIC_USE_MOCK=false
```

- `client.ts` resolves the base URL at module load (`resolveBaseUrl()`), strips a trailing `/`, and rewrites `localhost` → `10.0.2.2` on Android emulators.
- **Mock mode:** `src/lib/use-mock.ts` — `isMockMode() = process.env.EXPO_PUBLIC_USE_MOCK !== 'false'`. Any unset value ⇒ mock. `.env` pins `false` ⇒ live Render API. Each API module guards every function with `isMockMode()` and returns seeds/fakes instead of hitting the network.
- Mock availability "database": `src/services/mock/hospital-schedule.ts` — generates 30 days of slots (closed Sundays, ~10% fully-booked days, MORNING/AFTERNOON blocks, one always-free and one always-taken slot) behind an 800 ms fake delay so loading spinners are exercised. Same `HospitalAvailability` type feeds both Hospital Details and Reschedule.
- Launch sequence: `src/app/index.tsx` is a branded splash (animated logo heartbeat) that after 3 s does `router.replace('/login')` — note it does **not** check for an existing token; the app always opens on login.

### Project layout at a glance (verified tree)

```
pulse-mobile/
├── app.json  ARCHITECTURE.md  README.md  babel.config.js  global.css
├── eslint.config.js  metro.config.js  tailwind.config.js  tsconfig.json
├── nativewind-env.d.ts      # declares module '*.css' (TS2882 fix)
├── package.json             # expo ^57.0.19, RN 0.86.3, expo-router ~57.0.18
├── .env / .env.example      # EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USE_MOCK
├── assets/
│   ├── hospitals/           # bundled facility jpgs (id '1', id '3')
│   └── icons/               # splash-icon-light.png etc.
├── docs/bug-triage-frontend.md
└── src/
    ├── app/                 # expo-router routes (§3.1)
    │   ├── _layout.tsx  index.tsx
    │   ├── (auth)/  (onboarding)/  (tabs)/  (screens)/
    ├── components/          # ui cards auth book-appointment queue records
    │   │                    #   payments insurance medical profile shared + progress-header
    ├── lib/
    │   ├── api/             # client auth patient discovery queue appointments
    │   │                    #   records notifications hydrate
    │   ├── phone.ts  hospital-images.ts  use-mock.ts  theme.ts
    ├── stores/              # booking hospitals insurance medical notifications
    │                        #   payments profile queue records
    ├── constants/           # theme departments medical-category
    ├── utils/               # search hospitals-filter records-filter group-by-recency
    └── services/mock/       # hospital-schedule.ts
```

## 3. CODE MAP — what each segment is, and its conventions

### 3.1 Routes — `src/app/` (type: screens)

`_layout.tsx` (root) mounts `<ToastProvider>` → `<NotificationsPoller />` → `<Stack screenOptions={{ headerShown: false }} />`. Only `(tabs)` has its own `_layout.tsx`, so tabs are the only nested navigator; every other route is a root-Stack screen pushed over the tab bar.

| Route file | Kind | What it does |
|---|---|---|
| `(auth)/login.tsx` | auth screen | identifier (phone/Ghana Card) + password → `login()` → `hydrateAfterLogin()` → Home |
| `(auth)/signup.tsx` | auth screen | posts signup, stashes `{phone, password}` → OTP |
| `(auth)/otp.tsx` | auth screen | 6-digit code; `context: 'signup' \| 'reset'` dual flow |
| `(auth)/forgot-password.tsx` | auth screen | request SMS reset code |
| `(auth)/new-password.tsx` | auth screen | set new password w/ `resetToken` |
| `(auth)/reset-success.tsx` | auth screen | confirmation → login |
| `(onboarding)/step1-identity.tsx` | onboarding | personal details ("Personal Details.") |
| `(onboarding)/step2-clinical.tsx` | onboarding | clinical details |
| `(onboarding)/step3-family.tsx` | onboarding | family/emergency details → `hydrateAfterLogin()` → app |
| `(tabs)/home.tsx` | tab screen | hero carousel, pills, recent visits |
| `(tabs)/queue.tsx` | tab screen | live queue ticket page |
| `(tabs)/book-appointment.tsx` | tab screen | hospital discovery + AsyncStorage cache |
| `(tabs)/records.tsx` | tab screen | Visits / Lab Results / Prescriptions tabs |
| `(tabs)/profile.tsx` | tab screen | header, settings, logout |
| `(tabs)/_layout.tsx` | navigator | 5-tab `Tabs` w/ raised center "+" FAB |
| `(screens)/hospital-details.tsx` | deep screen | hero image, dept/doctor pick, date+time booking |
| `(screens)/reschedule.tsx` | deep screen | reschedule + surcharge checkout flow (§4.9) |
| `(screens)/my-appointments.tsx` | deep screen | full booking list w/ status badges |
| `(screens)/notifications.tsx` | deep screen | notification feed |
| `(screens)/payments.tsx` | deep screen | outstanding/saved/history + hosted checkout |
| `(screens)/health-insurance.tsx` | deep screen | insurance details + card photo |
| `(screens)/medical-id.tsx` | deep screen | emergency ID card + share |
| `index.tsx` | splash | 3 s animated splash → `/login` |

Conventions: `SafeAreaView` + `StyleSheet.create` (auth screens: NativeWind `className`), `useLocalSearchParams` for deep-link params, `router.back()` headers, `router.replace` for post-auth transitions (no back-stack leak), sticky bottom button for flows, error surfacing via `useToast()` or `Alert`.

### 3.2 Components — `src/components/` (type: UI)

| Domain folder | Representative files | Notes |
|---|---|---|
| `ui/` | `custom-button.tsx`, `hospital-card.tsx`, `search-bar.tsx`, `category-pills.tsx`, `dropdown-menu.tsx`, `header-badge.tsx`, `emergency-banner.tsx`, `native-only-animated-view.tsx`, **`toast-provider.tsx`, `toast-banner.tsx`, `notifications-poller.tsx`** | generic building blocks + the root-mounted toast/poller trio |
| `cards/` | `upcoming-card.tsx`, `live-queue-card.tsx`, `discovery-card.tsx`, `visit-history.tsx`, `health-tip-banner.tsx`, `quick-action.tsx` | memoized hero/queue cards |
| `book-appointment/` | `date-strip.tsx`, `month-selector.tsx`, `time-slot-picker.tsx`, `ask-ai-sheet.tsx`, `hospitals-filter-sheet.tsx` | booking widgets |
| `queue/` | `instruction-list.tsx` | queue rules timeline |
| `records/` | `category-tab.tsx`, `lab-result-card.tsx`, `prescription-card.tsx`, `record-list-card.tsx`, `visit-detail-sheet.tsx`, `lab-result-detail-sheet.tsx`, `prescription-detail-sheet.tsx`, `records-filter-sheet.tsx`, `medical-banner.tsx` | 3 tabs + detail bottom sheets |
| `payments/` | `pay-booking-sheet.tsx`, `add-payment-method-sheet.tsx`, `saved-methods-card.tsx`, `outstanding-payments-card.tsx`, `payment-history-card.tsx`, `payments-hero-card.tsx`, `network-badge.tsx` | payments section cards |
| `insurance/` | `insurance-card-hero.tsx`, `insurance-details-card.tsx`, `insurance-photo-card.tsx` | insurance UI |
| `medical/` | `emergency-id-card.tsx`, `emergency-contact-card.tsx`, `emergency-share-sheet.tsx`, `medications-card.tsx`, `vitals-log-card.tsx`, `record-vitals-modal.tsx`, `editable-chip-list.tsx` | medical ID + vitals |
| `profile/` | `profile-header.tsx`, `settings-card.tsx`, `settings-row.tsx` | profile UI |
| `auth/` | `resend-timer.tsx` | OTP resend cooldown |
| `shared/` | `section-header.tsx`, `tab-navigator.tsx` | shared headers |
| (root) | `progress-header.tsx` | exports `TopProgressBar` + `FormHeading` (used by onboarding steps) |

Conventions: presentational, props-driven, often `React.memo` when a parent polls; modal-ish content as bottom sheets; accessibility labels on pressables.

### 3.3 Data layer — `src/lib/api/` (type: data)

- **`client.ts`** — the only HTTP entry point (its own comment: "All other api/*.ts files call this"). `apiRequest<T>(path, {method, body, auth, headers})` wraps `fetch`, attaches `Authorization: Bearer <token>` from AsyncStorage unless `auth:false`, JSON-encodes bodies (FormData passes through for uploads), throws `ApiError(status, message, body)`, and on **401** clears the token and `router.replace('/(auth)/login')` centrally (`handleUnauthorized`, lines 34–41). Exports `API_BASE_URL`, `TOKEN_KEY`, `setToken`, `clearToken`.
- **`auth.ts`** — patient auth: `POST /auth/patient/login {identifier,password}`, `/signup`, `/verify-otp`, `/resend-otp`, `/password-reset/request` (returns `devOtp` in dev-echo mode), `/password-reset/verify`, `/password-reset/confirm`. No email anywhere — phone/Ghana Card/PT-code only.
- **`patient.ts`** — `GET/PATCH /patients/me` (profile), `/patients/me/medical`, `POST /patients/me/vitals`, `GET/PUT /patients/me/insurance`, `POST /uploads/images` (FormData card photo), `GET /patients/me/outstanding`, `GET/POST /patients/me/payment-methods`, `GET /patients/me/payment-history`, hosted checkout (`checkoutUrl`+`sessionId`).
- **`discovery.ts`** — `GET /mobile/hospitals`, `/mobile/hospitals/{id}/departments`, `/departments/{id}/doctors?size=100` (doctor `bookableOnline` flag), `/mobile/departments/{id}/availability?from&days`, `POST /bookings/mobile`, `PATCH /bookings/{id}/reschedule`, `POST /bookings/{id}/reschedule/surcharge` (returns hosted Aza checkout). Also `formatSlotTime`/`slotTimeToIso` ("09:00" ⇄ "09:00 AM") and `mapSlots`.
- **`queue.ts`** — `GET /queue/me` (404 ⇒ `null`), `POST /queue/me/check-in`, `POST /queue/me/cancel`; mock `MOCK_TICKET` (KNUST/Dr. Arhin).
- **`appointments.ts`** — `GET /patients/me/appointments`; types `AppointmentStatus` (scheduled/confirmed/checked_in/completed/cancelled/no_show) + `AppointmentPaymentStatus` (pending/paid/failed/refunded); `cancelBooking` = `DELETE /bookings/{id}`.
- **`records.ts`** — `GET /patients/me/records` → `MedicalRecords {visits, labResults, prescriptions}` (mock reads store seeds).
- **`notifications.ts`** — `GET /patients/me/notifications`, `GET …/unread-count`, `PATCH …/{id}/read`, `POST …/read-all`.
- **`hydrate.ts`** — `hydrateAfterLogin()`: six store groups fetched in **one concurrent `Promise.allSettled` round** (profile → medical → insurance → ticket → payments → records were previously ~5 serial rounds, ~3–5 s of sign-in latency; comment cites bug-triage FE-26). Group failures don't block the rest.

### 3.4 State — `src/stores/` (type: state; zustand)

| Store | Persisted? | Holds |
|---|---|---|
| `booking-store.ts` | ✅ AsyncStorage | department/date/time/facility + `lastBookingId` + `reset()` (fresh booking session per hospital, FE-23) |
| `hospitals-store.ts` | ✅ | hospital list + saved-favourite ids |
| `records-store.ts` | ✅ | `visits`/`labResults`/`prescriptions` arrays + filters |
| `payments-store.ts` | ✅ | outstanding/methods/history + `pendingCheckoutBookingIds` |
| `insurance-store.ts` | ✅ | insurance details + photo uri |
| `medical-store.ts` | ✅ | medical profile, vitals log, allergies/meds |
| `profile-store.ts` | ✅ | `ProfileIdentity` + `pushEnabled` |
| `notifications-store.ts` | ❌ | feed + unread count; mark-read actions (optimistic + backend reconcile) |
| `queue-store.ts` | ❌ **by design** | live ticket — a persisted ticket caused stale cards from a previous session (comment in `queue-store.ts` lines 27–31); `EMPTY_TICKET` = "not in a queue" |

### 3.5 Support — `src/lib`, `src/constants`, `src/utils`, `src/services`

`lib/use-mock.ts` (mock switch), `lib/phone.ts` (Ghana validation), `lib/hospital-images.ts` (bundled art, §4.3), `lib/theme.ts`, `constants/theme.ts` (COLORS), `constants/departments.ts`, `constants/medical-category.ts`, `utils/search.ts` / `hospitals-filter.ts` / `records-filter.ts` / `group-by-recency.ts` (pure helpers), `services/mock/hospital-schedule.ts`.

### 3.6 Conventions worth naming out loud (all verified in code)

- **Domain folders mirror feature names** — a feature's screen, components, API module and store all live under parallel folders (`app/(tabs)/records.tsx` ↔ `components/records/` ↔ `lib/api/records.ts` ↔ `stores/records-store.ts`).
- **One HTTP entry point.** Screens never call `fetch` directly — everything goes through `apiRequest` in `client.ts`, which owns base-URL resolution, auth header, JSON/FormData encoding, the 401 redirect, and `ApiError`.
- **API modules default-export async functions**, each starting with an `isMockMode()` guard; consumers use static imports at top level in screens, but **dynamic `import('@/lib/api/…')` inside handlers** where the module is heavy or only needed on action (e.g. `reschedule.tsx` imports discovery/patient lazily; `queue.tsx` imports the queue API inside the poll/click handlers).
- **Stores are zustand `create()(…)`** with colocated TypeScript interfaces; persisted stores use `persist(createJSONStorage(() => AsyncStorage))` from `zustand/middleware`; screens subscribe with narrow selectors (`useXStore((s) => s.field)`) or selector helpers (`selectUnreadCount`).
- **Types live next to data.** Backend shapes are declared in the API module or store that owns them (`PatientAppointment`, `QueueTicket`, `MedicalRecords`, `Visit`, …) and imported with `import type`.
- **Comments carry product history.** Many non-obvious decisions are explained in place and reference ticket ids (FE-10/FE-21/FE-23/FE-24/FE-25/FE-26, bug-triage BE-13/FE-30, PR #51, backend BE-11) — a goldmine for Q&A depth.
- **UI is split:** NativeWind `className` in the newer auth screens; `StyleSheet.create` + `COLORS` elsewhere. Shared `custom-button.tsx` is the standard CTA (busy spinner via `isLoading`).
- **Toasts, not inline errors**, for async feedback; `Alert` reserved for confirmations and blocking choices (cancel, pay-surcharge, logout).
- **Read-only data stays read-only**: records/insurance/medical screens render disclaimers rather than editing affordances; only profile + onboarding + insurance PUT paths author data.

## 4. FEATURE MAP — with real file pointers

### 4.1 Patient authentication (`src/lib/api/auth.ts` + `(auth)/` screens)

- **Login by identifier — phone | Ghana Card | PT-code (never email).** `login.tsx`: single `identifier` input ("Phone Number or Ghana Card ID") + password → `login()` posts `{identifier, password}` to `/auth/patient/login` → stores JWT (`setToken`) → `hydrateAfterLogin()` → `router.replace('/(tabs)/home')`.
- **Signup → OTP → auto-set password.** `signup.tsx` posts `/auth/patient/signup`, stashes `{phone, password}` under AsyncStorage key `pulse_pending_signup`, pushes `/(auth)/otp?phone=…`. In signup context `otp.tsx` verifies via `/auth/patient/verify-otp`, reads the stash, calls `login()` with it, then `router.replace('/(onboarding)/step1-identity')`.
- **Forgot/reset + SMS OTP.** `forgot-password.tsx` → `requestPasswordReset` (`POST /auth/patient/password-reset/request`; dev-echo mode returns a `devOtp` for hand-tests) → `otp.tsx` with `context=reset` → `verifyPasswordResetOtp` (`POST …/verify` → `resetToken`) → `new-password.tsx` (`POST …/confirm`) → `reset-success.tsx` → login.
- Resend cooldown handled by `components/auth/resend-timer.tsx`.

### 4.2 Home hero carousel of upcoming visits (`(tabs)/home.tsx` + `cards/upcoming-card.tsx`)

- `home.tsx` hero pages = appointments whose status is in `UPCOMING_STATUSES = {scheduled, confirmed, checked_in}` (line 35), sorted soonest-first (`pages`, lines 146–150), rendered as a **horizontal paging `FlatList`**: `pagingEnabled`, `snapToInterval={cardWidth}` (screen width − 48), `getItemLayout` (fixed card width ⇒ instant `scrollToOffset`), dot pagination, **5-s autoplay** that backs off 6 s after a manual drag and pauses while a card is expanded.
- Refresh on focus (`useFocusEffect`) **and every 10 s**; a poll tick whose rows are unchanged keeps the previous array reference (`sameAppointmentList`, lines 54–73) so hero pages skip re-rendering. Bell badge syncs via `syncUnreadCount()` on focus.
- **Expandable in-card actions.** Tapping a card toggles a single `expandedBookingId` and reveals — inside the same gradient surface — **Reschedule** always, and **Cancel appointment only when `paymentStatus === 'pending'`** (`showCancel`, line 297). Reschedule deep-links to `/(screens)/reschedule` with full booking context in route params (`openReschedule`, lines 222–235). Cancel = confirm `Alert` → `cancelBooking(id)` (`DELETE /api/bookings/{id}`) → success toast (vibrate) → immediate refresh.
- `upcoming-card.tsx` renders the gradient cover, watermark, icon+text chips (payment chip + reference chip), date/time block, and an actions row animated by an `Animated.Value` `maxHeight` 0→132 (260 ms, non-native driver). Exported `React.memo` — poll-driven parents re-render but unchanged cards don't. The surrounding list height is smoothed by `LayoutAnimation` (`animateLayout`, 240 ms ease-in-out opacity, `home.tsx` lines 78–90).
- **The live queue is NOT in the carousel.** Code comment at `home.tsx` ~line 144: "The live queue is NOT part of this carousel — it lives on the Live Queue tab." Empty hero ⇒ `DiscoveryCard` (Book a visit CTA).

### 4.3 Discovery & booking (`(tabs)/book-appointment.tsx` → `(screens)/hospital-details.tsx`)

- **Hospital list + AsyncStorage SWR-style cache.** `book-appointment.tsx` fetches `/mobile/hospitals`, but first paints the last snapshot from AsyncStorage (`pulse_hospitals_list_v1`, 10-min TTL, `readCachedHospitals`/`writeHospitalsCache`, lines ~28–58) and refreshes in the background — explicit defense against Render cold starts blocking first paint. Search bar + filter sheets on top (`utils/hospitals-filter.ts`, `book-appointment/hospitals-filter-sheet.tsx`).
- Tap a card → `hospital-details.tsx` receives the card as route params (`id, name, location, rating, imageUrl, …`). Hero image via **`lib/hospital-images.ts`**: bundled `require()` art keyed by hospital id (`'1'` → `assets/hospitals/facility-night-emergency.jpg`, `'3'` → `facility-modern-campus.jpg`), because the demo backend returns `image: null`; unknown ids fall back to one Unsplash URL. Resolution order: server URL → bundled asset → fallback.
- Department dropdown from `/mobile/hospitals/{id}/departments`; per-department doctor checks via `/departments/{id}/doctors` and a department is bookable only if some doctor has `bookableOnline` (server-computed, PR #51) — otherwise booking would 409 server-side.
- Booking state lives in the **persisted** `useBookingStore`; entering a new hospital calls `reset()` so a previous hospital's department/date can't leak in (comment cites FE-23).
- **Date strip + time-slot picker:** `book-appointment/date-strip.tsx` (horizontal dates, disabled on `closedDates`, struck/unavailable on `fullDates`), `month-selector.tsx`, `time-slot-picker.tsx`; availability from `getAvailability(deptId, from, 14)` → `/mobile/departments/{id}/availability` grouped MORNING/AFTERNOON. Submit → `POST /bookings/mobile {departmentId, date, time}` (`slotTimeToIso` converts "09:00 AM" → "09:00").

### 4.4 Live queue tab (`(tabs)/queue.tsx`, `cards/live-queue-card.tsx`, `lib/api/queue.ts`)

- Screen polls `GET /api/queue/me` every 10 s (`getMyTicket`). A ticket replaces the store ticket; **404 ⇒ `null` ⇒ `clearTicket()`** so a vanished queue never leaves a stale card. Store not persisted (§3.4).
- `live-queue-card.tsx` is **display-only and `React.memo`**: current vs your number, wait time, room, estimated time, booking reference, queue totals. The actions sit on the page beneath it: **"I have arrived"** → `checkIn()` `POST /api/queue/me/check-in` (updates ticket, Alert confirm), **"Cancel ticket"** → confirm Alert → `cancelTicket()` `POST /api/queue/me/cancel` → `clearTicket()`. QR button is a placeholder Alert for now.
- Empty state ("You're not in any queues") when `ticket.hospitalName` is empty. Below the card: Manage Appointment pills (Reschedule → reschedule screen; Directions/Desk/View-more are stub pills) and an `InstructionList` of queue rules (15-min rule, missed-call 3-space shift, QR at reception).

### 4.5 Records (`(tabs)/records.tsx`, `lib/api/records.ts`, `stores/records-store.ts`, `components/records/`)

- Three tabs: `Visits`, `Lab Results`, `Prescriptions` (`TABS`, records.tsx line 33). Home quick-action pills deep-link `?tab=lab | ?tab=prescriptions` (`TAB_BY_PARAM` lines 38–39); a manual tab switch writes the canonical label back into the param so a stale deep link can't override the user.
- Data: `GET /patients/me/records` → `{visits, labResults, prescriptions}`; mock mode returns the store's seed arrays. Backend shapes (records-store.ts): `Visit {department, hospital, date, doctor, summary, symptoms?: string[], recommendations?: string[]}`; `LabResult {testName, hospital, orderingDoctor, date, values: LabValue[]}`; `Prescription {medication, dose (verbatim), prescribingDoctor, hospital, date, instructions?}`.
- Tap → bottom sheets: `visit-detail-sheet.tsx` renders `summary` + Symptoms and Recommendations `DetailLines`; `prescription-detail-sheet.tsx` shows `instructions` only when present; `lab-result-detail-sheet.tsx` lists `values` with reference ranges. All three are read-only by policy ("Pulse does not suggest dosages or refills", "does not interpret or flag results" — footer notes in the sheets).
- Tab-scoped structured filters (`records-filter-sheet.tsx`, `utils/records-filter.ts`, `utils/group-by-recency.ts`) reset on tab switch.

### 4.6 Notifications (`(screens)/notifications.tsx`, `lib/api/notifications.ts`, `stores/notifications-store.ts`, `components/ui/notifications-poller.tsx`)

- Feed screen: refetch on focus + pull-to-refresh; icon style mapped from `type: 'appointment' | 'queue'` with a neutral fallback for unknown future backend types; relative timestamps via `formatDistanceToNowStrict`. Mark-read is optimistic locally then reconciled with the backend (`markReadRemote` PATCH `…/{id}/read`, `markAllReadRemote` POST `…/read-all`, both re-hydrate the returned feed).
- Bell badges (Home + Queue) show the backend count via `syncUnreadCount()` → `GET /patients/me/notifications/unread-count`.
- **Foreground poller** `notifications-poller.tsx` (mounted once in root `_layout.tsx`): every **7 s** while app is active with a token, fetch feed and toast **only brand-new unread** entries (`!n.read && !knownIds.has(n.id)`); queue-type → success-variant toast, else info, `vibrate: true`, tap → notifications screen.
- **Toast host** `toast-provider.tsx`: one toast at a time, **5 s auto-dismiss** (`AUTO_DISMISS_MS = 5000`), optional `Vibration.vibrate(300)`, floating overlay (`zIndex 9999`) above the root Stack so toasts show over any screen/tab.

### 4.7 Payments (`(screens)/payments.tsx`, `components/payments/*`, `lib/api/patient.ts`, `stores/payments-store.ts`)

- Sections: `payments-hero-card`, `outstanding-payments-card`, `saved-methods-card`, `payment-history-card`; add a method via `add-payment-method-sheet.tsx` (`POST /patients/me/payment-methods`).
- Data loads on **focus AND on `AppState` → active** — returning from the hosted Aza checkout must show the webhook's PAID flip without a manual refresh (comments cite bug-triage FE-10/FE-21). When a checkout is in flight (`pendingCheckoutBookingIds`), it polls outstanding until paid or timeout (FE-24/FE-25); the success alert fires exactly when the booking leaves "outstanding".
- Outstanding rows open `pay-booking-sheet.tsx`: creates the checkout and opens it via `Linking` (Safari) — no card capture in-app.

### 4.8 Profile, Medical ID, Insurance, My Appointments (screens)

- `(tabs)/profile.tsx`: `profile-header`, `settings-card`/`settings-row` rows, logout = confirm Alert → `clearToken()` → replace to login (comment: replace, not push, so back can't return to the app). Profile identity from `useProfileStore`.
- `(screens)/medical-id.tsx`: `emergency-id-card` + `emergency-contact-card` + share affordance (`medical/emergency-share-sheet.tsx`); the screen's own copy frames it as "a personal record for your own reference and to share with clinicians", not an official document (see the disclaimer text in the screen, ~line 87).
- `(screens)/health-insurance.tsx`: `insurance-card-hero`, `insurance-details-card`, `insurance-photo-card`; `GET/PUT /patients/me/insurance`, photo upload `POST /uploads/images` (FormData) → stored `cardPhotoUri`.
- `(screens)/my-appointments.tsx`: full booking history with status badges (`STATUS_BADGES`: scheduled→Pending, confirmed→Approved, checked_in→Checked In, completed, cancelled, no_show) and payment badges; rows that are cancelled/completed/no_show deliberately show **no payment badge** (`NO_PAYMENT_BADGE_STATUSES`) so a stale `pending` never flashes "Unpaid" — mirroring the backend's `/outstanding` exclusion.

### 4.9 Reschedule + the earlier-date GH₵20 surcharge flow (`(screens)/reschedule.tsx` — deepest flow in the app)

1. **Entry:** Home-hero deep link carries `bookingId/departmentId/hospitalId/hospitalName/departmentName/doctorName/reference/scheduledAt` as route params (`useLocalSearchParams`, lines 109–129); the Queue-tab Manage pill passes nothing and the screen falls back to the queue ticket (`ticket.bookingId`) then `useBookingStore.getState().lastBookingId` (comments lines 120–129). Non-dismissible warning: rescheduling forfeits your live-queue spot; a "Cons of rescheduling" card lists doctor change + queue rejoin + earlier-date surcharge.
2. **Picker:** DateStrip disabled for `closedDates`, `unavailable` for `fullDates` (each shows a toast explaining why); slots come from `getAvailability` over the same shared mock/API source as Hospital Details. MonthSelector is `readOnly`.
3. **Confirm:** first tries the plain `PATCH /bookings/{id}/reschedule` (`rescheduleBooking`). If the new slot is **earlier**, the backend answers **HTTP 402** `{code: 'EARLIER_RESCHEDULE_SURCHARGE_REQUIRED', surchargeAmount 20.00}`. Guard: `isSurchargeRequired(e)` = `ApiError` + status 402 + that code (lines 40–44). Alert asks to pay **GH₵ 20** now.
4. **Pay & retry** (`paySurchargeThenRetry`, lines 191–261): pick default saved method (`getPaymentMethods`; none ⇒ alert + jump to Payments, no charge), call `payRescheduleSurcharge` (`POST /bookings/{id}/reschedule/surcharge {methodId}`) → `{checkoutUrl, sessionId}` → **`Linking.openURL(checkoutUrl)`** opens hosted Aza checkout (app backgrounds — deliberately no success alert, FE-25 pattern), then `waitForAppActive()` resolves on `AppState` 'active' with a 4-s fail-safe so a failed open can't hang the flow.
5. **Retry loop: 10 × 3 s** re-running the *same* PATCH. Until the webhook stamps the booking, the PATCH still 402s ⇒ keep retrying; first 2xx = success. **No second surcharge POST ever happens** — that is the double-charge protection.
6. **409 slot conflict** (`isSlotNoLongerAvailable`, lines 48–51: 409 + "no longer available|already taken|slot"): friendly "Slot was just taken" alert explaining the GH₵20 is already paid and stays valid on the booking — return to the picker, choose another earlier slot, confirm again; **you will not be charged twice** (exact copy in code). Runs inside the retry loop so it only fires for a slot lost *after* payment.
7. Success → success toast → `router.back()`; the Home 10-s poll then shows the moved appointment. Exhausted retries → "Payment pending" alert inviting a re-confirm.

## 5. DISCUSSION QUESTIONS — with exact answer pointers

1. **How do the expo-router groups map to navigation?** Groups `(auth)/(onboarding)/(tabs)/(screens)` are URL-transparent; only `(tabs)/_layout.tsx` declares a navigator (`Tabs` + Ionicons + raised center FAB via `CustomTabBarButton`), so tabs get the tab bar while every other screen is a child of the root `<Stack>` in `app/_layout.tsx`. `index.tsx` shows `/login` is the plain route path of `(auth)/login.tsx` (`router.replace('/login')`).
2. **How is an API error carried around?** `client.ts` throws `ApiError(status, message, body)` from one `fetch` wrapper; screens catch and show `.message`, or branch on `.status`/`.body`. **401 is centralized**: `handleUnauthorized` clears the token and `router.replace('/(auth)/login')` (client.ts lines 34–41).
3. **Where are 402 and 409 special-cased?** Only in `reschedule.tsx` — `isSurchargeRequired` (402 + code, lines 40–44) and `isSlotNoLongerAvailable` (409 message sniff, lines 48–51). Nowhere else inspects those statuses.
4. **How does the hero decide which bookings render?** `home.tsx` `pages` filters `UPCOMING_STATUSES = scheduled|confirmed|checked_in` and sorts soonest-first (lines 35, 146–150); empty ⇒ `DiscoveryCard`. Statuses typed in `lib/api/appointments.ts`.
5. **Why is the live queue not on Home?** Explicit code comment (home.tsx ~line 144): the hero is upcoming *bookings*; the queue lives on the Queue tab with its own 10-s poll. Also, home.tsx no longer needs to fetch the ticket at all.
6. **Why are the cards memoized and `getItemLayout` defined?** `upcoming-card.tsx` + `live-queue-card.tsx` are `React.memo` because parents re-render on 10-s polls / `expandedBookingId` changes; memo skips unchanged cards. `getItemLayout` + `snapToInterval={cardWidth}` (home.tsx lines 179–186, 342) give the pager exact offsets, so `scrollToOffset` (autoplay, dot taps) is instant and FlatList never measures variable heights.
7. **How does a no-change poll avoid re-rendering?** `sameAppointmentList` (home.tsx lines 54–73) compares only display-relevant fields and returns the old array reference when equal — `setAppointments` with an identical reference lets React bail out.
8. **How does mock vs real switching work?** `lib/use-mock.ts` — `isMockMode() = EXPO_PUBLIC_USE_MOCK !== 'false'` (unset ⇒ mock). `.env` pins `false`. Every function in `lib/api/*` checks it and returns seeds (e.g. `queue.ts` `MOCK_TICKET`, `auth.ts` `mock-patient-token`, `discovery.ts` mock hospitals).
9. **How is mock availability generated?** `services/mock/hospital-schedule.ts`: 800 ms fake latency; 30 days; closed Sundays; ~10% full days; MORNING/AFTERNOON blocks with per-slot random `available` — one slot always free, one always taken. Shape shared by Hospital Details and Reschedule.
10. **How do OTP screens validate the phone?** `lib/phone.ts` — strip spaces/dashes then match `^0\d{9}$` or `^\+233\d{9}$`; `PHONE_ERROR_MESSAGE` otherwise. Mirrors backend `GhanaPhoneValidator` (comment: bug-triage BE-13/FE-30).
11. **How does the notifications poller avoid toast spam?** `notifications-poller.tsx`: `polling` re-entrancy guard, no fetch before a token exists, `disposed` checks after awaits, AppState start/stop (never polls in background), **first fetch is a baseline** when the store is empty (`isBaseline`), and toasts only fire for `!read && !knownIds.has(id)` — genuinely new since the last tick.
12. **How does the surcharge flow avoid double-charging after the webhook?** The client POSTs the surcharge checkout **exactly once**; then it only replays the same PATCH every 3 s × 10 (reschedule.tsx lines 229–251). The webhook flips the booking server-side, making the retried PATCH succeed. A 409 mid-retry surfaces "already paid and stays on this booking — you will not be charged twice".
13. **What happens to the GH₵20 if the slot is taken mid-payment?** `isSlotNoLongerAvailable` (409 check inside the retry loop) diverts to the friendly alert and returns `'pending'` — payment stands, patient picks another earlier slot, no new charge.
14. **Where is the hospitals AsyncStorage cache?** `(tabs)/book-appointment.tsx` (~lines 28–58): key `pulse_hospitals_list_v1`, TTL 10 min, cache-first paint then background refresh — hides Render cold starts. Other persistence is zustand `persist` (`createJSONStorage(() => AsyncStorage)`) in 7 stores; `queue-store.ts` and `notifications-store.ts` are intentionally not persisted.
15. **How does the queue tab keep its ticket fresh and clear stale ones?** `queue.tsx` polls every 10 s; `getMyTicket` returns the live ticket or **`null` on 404**, and null ⇒ `clearTicket()` — no stale card from an earlier session/day (see the KNUST/Dr. Boateng regression note in `queue-store.ts`).
16. **How do deep screens get context via router params?** `useLocalSearchParams`; Home builds the reschedule params explicitly (`openReschedule`, home.tsx lines 222–235 — `bookingId`, `departmentId`, `hospitalId`, names, `reference`, `scheduledAt`). Records accepts `?tab=lab|prescriptions` (`records.tsx` `TAB_BY_PARAM`) and rewrites the param to the canonical label on manual switch.
17. **How are backend records mapped into the UI?** `GET /patients/me/records` → typed `MedicalRecords` (records.ts) with shapes in `records-store.ts`; detail sheets render array fields as `DetailLines` and hide absent sections (e.g. `Prescription.instructions` only when present); lab values show `referenceRange` as text, never judged.
18. **How do toast + vibration work?** `toast-provider.tsx`: `show()` enqueues; one visible at a time; optional `Vibration.vibrate(300)`; auto-dismiss after 5 s; `advance(id)` pops only if still head so a stale timer can't skip a toast. Mounted around the root Stack → floats over any screen.
19. **Why both `Animated` and `LayoutAnimation` for the expand?** Inside the card, the actions container's `maxHeight` animates 0→132 (`Animated.timing`, 260 ms, `useNativeDriver: false` — layout props can't use the native driver). Outside, `home.tsx` `animateLayout()` runs a 240 ms `LayoutAnimation` so the surrounding list re-flows on the same beat; try/catch for new-arch quirks.
20. **What does login do after the JWT arrives?** `login.tsx`: `login()` (auth.ts stores token) → `hydrateAfterLogin()` fires six store groups in one `Promise.allSettled` round (`lib/api/hydrate.ts`, FE-26) → `router.replace('/(tabs)/home')`.
21. **How does auth differ mock vs live?** Mock: `login`/`verifyOtp` fabricate `mock-patient-token`; signup/reset resolve after fake delays. Live: real endpoints in `auth.ts`; reset supports a dev-echo `devOtp` for hand-tests.
22. **What stops 401s from bouncing the user repeatedly?** Centralized in `client.ts` — one 401 handler per request clears the token and routes to login; screens don't reimplement it. The poller swallows the resulting failure and keeps prior state.
23. **What happens on cold launch — is there a token guard?** `index.tsx`: branded splash, heartbeat logo animation, then unconditionally `router.replace('/login')` after 3 s — no token check, no deep restore to tabs. Session survival is only token-in-AsyncStorage + your own re-login.
24. **How does the bell badge stay accurate across the app?** `syncUnreadCount()` runs on Home mount and every focus (home.tsx `useFocusEffect` lines 129–135); the poller's `hydrateFromApi` keeps the store current between focuses; Notifications' mark-read actions re-hydrate the returned feed.
25. **Where does Reschedule get context when opened with no params (Queue tab pill)?** Resolution chain in `handleConfirm`/effects (lines 148, 270–274): route `bookingId` → `useBookingStore.lastBookingId` → ticket's `bookingId`. Display labels prefer route params, then the queue ticket, then the booking store (lines 170–175). Availability defaults to department from route → booking store → `HOSPITAL_ID = 'knust-university-hospital'`, 14 days from the first of the current month.
26. **What is the product stance on medical content?** Read-only everywhere: `records-store.ts` header comment ("the patient can view them, never author or edit one"), `prescription-detail-sheet.tsx` footer ("Pulse does not suggest dosages or refills — for changes, contact the prescribing doctor"), `lab-result-detail-sheet.tsx` footer ("Values are shown exactly as recorded… Pulse does not interpret or flag results"), and the medical-id screen disclaimer.

## 6. Gotchas worth telling the audience

- **Repo & ownership:** main/deploy repo is `housebuoy/pulse-mobile` (verified remote); owner **kquarcoo merges PRs**. Work happens on feature branches; the local checkout sits on **`develop`** with `origin/develop` and `origin/main` both present (verified branches). Present from `develop` and don't present unmerged branches as shipped.
- **Expo Go must match the SDK:** the project targets **Expo SDK 57 / RN 0.86.3** (`package.json`). Expo Go supports one SDK generation at a time, so the demo iPhone's Expo Go must support SDK 57 or the bundle refuses to load.
- **iOS Local Network permission:** `npx expo start` + Expo Go on a physical iPhone can trigger an iOS **Local Network** prompt so the phone can reach the Metro bundler on your machine — allow it or the app hangs on "Downloading bundle". (The API is remote HTTPS on Render, so this permission is about Metro, not the backend.)
- **Live API on Render = cold starts:** the first request after idle can take seconds. The hospital-list AsyncStorage cache (10-min TTL) exists to hide that; don't misdiagnose a cold start as a bug.
- **Mock mode is the fallback:** `.env` pins `EXPO_PUBLIC_USE_MOCK=false`, but anywhere the var is unset the app runs on mock seeds. A demo suddenly showing canned data (KNUST/Dr. Arhin ticket, mock bookings) means the env, not the code.
- **Styling is split-brain:** NativeWind/Tailwind is fully plumbed (metro, babel `jsxImportSource`, `global.css` in root layout) but only ~8 of 83 `.tsx` files actually use `className` (auth screens, splash, emergency banner); the rest is `StyleSheet.create` + `COLORS`. Say "mostly StyleSheet, NativeWind adopted in the auth flow" — not "the app is Tailwind".
- **TS2882 css-import debt — fixed by declaration:** TypeScript 6 flags side-effect-only imports; the `global.css` import in the root layout tripped it until `nativewind-env.d.ts` added `declare module '*.css';` (the file documents this itself). `npx tsc --noEmit` is the verification gate and should pass today.
- **ESLint baseline debt + no CI:** `npm run lint` = eslint + prettier check, and deliberate `eslint-disable` comments exist (e.g. home.tsx exhaustive-deps). There is **no CI configuration in this checkout** (no `.github/` locally), so the gates run by hand, not in a pipeline.
- **Some UI is knowingly stubbed/static:** live-queue-card QR shows a placeholder Alert; Home's "Recent Visits" cards and health-tip banner are hardcoded content (`home.tsx`); Directions/Desk/View-more pills in the queue tab have no handlers. Fine for a demo — don't over-claim them as live.
- **Backend facts live outside this repo:** the surcharge webhook stamping (`rescheduleSurchargePaidAt`), the 402/409 contract shape, and queue/records semantics are server behavior; PULSE MOBILE only implements the client side of those contracts (see contract comments in `reschedule.tsx` and `discovery.ts`). If an audience question goes deeper than the endpoints listed in §3.3, the answer is in the backend repo, not here.

---

## Appendix A — File inventory (complete, for fast pointer-during-Q&A)

All paths verified via `find`. Purpose one-liners only where not already described above.

**Routes — `src/app/`** (24 files incl. 2 layouts)
`_layout.tsx` (root Stack + ToastProvider + poller) · `index.tsx` (splash) ·
`(auth)/login.tsx signup.tsx otp.tsx forgot-password.tsx new-password.tsx reset-success.tsx` ·
`(onboarding)/step1-identity.tsx step2-clinical.tsx step3-family.tsx` ·
`(tabs)/_layout.tsx` (Tabs navigator) `(tabs)/home.tsx book-appointment.tsx queue.tsx records.tsx profile.tsx` ·
`(screens)/hospital-details.tsx reschedule.tsx my-appointments.tsx notifications.tsx payments.tsx health-insurance.tsx medical-id.tsx`

**Components — `src/components/`** (59 files)
`ui/`: `category-pills custom-button divider dropdown-menu emergency-banner header-badge hospital-card native-only-animated-view notifications-poller search-bar toast-banner toast-provider` ·
`cards/`: `discovery-card health-tip-banner live-queue-card quick-action upcoming-card visit-history` ·
`auth/`: `resend-timer` ·
`book-appointment/`: `ask-ai-sheet date-strip hospitals-filter-sheet month-selector time-slot-picker` ·
`queue/`: `instruction-list` ·
`records/`: `category-tab lab-result-card lab-result-detail-sheet medical-banner medical-record-card prescription-card prescription-detail-sheet record-detail-sheet record-list-card records-filter-sheet visit-detail-sheet` ·
`payments/`: `add-payment-method-sheet network-badge outstanding-payments-card pay-booking-sheet payment-history-card payments-hero-card saved-methods-card` ·
`insurance/`: `insurance-card-hero insurance-details-card insurance-photo-card` ·
`medical/`: `editable-chip-list emergency-contact-card emergency-id-card emergency-share-sheet medications-card record-vitals-modal vitals-log-card` ·
`profile/`: `profile-header settings-card settings-row` ·
`shared/`: `section-header tab-navigator` · root: `progress-header.tsx` (exports `TopProgressBar`, `FormHeading`)

**API — `src/lib/api/`** (9 files)
`client.ts auth.ts patient.ts discovery.ts queue.ts appointments.ts records.ts notifications.ts hydrate.ts`

**Stores — `src/stores/`** (9 files)
`booking-store hospitals-store insurance-store medical-store notifications-store payments-store profile-store queue-store records-store`
(persisted: all except `queue-store` + `notifications-store`)

**Lib / constants / utils / services**
`src/lib/`: `phone.ts hospital-images.ts use-mock.ts theme.ts` ·
`src/constants/`: `theme.ts departments.ts medical-category.ts` ·
`src/utils/`: `search.ts hospitals-filter.ts records-filter.ts group-by-recency.ts` ·
`src/services/mock/`: `hospital-schedule.ts` ·
`assets/hospitals/`: `facility-modern-campus.jpg facility-night-emergency.jpg`

**Root config**
`app.json` · `babel.config.js` (nativewind + worklets plugins) · `metro.config.js` (`withNativeWind`) · `tailwind.config.js` · `global.css` · `nativewind-env.d.ts` · `tsconfig.json` (`@/*` → `./src/*`, strict) · `eslint.config.js` · `prettier.config.js` · `package.json` · `README.md` · `ARCHITECTURE.md` · `docs/bug-triage-frontend.md` · `.env` / `.env.example`
