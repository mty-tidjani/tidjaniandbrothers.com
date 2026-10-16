# SMS Reselling Service

Status: **v1 implemented, including the customer portal (§5b)**. Migration not yet applied to a database, and not yet tested
against the live 1s2u API (see §9 before launch).

Upstream provider: **1s2u** (`https://api.1s2u.io/bulksms`), HTTP GET, one-way SMS
only. We hold **one** 1s2u account and resell capacity to many customers, each
isolated by API key + Sender ID (SID). Customers only ever see our API
(`/api/sms/v1/...`) and never 1s2u's URL or our credentials.

---

## 1. Constraints from the 1s2u reference, and how we handle them

| 1s2u constraint | Value | Where it's handled |
|---|---|---|
| Recipients per request | max 30 | `gateway.ts` splits each customer request (up to 300 numbers) into batches of 30 |
| Message length | max 5 parts; 153 chars/part GSM-7, 67 chars/part Unicode (160/70 for a single part) | `segmentation.ts`; we bill **per part** |
| Message type | `mt=0` plain, `mt=1` Unicode as hex | auto-detected from the text; Unicode sent as UTF-16BE hex (checked against 1s2u's own Arabic example) |
| Sender name | ≤15 digits if numeric, ≤11 chars if alphanumeric | validated when the SID is registered (`validation/sms.ts`) |
| Number format | no `+` / `00` | we accept `+`, `00`, spaces and dashes from customers and strip them |
| Rate limit | 30 req/s per account (shared by **all** our customers), 150 req/s per IP | global outbound limit of 25 req/s, plus 5 req/s per API key (`rate-limit.ts`) |
| Response | `OK: <id>` / `ERROR: <code>` | parsed into JSON; 1s2u ids are stored for reconciliation |
| Delivery receipts | not documented | `status` means **accepted by 1s2u**, not delivered to the handset |

---

## 2. Pricing

### 2.1 Cost basis

1s2u's public price list ([1s2u.com/pricing](https://1s2u.com/pricing)), checked 16 Oct
2026. No Cameroon-specific or reseller rate is published:

| 1s2u tier | Delivery rate | Price | ≈ FCFA/SMS at 585 FCFA/USD |
|---|---|---:|---:|
| Standard | 84–89% | $10 / 100 SMS ($0.10) | 58.5 |
| **High Quality** | 93–97% | $11 / 100 SMS ($0.11) | **64.35** |
| Direct Connection | 95–100% | quote only | — |

We price off **High Quality**. It's the tier worth reselling to businesses (OTPs at an
84% delivery rate generate support tickets). It's also the higher cost, so the markup
holds even if our account is on Standard.

```
cost  = ceil($0.11 × 585)  = 65 FCFA per part   (SmsRateCard 237)
price = ceil(65 × 1.5)     = 98 FCFA per credit (+50% on cost)
```

The inputs are constants at the top of the SMS block in `prisma/seed.ts`. 585 is the
mid-market USD→FCFA rate on 16 Oct 2026; the card or bank rate we actually pay will be
slightly worse. After seeding, edit both values at `/admin/sms/pricing`.

### 2.2 Credits

**1 credit = 1 SMS part to Cameroon.** Customers buy credits up front. A 2-part message
to 3 numbers costs 6 credits. For other destinations an admin adds a rate row with
`creditsPerPart` > 1 (e.g. a destination that costs us 130 FCFA → 2 credits/part).
**A destination with no rate row is refused**, so we never send traffic we haven't
priced.

### 2.3 Public price list (seeded)

| Package | Credits | Price | Per credit | Our cost | Profit | Markup |
|---|---:|---:|---:|---:|---:|---:|
| Starter | 500 | 49 000 FCFA | 98 FCFA | 32 500 FCFA | 16 500 FCFA | 51% |
| Business | 2 500 | 245 000 FCFA | 98 FCFA | 162 500 FCFA | 82 500 FCFA | 51% |
| Pro | 10 000 | 980 000 FCFA | 98 FCFA | 650 000 FCFA | 330 000 FCFA | 51% |

- *Markup* is profit ÷ our cost. It shows 51% rather than 50% because the cost and the
  price are both rounded up. Measured against the true $0.11 cost (64.35 FCFA), it's
  52%.
- *Gross margin*, which is profit ÷ selling price, is 34%. A 50% markup is not a 50%
  margin. A 50% margin would need a price of 130 FCFA per credit.
- Every package has the same price per credit, so no package ever goes below +50%. A
  volume discount on Business/Pro would cut into that.
- The pricing page recalculates margins live and flags any package that loses money.
- The seed only fills **empty** tables, and `deploy.sh` runs it on every deploy.
  These prices are created on the first deploy with the SMS tables, and never
  overwritten after that: edit them at `/admin/sms/pricing`.

### 2.4 The rate to negotiate

At the public rate we have to sell at 98 FCFA/SMS. For comparison, eSMS Africa lists
Cameroon at 20–30 FCFA. 1s2u advertises bulk "from $0.009", and that negotiated rate is
where this becomes competitive. The same +50% on different cost bases:

| 1s2u cost | ≈ FCFA/part (585/USD) | Our price at +50% |
|---|---:|---:|
| $0.11 (High Quality, public, today) | 65 | 98 |
| $0.10 (Standard, public) | 59 | 89 |
| $0.05 | 30 | 45 |
| $0.03 | 18 | 27 |
| $0.02 | 12 | 18 |

**Action:** ask 1s2u for a Cameroon (MTN + Orange) volume quote before launch. Then
update the 237 rate and the package prices on `/admin/sms/pricing`. No code change is
needed.

### 2.5 Profit tracking

Every top-up records what the customer paid (`amountFcfa`). Every send records what it
cost us at 1s2u (`upstreamCostFcfa`). The `/admin/sms` dashboard shows revenue, 1s2u
cost and gross margin. This compares cash collected with usage, so unspent customer
credit shows up as margin until it's used. The "credits in circulation" figure on the
same dashboard is that liability.

---

## 3. Customer accounts: activate / deactivate

`SmsAccount` holds one row per reselling customer. Customers are separate from `User`,
which stays staff-only.

| Status | Can send? | Meaning |
|---|---|---|
| `PENDING` | no | created, not yet activated |
| `ACTIVE` | yes | normal |
| `SUSPENDED` | no | temporary (e.g. non-payment); reversible |
| `DISABLED` | no, and the read endpoints are refused too | terminal; can still be reactivated by an admin |

- Changes are made from `/admin/sms/[id]`. A reason is required to suspend or disable.
- Every change writes an `SmsAccountStatusEvent` (who, when, why), shown as a timeline
  on the account page. This follows the same audit pattern as `LeadStatusEvent`.
- **Changes take effect on the next API call.** Status is re-read on every request,
  and the credit debit itself only succeeds while the account is `ACTIVE`.

---

## 4. Sender IDs and API keys

- **SIDs are globally unique, case-insensitive** (`normalized` = uppercase value, with a
  unique index). "MyBank" and "MYBANK" can't belong to two customers.
- **Each API key is bound to exactly one SID.** An account can hold many SIDs and many
  keys. A SID can have several keys over time, so a leaked key can be revoked and
  replaced without re-registering the sender name.
- SID lifecycle: `PENDING_REVIEW` → `APPROVED` / `REJECTED`. From any status, an admin
  can **block**; unblocking returns the SID to `APPROVED`. A reason is required to
  reject or block, and every change writes an `SmsSenderIdStatusEvent`.
- **Blocking a SID is independent of the account.** It stops every key on that SID on
  the next request, while the account's other SIDs keep working. A blocked name stays
  reserved, so nobody else can register it, and an admin can ban a name pre-emptively.
- If 1s2u rejects an approved SID (code `0030`), the gateway automatically sends it
  back to `PENDING_REVIEW` and logs a system event.
- The global SID registry is at `/admin/sms/senders`, with names awaiting review listed
  first.
- Keys look like `tbsms_<43 random chars>`. The full key is **shown once** at creation.
  We only store its SHA-256 hash. SHA-256 is used rather than bcrypt because the key is
  256-bit random, so a fast hash is safe and allows a direct lookup on every request.
  The admin UI shows the first 14 characters to identify a key.
- All SMS administration requires `Role.ADMIN`, checked both on the pages and inside
  every server action.

### Onboarding a customer

The customer can sign up at `/sms/inscription`, or an admin creates the account at
`/admin/sms`. Either way:

1. The account starts as `PENDING`. A self-signup logs `[sms-signup] …` server-side.
2. **Sender name**: the customer requests it from the portal, or an admin adds it.
   Approve it at `/admin/sms/senders` once it's cleared with 1s2u/carriers.
3. **Enregistrer un paiement**: once the customer has paid by Mobile Money or bank
   transfer, pick the package they paid for (or a custom amount) and add the payment
   reference.
4. Set the status to **Activer**.
5. The customer creates their own API keys in the portal. An admin can still issue one
   from the account page.
6. Admin-created accounts only: **Accès Espace SMS → Générer un lien d'accès**, and
   send the link to the customer.

---

## 5. Credits ledger

Every balance change is an `SmsCreditTransaction` row with `balanceAfter`: `TOPUP`,
`DEBIT`, `REFUND` or `ADJUSTMENT`. All of them go through `lib/sms/credits.ts`.

Send flow:

1. **Reserve.** In one DB transaction, create the message and debit
   `parts × creditsPerPart` per recipient. The debit is a conditional update
   (`balance >= cost AND status = ACTIVE`), so concurrent sends can't overdraw and
   nothing is sent without credit.
2. Call 1s2u in batches of 30, outside the transaction.
3. **Refund** the credits for any batch 1s2u rejected, and record the actual 1s2u cost
   of the batches that went through.

Manual adjustments (either sign) need a reason and can't take a balance below zero.

---

## 5b. Customer portal (`/sms`)

The portal is a self-service space for customers. Admins still do every recharge
manually; there's no payment provider.

| Page | What the customer can do |
|---|---|
| `/sms/inscription`, `/sms/connexion` | sign up (the account starts `PENDING`), log in |
| `/sms` | see their balance, 30-day stats, a daily usage chart and their latest sends |
| `/sms/envoyer` | send from the web: live character/SMS counter, cost estimate, up to 300 numbers |
| `/sms/historique` | browse every send: filter by status, number and date; paginated; CSV export |
| `/sms/historique/[id]` | see one send: per-batch result with a plain-French error |
| `/sms/credits` | see their balance, the price list, the full credit ledger, and WhatsApp/phone/email links to request a recharge |
| `/sms/expediteurs` | request sender names (max 3 pending, 10 total) and see their status and reason |
| `/sms/cles-api` | create keys (only for approved names, max 10 active), see last use, revoke |
| `/sms/documentation` | read the API reference with curl, JavaScript and PHP examples |
| `/sms/compte` | edit contact name/phone, change password (signs out other devices) |

**Auth is separate from staff Auth.js by design.** The admin layout lets in *any*
Auth.js session, so a customer signed in through Auth.js would get into `/admin`.
Portal sessions are their own `SmsPortalSession` rows: a random token in an httpOnly
`tb_sms_session` cookie, SHA-256 hashed in the DB, valid 30 days.

- Every portal page and action calls `requirePortalSession()` and scopes its queries
  to that session's account id. A layout check alone isn't enough, because layouts
  don't re-run on client-side navigation.
- **Account status is re-read on every request.**
  - `DISABLED` logs the customer out.
  - `SUSPENDED` can log in and read history, but can't send or create keys.
  - `PENDING` can log in, request sender names and see prices.
- Login allows 8 failed attempts per email per 15 minutes (in-process). bcrypt runs even
  for unknown emails, so response timing doesn't reveal which emails exist.
- **Passwords without email.** "Mot de passe oublié" sends the customer to support
  (WhatsApp/phone/email). The admin clicks **Lien de réinitialisation** on the account
  page and sends the link. The link is single-use and valid 7 days; issuing a new one
  invalidates the previous one. Using it signs out every session.
- Sends from the web form go through the same `sendSms()` as the API, so billing,
  refunds and limits are identical. They're recorded with `apiKeyId = null`, which the
  message detail page shows as "Espace web".

---

## 6. Code map

```
prisma/schema.prisma                    SmsAccount, SmsSenderId, SmsApiKey, SmsMessage,
                                        SmsCreditTransaction, SmsRateCard, SmsPackage + event tables
prisma/migrations/20261016120000_add_sms_reselling/
prisma/migrations/20261016150000_add_sms_portal/   SmsPortalUser, SmsPortalSession, SmsPortalToken
prisma/seed.ts                          Cameroon rate row + Starter/Business/Pro packages

lib/sms/client.ts         1s2u HTTP call + response parsing (only file that sees our credentials)
lib/sms/gateway.ts        send orchestration: validate → price → reserve → batch → refund
lib/sms/auth.ts           API key → account/SID checks on every request
lib/sms/segmentation.ts   GSM-7 vs Unicode detection, part counting, hex encoding
lib/sms/pricing.ts        rate lookup (longest prefix), quotes, margin maths
lib/sms/credits.ts        atomic balance changes + ledger rows
lib/sms/rate-limit.ts     global outbound limiter + per-key limiter
lib/sms/errors.ts         customer error codes + 1s2u error mapping
lib/sms/keys.ts           key generation / hashing / header parsing
lib/sms/sender-transitions.ts  allowed SID status changes (shared by UI + action)
lib/sms/admin.ts, route.ts     admin guard / action state, route error boundary
lib/notifications/sms.ts  ops alert stub (console.error for now)
lib/validation/sms.ts     zod schemas (API + admin forms), number/SID rules
lib/actions/sms-*.ts      server actions: accounts, sender IDs, API keys, pricing
lib/data/sms.ts           admin queries + dashboard figures

lib/sms-portal/session.ts        portal sessions (cookie ↔ SmsPortalSession)
lib/sms-portal/throttle.ts       login attempt limiter
lib/sms-portal/messages.ts       French error wording for customers
lib/actions/sms-portal-auth.ts   signup, login, logout, set password from link
lib/actions/sms-portal.ts        send, request SID, keys, profile, password
lib/actions/sms-portal-admin.ts  admin: issue portal access/reset link
lib/data/sms-portal.ts           account-scoped portal queries
lib/validation/sms-portal.ts     portal zod schemas

app/api/sms/v1/send/route.ts           POST  send
app/api/sms/v1/balance/route.ts        GET   credits + account/SID status
app/api/sms/v1/messages/[id]/route.ts  GET   one message
app/admin/(dashboard)/sms/             accounts list, [id] detail, senders, pricing
app/sms/(auth)/                        portal login, signup, forgot password, set password
app/sms/(app)/                         portal pages (§5b) + historique/export CSV route
components/admin/sms/                  ActionForm, IssueApiKeyForm, SenderIdActions, badges, nav
components/sms-portal/                 portal nav, usage chart, composer, pagination
```

Env (`.env.example`): `SMS_PROVIDER_BASE_URL`, `SMS_PROVIDER_USERNAME`,
`SMS_PROVIDER_PASSWORD`.

---

## 7. Public API reference (v1)

Base URL: `https://tidjanibrothers.com/api/sms/v1`. Authenticate with
`Authorization: Bearer tbsms_...`; `X-API-Key: tbsms_...` is also accepted. The sender
name is fixed by the key.

### `POST /send`

```json
{
  "to": ["237670000000", "+237 650 00 00 00"],
  "message": "Votre code est 4821",
  "encoding": "auto"
}
```

- `to`: an array or a comma-separated string, 1–300 numbers, in international format.
  `+`, `00`, spaces and dashes are accepted. Duplicates are removed.
- `message`: 1–2000 characters, at most 5 SMS parts once encoded. `encoding`:
  `auto` (default), `gsm7` or `unicode`. `auto` switches to Unicode when it sees
  characters such as `ê`, `ç` or emoji, which shrinks parts from 153 to 67 characters.

`201 Created`:

```json
{
  "id": "cm2…",
  "status": "sent",
  "sender": "MYSHOP",
  "encoding": "gsm7",
  "parts": 1,
  "recipients": 2,
  "creditsCharged": 2,
  "creditsRefunded": 0,
  "createdAt": "2026-10-16T12:00:00.000Z",
  "batches": [{ "recipients": ["237670000000", "237650000000"], "status": "submitted" }],
  "balance": 498
}
```

- `status` is `sent`, or `partial` when some batches failed (those credits are
  refunded, and each failed batch carries `error: { code, retryable }`).
- If every batch fails, the response is an error (`503` or `422`) with the same payload
  under `error.details`, and all credits are refunded.

### `GET /balance`

```json
{ "credits": 498, "accountStatus": "active", "sender": { "value": "MYSHOP", "status": "approved" } }
```

### `GET /messages/{id}`

Returns the same shape as a send response, without `balance`. Customers can only see
their own messages.

### Errors

```json
{ "error": { "code": "INSUFFICIENT_CREDIT", "message": "Not enough credit.", "details": { "required": 6 } } }
```

| HTTP | Code | When |
|---|---|---|
| 401 | `UNAUTHORIZED` | missing, unknown or revoked key |
| 403 | `ACCOUNT_INACTIVE` | account pending, suspended or disabled |
| 403 | `SENDER_ID_BLOCKED` / `SENDER_ID_NOT_APPROVED` | SID not usable |
| 400 | `BAD_REQUEST` | invalid JSON or body |
| 402 | `INSUFFICIENT_CREDIT` | not enough credit; nothing sent |
| 422 | `INVALID_RECIPIENT` | bad number(s), listed in `details.invalid` |
| 422 | `UNSUPPORTED_DESTINATION` | no rate for these numbers, listed in `details.numbers` |
| 422 | `MESSAGE_TOO_LONG` | over 5 parts |
| 422 | `NETWORK_NOT_SUPPORTED` / `INVALID_MESSAGE` / `SENDER_ID_REJECTED` | refused by the operator side |
| 429 | `RATE_LIMITED` | more than 5 requests/s on one key |
| 503 | `UPSTREAM_UNAVAILABLE` | temporary; safe to retry later |

---

## 8. 1s2u error mapping

| 1s2u | Meaning | Customer sees | Ops alert |
|---|---|---|---|
| `0000` | service down | `UPSTREAM_UNAVAILABLE` (retried once automatically) | no |
| `000` | missing parameter | `INTERNAL_ERROR` | yes (our bug) |
| `00` | **our** credentials invalid / trial expired | `UPSTREAM_UNAVAILABLE` | **yes, the service is down for every customer** |
| `0020` | **our** 1s2u balance is empty | `UPSTREAM_UNAVAILABLE` | **yes, top up 1s2u now** |
| `0030` | invalid sender name | `SENDER_ID_REJECTED` | yes; the SID goes back to review |
| `0041` | invalid number | `INVALID_RECIPIENT` | no |
| `0042` | network not supported | `NETWORK_NOT_SUPPORTED` | no |
| `0050` | invalid text | `INVALID_MESSAGE` | no |
| `0051`, `0060` | bad type / too many numbers | `INTERNAL_ERROR` | yes (our bug) |
| HTTP 429 | 1s2u rate limit | `UPSTREAM_UNAVAILABLE` (retried once) | yes |
| timeout | network | `UPSTREAM_UNAVAILABLE` (not retried, since it may have been delivered) | no |

Ops alerts are currently `console.error("[sms-alert] …")` in the PM2 logs
(`pm2 logs | grep sms-alert`). They need wiring to a real channel; see §9.

---

## 9. Before launch

1. **Apply the migration and seed.** `deploy.sh` does both: `prisma migrate deploy`,
   then the seed, which fills only empty tables (here, the SMS rate and packages). The
   migrations were generated with `prisma migrate diff` (the local DB login was
   rejected), so run `npx prisma migrate dev` against a dev database first.
2. **Set `SMS_PROVIDER_USERNAME` / `SMS_PROVIDER_PASSWORD`** on the server.
3. **Test against live 1s2u** with a test account, our own SID and our own number:
   - a plain message (`mt=0`);
   - a message with `é`/`è`/`à`, which counts as GSM-7. Confirm 1s2u renders the
     accents correctly with `mt=0`; if not, treat accented text as Unicode.
   - a message with `ê`/`ç`, which is sent as Unicode hex;
   - a 2-part message;
   - 31+ recipients, to check batching;
   - 2 numbers where one is invalid. Does 1s2u reject the whole batch (then we refund
     both, which is the current behaviour) or send the valid one? If it sends the valid
     one, the response format needs checking so we bill it correctly.
   - a wrong password, to confirm the response format and that a `00` alert fires.
4. **Negotiate the Cameroon rate** (§2.4), then update prices on `/admin/sms/pricing`.
5. **Wire ops alerts** (`lib/notifications/sms.ts`) to email/WhatsApp, at least for
   `00` and `0020`.
6. **Watch our 1s2u balance.** Customer credit is our liability; 1s2u credit is what
   actually sends.

### Known v1 limits

- **No delivery receipts.** Ask 1s2u whether a DLR webhook or status endpoint exists.
- **Manual payments.** There's no payment processor; admins record top-ups.
- **No email delivery.** No verification at signup (an admin activates manually
  anyway). Password resets go through support plus an admin-issued link.
- **One login per customer account.** The schema allows several users per account,
  but there's no UI to invite teammates yet.
- **Not linked from the marketing site yet.** Add `/sms/inscription` and
  `/sms/connexion` to the navbar or footer when you're ready to sell publicly.
- **Single-process rate limits.** They're correct with PM2 `instances: 1`; scaling out
  needs Redis or Postgres.
- **Credits don't expire.**
- **Crash recovery.** If the process dies between the debit and the 1s2u call, a message
  stays `PENDING` with credits debited. Find these with
  `SELECT * FROM "SmsMessage" WHERE status = 'PENDING' AND "createdAt" < now() - interval '5 minutes'`
  and refund them with a manual adjustment.
