# Bespoke Fitness — Feature Roadmap & Backlog

A living document for planning. Add ideas freely; move them between sections as priorities shift.

---

## ⚠️ Launch Blockers

Must be addressed before opening the site to other users.

- [x] **Data persistence** — Classes, class signups, membership types, session packs, members, payments, sessions, and feed now persist to Supabase (migrations `0001`, `0003`). `AppState.loadData` hydrates on login.
- [ ] **Row Level Security (RLS)** — New tables are covered (`0002`). **Still needed:** existing tables (`members`, `profiles`, `documents`, `member_documents`) have no RLS. IMPORTANT: `loadData` now bulk-selects `members` for every logged-in user, so a member could read all members' PII until this lands. Do before opening to users.
- [ ] **Mobile / responsive pass** — Audit layout for phone use (fixed sidebar + multi-column grids are desktop-shaped today). Clients will book from phones.

---

## 💡 Feature Ideas

### High Value (improve the core loop)

- [ ] **Real Stripe Checkout** — Let clients self-pay / subscribe instead of the trainer recording payments manually. Auto-extend `membership_expiry` on successful payment. (`SignupForm` type already has card fields.)
- [ ] **Trainer availability for 1-on-1s** — Define open slots; clients book into real availability instead of free-form requesting a time. Removes approval back-and-forth.
- [ ] **Automated reminders & confirmations** (Resend already wired) — Booking confirmation, 24h session reminder, membership-expiring-soon nudge.
- [ ] **Waitlists** — Join a waitlist when a class is full; auto-promote on cancellation.

### Bespoke-Fitness Flavor (personal-training differentiators)

- [ ] **Client progress tracking** — Body metrics, goals, before/after photos, workout logs. Core differentiator for a "bespoke" studio vs. a generic class booker.
- [ ] **Cancellation policy / booking windows** — Block cancellations within X hours; open bookings only N days ahead.
- [ ] **Google Calendar sync** — Finish wiring the existing `googleCalendarEnabled` flag on `Member` so booked sessions land on the client's calendar.

### Polish / Nice-to-Have

- [ ] **Recurring class schedules** — Classes appear single-instance today; support repeating weekly schedules.
- [ ] **Member-facing payment history & receipts**
- [ ] **PWA install** — Make it feel like a native app on phones.
- [ ] **Close cross-tab password-recovery gap** — The `inPasswordRecovery` guard is an in-memory ref; an already-open tab can slip into the app during a reset. Promote the flag to `localStorage` + a `storage` listener so all tabs respect recovery.

---

## ✅ Done

- Class scheduling (trainer-created, member sign-up, weekly limits, credits)
- Manual payment recording (Cash / Zelle / Stripe) with membership extension
- 1-on-1 session booking (request → trainer confirm/cancel)
- Supabase auth (trainer password, client magic link)
- Document onboarding flow with trainer approval + email notifications
- Access gating (awaiting approval / payment required screens)
- Password reset flow (trainer)
- Trainer feed (posts, likes, comments)
- Nav gating so un-approved clients can't reach Schedule View / Payments
- Supabase persistence for all app data (was in-memory) + RLS on new tables
- Product-based Record Payment flow (pick membership or session pack, auto price)
- Trainer-configurable session packs (admin tab) + per-member membership history
- Class credits usable independently of membership status

---

## 📝 Notes / Parking Lot

_Drop half-formed ideas here to flesh out later._
