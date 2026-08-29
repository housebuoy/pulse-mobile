# Pulse Mobile — Frontend Bug Triage

> Master triage doc for the mobile test pass (live backend on Render, mock OFF).
> Each section maps to a GitHub issue (links in each header). Hand to the FE engineer (housebuoy/pulse-mobile).
> Tested: Aug 29, 2026 — Expo Go on iPhone, against `https://pulse-o3gj.onrender.com/api`.

**Systemic finding:** 7 of 9 issues are the same bug class — *UI that renders as tappable but has no handler* (commented-out props, empty `() => {}`, or missing `onPress`). Do a full sweep for these patterns across the app, not just the reported rows.

| Issue | GitHub | Severity | One-liner |
|---|---|---|---|
| FE-1 | [#7](https://github.com/housebuoy/pulse-mobile/issues/7) | medium | Home "View Details" dead |
| FE-2 | [#8](https://github.com/housebuoy/pulse-mobile/issues/8) | medium | Home quick pills dead (Lab Results / Prescriptions / Pay Bill) |
| FE-3 | [#9](https://github.com/housebuoy/pulse-mobile/issues/9) | medium | Home "See All" dead |
| FE-4 | [#10](https://github.com/housebuoy/pulse-mobile/issues/10) | high | Queue "Yes, Cancel" dead — ⛔ blocked on backend cancel endpoint |
| FE-5 | [#11](https://github.com/housebuoy/pulse-mobile/issues/11) | medium | Queue notification bell dead |
| FE-6 | [#12](https://github.com/housebuoy/pulse-mobile/issues/12) | medium | Queue Directions / Desk / View more info dead |
| FE-7 | [#13](https://github.com/housebuoy/pulse-mobile/issues/13) | high | Reschedule "No booking to reschedule" |
| FE-8 | [#14](https://github.com/housebuoy/pulse-mobile/issues/14) | critical | Payments app crash on "Pay" — root cause pending |
| FE-9 | [#15](https://github.com/housebuoy/pulse-mobile/issues/15) | medium | Profile settings rows dead (5 rows) |

---

## FE-1 · Home — "View Details" button is dead (queue card) — [#7](https://github.com/housebuoy/pulse-mobile/issues/7)

- **Screen:** Home (`src/app/(tabs)/home.tsx`) — hero `LiveQueueCard` (shows "Korle Bu Teaching Hospital" ticket)
- **Root cause:** `home.tsx:89` — the `onViewDetails` prop is **commented out**: `// onViewDetails={() => router.push('/(tabs)/queue')}`. The button renders **unconditionally** (`src/components/cards/live-queue-card.tsx:155` — `onPress={onViewDetails}`), so it presses `undefined` → silent no-op.
- **Fix:** Uncomment the prop: `onViewDetails={() => router.push('/(tabs)/queue')}`

## FE-2 · Home — Quick-action pills are dead (Lab Results / Prescriptions / Pay Bill) — [#8](https://github.com/housebuoy/pulse-mobile/issues/8)

- **Screen:** Home (`src/app/(tabs)/home.tsx`) — horizontal pill row
- **Root cause:** `home.tsx:109–122` — three `TouchableOpacity`s with **no `onPress`** at all (styling only).
- **Fix (suggested):** Wire navigation to existing screens:
  - **Lab Results** → Records tab `router.push('/(tabs)/records')` (data: `GET /api/patients/me/records` — live)
  - **Prescriptions** → Medical ID screen `router.push('/(screens)/medical-id')`
  - **Pay Bill** → Payments screen `router.push('/(screens)/payments')`

## FE-3 · Home — "See All" (Recent Visits) does nothing — [#9](https://github.com/housebuoy/pulse-mobile/issues/9)

- **Screen:** Home (`src/app/(tabs)/home.tsx`) — Recent Visits section header
- **Root cause:** `home.tsx:132` — `onActionPress={() => {}}` is an **empty handler** (placeholder).
- **Fix (suggested):** Navigate to Records tab (`router.push('/(tabs)/records')`) or create a visit-history list screen (data source: `GET /api/patients/me/records`).

## FE-4 · Live Queue — "Yes, Cancel" confirmation does nothing — [#10](https://github.com/housebuoy/pulse-mobile/issues/10)

- **Screen:** Live Queue tab (`src/app/(tabs)/queue.tsx`) — Cancel Ticket alert
- **Root cause (FE part):** `queue.tsx:77–81` — the Alert's destructive button has **no `onPress`**: `{ text: 'Yes, Cancel', style: 'destructive' }`. Additionally, `src/lib/api/queue.ts` has **no cancel function** (only `getQueue` / `checkIn`).
- **⚠️ Dependency — blocked on backend:** there is NO patient-scoped cancel endpoint. `PATCH /api/queue/entries/{id}` is staff-only (patients get 403) and takes a staff-facing entry id. Backend ships `POST /api/queue/me/cancel` (tracked in psam-717/pulse, **BE-2**), then wire: button → API call → refresh ticket (`setTicket(null)`).

## FE-5 · Live Queue — notification bell does nothing — [#11](https://github.com/housebuoy/pulse-mobile/issues/11)

- **Screen:** Live Queue tab (`src/app/(tabs)/queue.tsx`) — header
- **Root cause:** `queue.tsx:98–101` — `IconButton` with **no `onPress`** (same pattern as Home bell at `home.tsx:68–72`).
- **Fix (suggested):** Wire to a notifications screen when one exists, or remove the badge/button until then.

## FE-6 · Live Queue — Manage Appointment pills dead (Directions / Desk / View more info) — [#12](https://github.com/housebuoy/pulse-mobile/issues/12)

- **Screen:** Live Queue tab (`src/app/(tabs)/queue.tsx`) — Manage Appointment section
- **Root cause:** `queue.tsx:134–157` — three `TouchableOpacity`s with `activeOpacity` but **no `onPress`**.
- **Fix (suggested):** Wire per intent: Directions → map link (`Linking.openURL('maps:...')` with hospital address); Desk → front-desk phone (`Linking.openURL('tel:...')`); View more info → hospital details screen or info modal.

## FE-7 · Reschedule — "No booking to reschedule" toast (design flaw) — [#13](https://github.com/housebuoy/pulse-mobile/issues/13)

- **Screen:** Reschedule (`src/app/(screens)/reschedule.tsx`)
- **Root cause:** `reschedule.tsx:177–181` reads `useBookingStore.getState().lastBookingId`. That value is only populated when a booking is completed **through the app in the same session** (`hospital-details.tsx:297` — `setLastBookingId(id)` after `bookMobile`). It is `null` for bookings made before this session (seeded data), bookings made by other means (test scripts), or after a fresh install. The error message is thrown **client-side before any API call** — the backend is never contacted.
- **Fix (suggested — recommended):** Stop relying on the transient store value. Fetch the patient's real bookings via **`GET /api/patients/me/bookings`** (backend endpoint exists and is live) in the reschedule screen and pick the active/upcoming one (or let the user pick). Pass the chosen `bookingId` into `rescheduleBooking(bookingId, ...)`. Keep `setLastBookingId` as a fallback only.
- **Backend note (verified):** Contract is fine — `PATCH /api/bookings/{id}/reschedule` accepts `{"newDate": "...", "newTime": "..."}` (`RescheduleRequest` DTO), which matches `discovery.ts rescheduleBooking()` exactly. No backend change needed.

## FE-8 · Payments — app crashes on "Pay {amount}" — [#14](https://github.com/housebuoy/pulse-mobile/issues/14) — ROOT CAUSE PENDING

- **Screen:** Payments (`src/app/(screens)/payments.tsx` → `components/payments/pay-booking-sheet.tsx`)
- **Repro:** Tap **Pay Now** (outstanding row or hero Pay All) → sheet opens → tap **Pay GH₵ 330** → **app crashes**.
- **Investigated (verified live):**
  - Backend checkout works: `POST /api/patients/me/payments` → `{"checkoutUrl":"https://pay.aza.systems/c/cs_test_mock_…","sessionId":…}` (Aza **mock** gateway — `AZA_API_KEY` not set on Render).
  - Backend validates cleanly: empty bookingIds / null methodId / unknown method → 400 with guidance message (no server 500 path).
  - FE JS path is fully wrapped: `pay-booking-sheet.tsx:35–50` try/catch → Alert; store `payBookings` (`payments-store.ts:163–178`) → `Linking.openURL(checkoutUrl)`.
- **Hypotheses:**
  1. Crash at `Linking.openURL` native handoff (Expo Go iOS) — needs the actual error screen text to confirm.
  2. Amount mismatch clue: sheet showed **330** but API returns **350** for the Cardiology booking → store may show **stale persisted data** (zustand persist `pulse-payments-store`), so `hydrateFromApi` may have failed on-device → `bookingIds`/`methodId` become `NaN` → `null` in the JSON body.
- **⚠️ Action needed from tester:** screenshot or exact text of the crash (Expo Go red screen) + whether the app closes entirely vs error screen + exact amount shown.
- **Fix (direction):** guard `Linking.openURL` with `canOpenURL` + try/catch + fallback (copy URL / in-app WebView), and make the store refresh-fail-safe (never keep seeds as "real"). **Provider decision: keep Aza** (backend fix tracked as BE-3 in psam-717/pulse — set live `AZA_API_KEY` on Render).

## FE-9 · Profile — settings rows dead — [#15](https://github.com/housebuoy/pulse-mobile/issues/15)

- **Screen:** Profile tab (`src/app/(tabs)/profile.tsx`) — App Settings + Support & Exit cards
- **Root cause:** `SettingsRow` (`src/components/profile/settings-row.tsx:27–31`) always renders a `TouchableOpacity` with a chevron, but rows without an `onPress` prop receive `undefined` → tap does nothing. Rows missing handlers in `profile.tsx`:
  - Family & Dependents — `:40–43`
  - Security & PIN — `:63–66`
  - Language — `:67–71`
  - Help & Support — `:75–78`
  - Log Out — `:79–83` (has `isDestructive` styling only, no action)
- **Fix (suggested):**
  - **Log Out** (easy, no new screen): wire `onPress` → `clearToken()` (already exists in `src/lib/api/client.ts:30` — clears AsyncStorage + routes to `/(auth)/login`). Optionally add a confirm `Alert` first.
  - **Security & PIN / Language / Help & Support / Family & Dependents:** no target screens exist — either build minimal screens (PIN setup, locale picker, support/FAQ, dependents) or remove the rows until shipped. Do not ship tappable-looking dead rows.
  - Component-level: `SettingsRow` should hide the chevron (or disable) when no `onPress`/`isSwitch` is provided.

---

## Notes

- Everything above is **UI wiring only** — the data layer behind each destination (records, queue, payments, bookings) is already live and verified against the backend.
- Working as verified: patient login, booking flow (hospitals → departments → slots → confirm), queue check-in, queue ticket display, payments data loading.
- Cross-repo dependencies: FE-4 ↔ backend BE-2 (queue cancel endpoint), FE-8 ↔ backend BE-3 (Aza live key). Both tracked in `psam-717/pulse`.
