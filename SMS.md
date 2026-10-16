# SMS Reselling Service — Development Plan

Status: **planning draft** — no code written yet. This document defines the business
model (pricing/margin), the account & key lifecycle, and how the service plugs into
the existing `tidjanibrothers.com` codebase as a new core service, alongside the
Odoo/web-design business.

Upstream provider: **1s2u** (`https://api.1s2u.io/bulksms`), HTTP GET/POST, one-way
SMS only. We hold **one** 1s2u account (one `username`/`password`) and resell capacity
to many of our own customers, each isolated by API key + Sender ID (SID).

---

## 0. Business model in one paragraph

We are a **middleman**: 1s2u bills *us* per SMS sent through *our* master account.
We bill *our* customers per SMS (or per prepaid credit bundle) at a markup, through
*our own* API. Customers never see 1s2u's username/password or URL — they only ever
talk to `api.tidjanibrothers.com/sms/v1/...` with an API key we issue them. Our
gateway re-signs every request with the 1s2u master credentials before forwarding it.

---

## 1. Constraints pulled from the 1s2u reference (binding on our design)

| Constraint | Value | Impact on our design |
|---|---|---|
| Recipients per request | max 30 numbers, comma-separated | We must chunk any customer request >30 recipients into multiple upstream calls transparently |
| Message length | up to 5 parts; 153 chars/part (GSM-7), 67 chars/part (Unicode) | Billing must be **per part**, not per message |
| Sender ID (SID) length | 15 chars if numeric-only, 11 chars if alphanumeric; `+` must be URL-encoded if used | Validate at SID-registration time, not at send time |
| Rate limit | 30 req/s per 1s2u account; 150 req/s per IP | Our outbound gateway must throttle *below* 30 req/s in aggregate across **all** our customers, since we share one upstream account. This is the hard ceiling that drives our own per-customer rate limits. |
| Message types | `mt=0` plain (GSM-7/English), `mt=1` Unicode (hex-encoded) | Our API accepts UTF-8 text and auto-selects `mt` + hex-encodes when non-GSM-7 chars are present |
| Response | `OK: <id>` or `ERROR: <code>` | We normalize this into a JSON response and store the upstream id for reconciliation |
| Error codes | `0000,000,00,0020,0030,0041,0042,0050,0051,0060` | Mapped to stable customer-facing error codes (see §7) |
| No delivery receipts documented | — | **Open question for 1s2u support** — confirm if a DLR callback/webhook exists outside this doc. Until confirmed, `SmsMessage.status` only reflects submission success, not actual handset delivery. |

---

## 2. Pricing & margin strategy

**We do not have 1s2u's actual per-SMS cost yet** — the reference page describes the
API mechanics, not the price list (1s2u prices per-corridor/network and it's
typically negotiated per account volume). Everything below is a **pricing model**
with illustrative placeholder costs you must replace with the real figures from your
1s2u contract/account manager before launch. The formula and margin bands are the
actual deliverable; the numbers are examples.

### 2.1 Cost basis (fill in from 1s2u invoice/rate card)

| Corridor | Example upstream cost (FCFA/SMS part) | Status |
|---|---|---|
| Cameroon — MTN | *TBD* | Need 1s2u rate card |
| Cameroon — Orange | *TBD* | Need 1s2u rate card |
| Other CEMAC countries | *TBD* | Need 1s2u rate card |
| Rest of Africa | *TBD* | Need 1s2u rate card |
| International (outside Africa) | *TBD* | Need 1s2u rate card |
| Unicode surcharge | 1s2u doesn't document a surcharge; assume same cost/part as plain, but part size shrinks from 153→67 chars, so a long Unicode message costs more parts | — |

Store this as a `SmsRateCard` table keyed by `(countryCode, network?)` rather than a
constant, since 1s2u rates differ by destination and will change over time.

### 2.2 Margin formula

```
sell_price_per_part = upstream_cost_per_part × (1 + margin_pct) , rounded up to the
nearest pricing_unit (e.g. nearest 1 FCFA, or nearest $0.001)
```

Recommended margin bands (typical for SMS resale businesses; tune once real cost is
known — gross margin on SMS resale commonly lands 35–70%):

| Plan | Margin over upstream cost | Who it's for |
|---|---|---|
| Pay-as-you-go | 70–100% | Low-volume, no commitment, highest margin to offset support overhead |
| Business (prepaid bundle) | 45–60% | Most customers; buys a credit bundle up front |
| Volume / Enterprise | 25–40% | High-volume customers (>100k SMS/mo); negotiated, still profitable |

### 2.3 Example retail price table (FCFA, Cameroon corridor, illustrative only)

| Package | Credits (= SMS parts) | List price (FCFA) | Effective price/part | Validity |
|---|---|---|---|---|
| Starter | 500 | 7 500 | 15 | 90 days |
| Business | 5 000 | 60 000 | 12 | 180 days |
| Growth | 20 000 | 200 000 | 10 | 365 days |
| Enterprise | ≥100 000 | Custom quote | Negotiated | Negotiated |

Pay-as-you-go (no bundle): slightly above the Starter per-part rate, billed from a
revolving wallet, to reward prepayment/commitment.

### 2.4 Billing unit

Bill in **parts**, not messages — a 2-part Unicode message consumes 2 credits. This
matches how 1s2u itself counts cost (153/67-char segmentation) and avoids us eating
the margin on long messages.

### 2.5 Open inputs needed from you before this section is final

1. Real 1s2u cost per SMS/part for Cameroon (MTN + Orange) — our primary corridor.
2. Whether 1s2u bills us in FCFA, XAF, or USD, and at what FX/settlement terms.
3. Target margin — confirm the bands above or supply your own.
4. Payment collection method for customers (mobile money, bank transfer, card) — no
   payment processor exists in this codebase yet (see §8).

---

## 3. Account lifecycle (activate / deactivate)

New Prisma model `SmsAccount` — one row per **reselling customer** (distinct from the
internal `User` table, which is staff/admin only).

```prisma
enum SmsAccountStatus {
  PENDING    // created by admin, no active keys yet
  ACTIVE
  SUSPENDED  // temporary, e.g. non-payment — reversible
  DISABLED   // terminal, admin-only, requires reactivation decision
}

model SmsAccount {
  id            String            @id @default(cuid())
  companyName   String
  contactName   String
  contactEmail  String            @unique
  contactPhone  String
  status        SmsAccountStatus  @default(PENDING)
  creditBalance Int               @default(0)   // in parts/credits
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  apiKeys       SmsApiKey[]
  messages      SmsMessage[]
  transactions  SmsCreditTransaction[]
  statusEvents  SmsAccountStatusEvent[]
}

model SmsAccountStatusEvent {
  id         String            @id @default(cuid())
  accountId  String
  fromStatus SmsAccountStatus?
  toStatus   SmsAccountStatus
  reason     String?
  actorId    String?            // staff User.id who made the change
  createdAt  DateTime           @default(now())

  account SmsAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  actor   User?      @relation(fields: [actorId], references: [id])
}
```

This mirrors the existing `Lead`/`LeadStatusEvent` and `QuoteRequest`/
`QuoteStatusEvent` audit-trail pattern already in `prisma/schema.prisma` — reuse it
rather than inventing a new convention.

**Enforcement rule:** every inbound send request checks `account.status === "ACTIVE"`
*in addition to* the API key and SID both being valid/unblocked. Suspending or
disabling an account must take effect immediately — check status on every request,
not just at key-issue time — since this is the admin's kill switch for non-payment or
abuse.

Admin actions (server actions, same shape as `lib/actions/leads.ts::updateLeadStatus`):
`activateAccount`, `suspendAccount(reason)`, `disableAccount(reason)`,
`reactivateAccount`. Each writes a `SmsAccountStatusEvent` row for the audit trail
visible in the admin UI.

---

## 4. API keys ↔ Sender ID (SID) model

Rules from the brief: one account → many API keys; each API key → exactly one SID;
SIDs are globally unique; super admin can block/ban any SID at any time.

```prisma
enum SmsSenderIdStatus {
  PENDING_REVIEW  // submitted, awaiting manual approval (carriers vet sender names)
  APPROVED
  BLOCKED         // admin-banned — independent of the owning account's status
  REJECTED        // never approved
}

model SmsSenderId {
  id         String            @id @default(cuid())
  value      String            @unique   // the actual SID text, globally unique
  accountId  String
  status     SmsSenderIdStatus @default(PENDING_REVIEW)
  blockedReason String?
  createdAt  DateTime          @default(now())
  updatedAt  DateTime          @updatedAt

  account      SmsAccount              @relation(fields: [accountId], references: [id])
  apiKeys      SmsApiKey[]
  statusEvents SmsSenderIdStatusEvent[]

  @@index([status])
}

model SmsSenderIdStatusEvent {
  id          String             @id @default(cuid())
  senderIdId  String
  fromStatus  SmsSenderIdStatus?
  toStatus    SmsSenderIdStatus
  actorId     String?
  createdAt   DateTime           @default(now())

  senderId SmsSenderId @relation(fields: [senderIdId], references: [id], onDelete: Cascade)
  actor    User?       @relation(fields: [actorId], references: [id])
}

model SmsApiKey {
  id          String   @id @default(cuid())
  accountId   String
  senderIdId  String   @unique   // 1 key : 1 SID, enforced at the DB level
  label       String             // customer-facing name, e.g. "Production key"
  keyPrefix   String             // first 8 chars shown in the UI, e.g. "stb_live_a1b2c3"
  keyHash     String   @unique   // bcrypt hash of the full secret, never store plaintext
  revokedAt   DateTime?
  lastUsedAt  DateTime?
  createdAt   DateTime @default(now())

  account  SmsAccount  @relation(fields: [accountId], references: [id])
  senderId SmsSenderId @relation(fields: [senderIdId], references: [id])
  messages SmsMessage[]
}
```

Why `senderIdId @unique` on `SmsApiKey`: a one-to-one between key and SID, as
specified. If a customer needs a second SID, they request a second SID + get a
second key — the account can hold many of each.

### 4.1 Lifecycle

1. Admin creates `SmsAccount` (status `PENDING`).
2. Customer (or admin on their behalf) requests a SID → `SmsSenderIdStatus.PENDING_REVIEW`.
   Validate length/charset per the 1s2u rules in §1 at submission time, so obviously
   invalid SIDs never reach "pending".
3. Admin manually approves (1s2u/SMSC-level sender names often need carrier
   whitelisting outside our control — don't auto-approve) → `APPROVED`.
4. Admin issues an `SmsApiKey` for that SID → full secret shown **once**, only the
   hash is persisted (same approach as `passwordHash` on `User`, via `bcryptjs`
   already a dependency).
5. Setting `SmsAccount.status = ACTIVE` (step not strictly ordered before/after key
   issuance, but a key is useless until the account is `ACTIVE`).

### 4.2 Blocking a SID (super admin action)

`blockSenderId(senderIdId, reason)` sets `SmsSenderId.status = BLOCKED` and writes a
`SmsSenderIdStatusEvent`. This must be **independent of the account's own status** —
an otherwise-healthy, paying account can have one abusive SID blocked (e.g. a
customer impersonating a bank's sender name) while its other SIDs keep working.
The gateway auth check (§6) must verify both the account status *and* the specific
SID status on every request, not just the API key's validity.

Only `Role.ADMIN` can block/approve SIDs or activate/suspend accounts — reuse the
existing `Role` enum and the `adminOnly` flag pattern already used in
`ADMIN_NAV_LINKS` (`lib/constants.ts`) rather than inventing a new role for this.

---

## 5. Credits / wallet (billing engine)

```prisma
enum SmsCreditTxnType {
  TOPUP       // admin credits the account after receiving payment
  DEBIT       // consumed by a sent message (per part)
  REFUND      // failed upstream send, credit returned
  ADJUSTMENT  // manual correction by admin
}

model SmsCreditTransaction {
  id        String            @id @default(cuid())
  accountId String
  type      SmsCreditTxnType
  amount    Int               // positive for TOPUP/REFUND, negative for DEBIT
  balanceAfter Int
  messageId String?           // set for DEBIT/REFUND, links to the triggering send
  note      String?
  actorId   String?           // staff member for TOPUP/ADJUSTMENT
  createdAt DateTime          @default(now())

  account SmsAccount @relation(fields: [accountId], references: [id])
  message SmsMessage? @relation(fields: [messageId], references: [id])
}
```

Debit happens **atomically** with message submission inside a `$transaction`
(balance check → decrement → create message row → call 1s2u). If the upstream call
fails outright (not just a carrier-side async failure we can't see), auto-`REFUND`
the debited parts.

Pre-send guard: reject the request with a clear `INSUFFICIENT_CREDIT` error *before*
calling 1s2u if `creditBalance < part_count`, so we never pay 1s2u for a send we
can't bill.

---

## 6. Core integration into the existing codebase

Follows the repository's existing conventions exactly (Next.js App Router, Prisma,
Zod-first validation, `lib/data` read helpers, `lib/actions` server-action mutations,
status-event audit trail, admin-only nav gating):

```
prisma/schema.prisma          # add models from §3–5 (new migration)

lib/
  sms/
    client.ts                 # thin wrapper over the 1s2u HTTP call (GET/POST),
                               # holds the master username/password from env,
                               # never imported by anything customer-facing directly
    gateway.ts                # orchestrates: auth check → rate limit → chunk
                               # recipients (≤30) → segment message (parts) →
                               # debit credits → call client.ts → persist SmsMessage
    auth.ts                   # resolves `Authorization: Bearer <key>` → SmsApiKey
                               # → checks key.revokedAt, senderId.status, account.status
    pricing.ts                # upstream-cost → sell-price calc from SmsRateCard (§2)
    segmentation.ts           # GSM-7 vs Unicode detection, part counting (153/67)
    errors.ts                 # maps 1s2u error codes (§7) to our API error shape
  validation/
    sms.ts                    # zod: send request, SID registration, API key issuance
  actions/
    sms-accounts.ts           # activateAccount, suspendAccount, disableAccount
    sms-sender-ids.ts         # approveSenderId, blockSenderId, rejectSenderId
    sms-api-keys.ts           # issueApiKey, revokeApiKey
  data/
    sms.ts                    # getAccounts, getAccountUsage, getSenderIds, ...

app/
  api/
    sms/
      v1/
        send/route.ts         # the public-facing customer endpoint (POST)
  admin/(dashboard)/
    sms/
      page.tsx                # accounts list (search/filter, status badges —
                               # reuse the <StatusBadge> component + a new
                               # SMS_ACCOUNT_STATUS_STYLES entry in lib/constants.ts)
      [id]/page.tsx            # account detail: SIDs, keys, usage, manual credit top-up
      senders/page.tsx         # global SID registry — approve/block, cross-account view
```

Add to `lib/constants.ts`:
- `SMS_ACCOUNT_STATUS_LABELS` / `_STYLES`, `SMS_SENDER_ID_STATUS_LABELS` / `_STYLES`
  (same shape as the existing `LEAD_STATUS_*` / `QUOTE_STATUS_*` constants).
- A new `ADMIN_NAV_LINKS` entry: `{ href: "/admin/sms", label: "SMS", icon: "sms",
  adminOnly: true }`, plus an `Sms` (or `MessageSquare`) icon mapping in
  `components/admin/Sidebar.tsx`'s `ICONS` record.

Env vars (`.env.example`):
```
SMS_PROVIDER_BASE_URL=https://api.1s2u.io/bulksms
SMS_PROVIDER_USERNAME=
SMS_PROVIDER_PASSWORD=
```
These are **our** master credentials — never exposed to customers, only used inside
`lib/sms/client.ts`.

### 6.1 Public endpoint shape (customer-facing)

```
POST /api/sms/v1/send
Authorization: Bearer stb_live_...
{
  "to": ["237670000000", "237650000000"],   // our array; no +/00 prefix, same as 1s2u
  "message": "Your OTP is 4821",
  "encoding": "auto" | "gsm7" | "unicode"    // default "auto"
}
```

The route handler: resolve key → `auth.ts` checks → `pricing.ts`/`segmentation.ts`
compute parts/cost → debit credits transactionally → chunk `to` into ≤30-recipient
batches → call `gateway.ts` → persist `SmsMessage` per batch → return a normalized
JSON response (not 1s2u's raw `OK:`/`ERROR:` text).

---

## 7. Error mapping (1s2u → our API)

| 1s2u code | Meaning | Our customer-facing code |
|---|---|---|
| `0000` | Service down | `UPSTREAM_UNAVAILABLE` (retryable) |
| `000` | Missing required param | `BAD_REQUEST` (shouldn't reach here if our Zod schema is correct — log as a bug if it does) |
| `00` | Invalid 1s2u credentials / trial expired | `UPSTREAM_AUTH_ERROR` — **our** fault, never show raw to customer, alert ourselves |
| `0020` | Insufficient 1s2u account credit | `UPSTREAM_AUTH_ERROR` equivalent — alert ops immediately, this means *we* are low on prepaid credit with 1s2u, independent of any customer's wallet |
| `0030` | Invalid sender name | `SENDER_ID_REJECTED` — shouldn't happen post-approval; flag the SID for re-review |
| `0041` | Invalid mobile number | `INVALID_RECIPIENT` |
| `0042` | Network not supported | `NETWORK_NOT_SUPPORTED` |
| `0050` | Invalid message text | `INVALID_MESSAGE` |
| `0051` | Invalid message type | internal bug — alert, don't surface |
| `0060` | Invalid submission limit | internal bug (we should never send >30 recipients upstream) — alert, don't surface |

`0020` and `00` are the two codes that mean **we** (the reseller) are about to go
down for every customer — these should page/alert ops, not just log.

---

## 8. Explicitly out of scope for v1 / open questions

- **Self-serve customer portal with login.** v1 assumes admin manages accounts, SIDs,
  and manual credit top-ups through the existing admin dashboard (same auth as today
  — `next-auth` Credentials, `Role.ADMIN`). A customer-facing portal (so customers can
  self top-up, see usage, rotate their own keys) is a v2 addition, and would need its
  own auth story since `SmsAccount` contacts aren't `User` rows today.
- **Payment processor.** No Stripe/CinetPay/mobile-money integration exists in this
  codebase (`package.json` has none). v1 top-ups are manual: admin records a
  `SmsCreditTransaction(TOPUP)` after confirming payment out-of-band (bank transfer /
  mobile money), same "known shortcut" posture as the email-sending stub in
  `lib/notifications/devis.ts`. Flag this the same way in `README.md`'s "Known
  shortcuts" section once built.
- **Delivery receipts (DLR).** Not documented on the reference page — confirm with
  1s2u whether a callback/webhook or a status-poll endpoint exists before promising
  delivery confirmation to customers; `SmsMessage.status` in v1 only reflects
  *submission* success/failure, not handset delivery.
- **Real 1s2u pricing.** See §2.5 — the whole pricing table needs the actual contract
  rate before customers can be sold the plan in §2.3 as final numbers.
- **Outbound rate limiting across customers.** 1s2u's 30 req/s cap is shared by all
  our customers combined. v1 needs a simple global token-bucket in `gateway.ts`
  (e.g. capped at ~25 req/s to leave headroom) before any per-customer fairness
  logic; per-customer caps are a v2 refinement once real traffic patterns are known.

---

## 9. Suggested build order

1. Prisma migration: `SmsAccount`, `SmsAccountStatusEvent`, `SmsSenderId`,
   `SmsSenderIdStatusEvent`, `SmsApiKey`, `SmsCreditTransaction`, `SmsMessage`,
   `SmsRateCard`.
2. `lib/sms/client.ts` + `lib/sms/segmentation.ts` + `lib/sms/errors.ts` — pure
   upstream integration, testable without any account/billing logic yet.
3. `lib/sms/auth.ts` + `app/api/sms/v1/send/route.ts` — end-to-end send path with a
   manually-seeded account/key/SID (no admin UI yet).
4. `lib/actions/sms-*.ts` + admin pages (§6) — so staff can manage accounts/SIDs/keys
   without touching the DB directly.
5. `lib/sms/pricing.ts` + credit debit/refund wiring into the send path.
6. Rate limiting + error-code alerting (§7/§8) before accepting real customer traffic.
