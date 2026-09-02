# Tidjani & Brothers

Marketing site + admin back-office for Tidjani & Brothers, an Odoo ERP consultancy in Yaoundé, Cameroon. Built with Next.js App Router, TypeScript, Tailwind CSS v4, Prisma/Postgres, and Auth.js.

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start local Postgres** (or point `DATABASE_URL` at your own instance)

   ```bash
   docker compose up -d
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` — at minimum set `ADMIN_SEED_PASSWORD` to something real before seeding.

4. **Run migrations and seed real content**

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

   This creates the admin user (`ADMIN_EMAIL` / `ADMIN_SEED_PASSWORD`), the Odoo pricing tiers, the real case study + two clearly TODO-marked placeholders, and the five planned blog posts.

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   Public site: [http://localhost:3000](http://localhost:3000)
   Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Project structure

- `app/(site)` — public marketing pages (Home, Services, Portfolio, Blog, About, Contact)
- `app/(booking)` — the standalone 2-step "réserver un audit" flow and its confirmation screen
- `app/admin` — authenticated back-office (leads, blog, portfolio, services & pricing, team, settings)
- `components/ui` — shared primitives used by both the public site and admin
- `components/site`, `components/admin`, `components/forms` — feature components
- `lib/validation` — Zod schemas (single source of truth for client forms and server actions/routes)
- `lib/actions` — Server Actions for admin mutations
- `lib/data` — Prisma query helpers
- `prisma/schema.prisma`, `prisma/seed.ts` — data model and seed data

## Known shortcuts (revisit before a real launch)

- **Password reset & team invite emails are not actually sent.** No email provider is configured; the reset/invite link is logged server-side (`console.info`) instead. The token flow exists in the database, but there's no page yet to complete a reset from that link, since it's unreachable without email delivery.
- **File uploads are placeholder text fields**, not a real upload pipeline. Blog cover images and case study images accept a path string; wiring an actual upload (to `public/uploads` locally, or object storage in production) is still open. `public/uploads` won't persist on ephemeral/serverless hosts like Vercel — needs external storage before a real deploy.
- **Language toggle is visual only.** Content is French-only for now (matches the original brief's scope); the EN side of the toggle is a disabled label, not a working locale switch.
- **Portfolio ships with 1 real case study + 2 unpublished TODO placeholders** rather than fabricated client data, per the brief.

## Scripts

- `npm run dev` / `npm run build` / `npm run start`
- `npm run lint`
- `npm run db:seed` — re-run the seed script directly
