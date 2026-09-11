# District One Realty

Real estate discovery and management platform for **District One Realty** — a real estate consultancy
covering residential and commercial properties across Navi Mumbai.

> Status: Phase 1 (architecture & scaffolding) + Phase 2 (schema) complete. See [Implementation Phases](#implementation-phases).

## Architecture

Two independent React applications share one Express/MySQL (Prisma) API:

| App | Domain (prod) | Local dev | Purpose |
|---|---|---|---|
| `apps/public-web` | `www.districtonerealty.com` | `http://localhost:5173` | Public marketing + property discovery site. No login. |
| `apps/admin-web` | `admin.districtonerealty.com` | `http://localhost:5174` | Internal Admin + Agent management panel (RBAC). No public registration. |
| `apps/api` | `api.districtonerealty.com` | `http://localhost:5000` | Shared REST API for both frontends. |

`admin.districtonerealty.com` is a **separate deployment**, not a `/admin` path on the public site — this
keeps the internal tool fully isolated from the public site's build, routing, and caching.

## Monorepo structure

```
district-one-realty/
  apps/
    public-web/     # Vite + React 19 + TypeScript + Tailwind v4
    admin-web/      # Vite + React 19 + TypeScript + Tailwind v4
    api/            # Express + TypeScript + Prisma (MySQL)
  packages/
    shared-types/   # Domain types/enums shared by API + both frontends
    shared-utils/   # Formatting, slug, WhatsApp link, validation helpers shared across apps
  package.json      # npm workspaces root
```

### `apps/api` internal layout

```
prisma/
  schema.prisma  # relational schema, enums, indexes (source of truth for the DB)
src/
  config/        env.ts (zod-validated), prisma.ts (client singleton), cloudinary.ts
  controllers/   public/  admin/
  services/      business logic (never in controllers)
  routes/        public/  admin/
  middlewares/   errorHandler, notFound, rateLimiters, auth/rbac (Phase 3)
  validators/    zod schemas per resource
  utils/         ApiError, ApiResponse, catchAsync, logger
  jobs/          seed script, scheduled jobs
  emails/        transactional email templates (future)
  types/         backend-only types
  uploads/tmp/   multer scratch space before Cloudinary upload
```

There is no `models/` folder — Prisma generates a fully-typed client from `prisma/schema.prisma`, so
services import `prisma` from `@/config/prisma` directly instead of per-collection model files.

Every image/video/document (property gallery, project brochure, builder logo, location image, blog featured
image, agent photo, ...) lives in one polymorphic `Media` table (`ownerType` + `ownerId`) rather than a JSON
column per entity. That makes per-image operations — reorder, set primary, edit alt/caption, delete one file
— simple row updates instead of read-modify-write on an array, matching the admin media requirements in
Phase 5. The API still returns media to the frontend shaped as `MediaAsset[]` (see `@district-one/shared-types`),
so this is purely a storage-layer decision.

Public and admin controllers/routes are kept in separate folders so permission boundaries are obvious at a
glance — an admin controller must never be reachable from a public route file.

## Requirements

- Node.js `>=18.18 <23` (developed against Node 22)
- npm 10+
- MySQL 8+ (local or a managed provider — PlanetScale, RDS, Cloud SQL, etc.)
- Cloudinary account (image/video storage)

## Installation

```bash
npm install
```

This installs all workspaces (`apps/*`, `packages/*`) from the repo root via npm workspaces. `apps/api`'s
`postinstall` hook automatically runs `prisma generate`, so the typed Prisma Client is regenerated any time
`node_modules` is (re)installed — no separate manual step needed.

## Environment variables

Each app has its own `.env.example`. Copy and fill in real values — **never commit `.env` files**.

```bash
cp apps/api/.env.example apps/api/.env
cp apps/public-web/.env.example apps/public-web/.env.local
cp apps/admin-web/.env.example apps/admin-web/.env.local
```

Key API variables (`apps/api/.env`):

- `DATABASE_URL` — MySQL connection string, e.g. `mysql://user:password@127.0.0.1:3306/district_one_realty`
- `JWT_ACCESS_SECRET` — long random secret for signing access tokens (never reuse across envs)
- `PUBLIC_WEB_URL` / `ADMIN_WEB_URL` — production origins allowed by CORS
- `DEV_PUBLIC_WEB_URL` / `DEV_ADMIN_WEB_URL` — dev origins allowed by CORS (only applied when `NODE_ENV=development`)
- `CLOUDINARY_*` — media storage credentials. **Leave all three blank and uploads automatically
  fall back to local disk storage** under `apps/api/uploads/` (served at `/uploads`) — no external
  account needed to get uploads working locally. Fill in all three to switch to Cloudinary; see
  `src/services/storage/` for the provider abstraction (an S3-compatible provider drops in the
  same way without touching `media.service.ts`).
- `API_PUBLIC_URL` — only read by the local storage fallback, to build absolute file URLs.
  Defaults to `http://localhost:<PORT>` in development; set it explicitly in production if not
  using Cloudinary there.
- `WHATSAPP_NUMBER` — international format, no `+`/spaces (e.g. `919324702438`)

Frontend variables are `VITE_*` and read via `import.meta.env`; `VITE_API_URL` must point at the API's `/api` base path. No domain is ever hardcoded in application code.

## Database setup (MySQL + Prisma)

```bash
# create/update tables from prisma/schema.prisma and generate the typed client
npm run prisma:migrate --workspace=apps/api

# (re)generate the Prisma client after pulling schema changes without migrating
npm run prisma:generate --workspace=apps/api

# seed lookup data (locations, property types, purposes, a super admin, etc.)
npm run seed --workspace=apps/api

# browse data visually
npm run prisma:studio --workspace=apps/api
```

## Authentication & RBAC

There is no public registration and no customer accounts — only Super Admin / Admin / Agent users, created by
a Super Admin (Phase 5 admin UI). Auth lives at `/api/auth/*`:

| Endpoint | Method | Notes |
|---|---|---|
| `/api/auth/login` | POST | Rate-limited. Sets both cookies below on success. |
| `/api/auth/refresh` | POST | Rotates the refresh token (old one is revoked, a new pair is issued). |
| `/api/auth/logout` | POST | Revokes the refresh token and clears both cookies. |
| `/api/auth/me` | GET | Requires auth. Returns the current user's profile. |
| `/api/auth/forgot-password` | POST | Always responds success — never reveals whether an email exists. |
| `/api/auth/reset-password` | POST | Consumes a one-time token, forces re-login on every device. |
| `/api/auth/change-password` | POST | Requires auth + current password. |

- **Access token**: short-lived JWT (`JWT_ACCESS_EXPIRES_IN`, default 15m), HTTP-only cookie `d1r_access_token`.
- **Refresh token**: opaque random string (not a JWT) stored **hashed** in the `RefreshToken` table so it can be
  revoked/rotated instantly without a blacklist; HTTP-only cookie `d1r_refresh_token`, scoped to `/api/auth`.
- `authenticate` middleware re-checks the user's `isActive`/`role` against the DB on every request — a
  deactivated agent loses access immediately rather than waiting out their access token's TTL.
- `authorize(...roles)` middleware enforces RBAC per-route; resource-level ownership checks (an agent may only
  touch their own assigned properties/projects/leads) are enforced in each resource's service layer starting
  in Phase 4 — the frontend's UI never decides permissions, the API always re-verifies.
- Password reset tokens follow the same hashed-opaque-token pattern as refresh tokens, expiring after
  `PASSWORD_RESET_TOKEN_TTL_MIN` (default 60 minutes). No email transport is wired up yet — see
  `src/emails/sendPasswordResetEmail.ts`, which logs the reset link in development as a placeholder.

## Local development

```bash
npm run dev:api      # http://localhost:5000
npm run dev:public   # http://localhost:5173
npm run dev:admin    # http://localhost:5174
```

## API surface

All endpoints live under `/api`. Public routes need no auth; every `/api/admin/*` route requires
`authenticate`, and most also carry `authorize(...)` and/or ownership checks — see
[Authentication & RBAC](#authentication--rbac) above.

| Public | Admin (`/api/admin/*`) |
|---|---|
| `GET/POST /properties`, `GET /properties/:slug` | `/properties` CRUD + `/publish`, `/unpublish`, `/archive`, `/featured`, `/verified` + `/media`, `/videos`, `/floor-plans`, `/documents` |
| `GET /projects`, `/projects/by-location`, `/projects/:slug` | `/projects` CRUD + `/publish`, `/unpublish`, `/featured` + `/gallery`, `/brochure`, `/master-plan` |
| `GET /builders`, `/builders/:slug` | `/builders` CRUD + `/media` (logo) |
| `GET /locations`, `/locations/:slug` | `/locations`, `/cities` CRUD; `/countries`, `/states` read-only + `/media` (image) |
| `GET /amenities`, `/features`, `/property-types`, `/property-categories`, `/purposes` (active-only, for filters) | same 5 resources, full CRUD (shared generic factory — see `lookupCrud.factory.ts`) |
| `POST /inquiries` (property/project/contact lead) | `/leads` list/detail/update/notes |
| `POST /site-visits` | `/site-visits` list/detail/update |
| `POST /contact` | `/messages` inbox + mark read |
| `GET /blog`, `/blog/:slug` | `/blogs` CRUD + `/featured-image` |
| — | `/agents` (Super Admin/Admin only; creation is Super Admin only) |
| — | `/dashboard` (role-scoped stats/charts/recent activity) |
| — | `/activity-logs` (Super Admin/Admin only) |

Property search accepts `purpose`, `location`, `builder`, `project`, `propertyType`, `category`, `bhk`,
`minPrice`/`maxPrice`, `minArea`/`maxArea`, `possession`, `amenities`, `rera`, `furnishing`, `status`, `q`,
`sort`, `page`, `limit` — all resolved to a single Prisma `WHERE` clause and executed server-side (see
`property.service.ts`); the frontend never filters a full result set client-side.

Public forms (`/inquiries`, `/site-visits`, `/contact`) share three defenses: a rate limiter, a hidden
honeypot field (`website` — must stay empty; a filled one is silently dropped, never rejected, so bots get
no signal), and Zod validation.

Agents only ever see/manage properties, projects, leads, and site visits they're assigned to — every list
query and mutation re-checks this server-side (`utils/ownership.ts`), never trusting the frontend. Verified
live end to end: an agent gets `403` creating a property, deleting a builder, or verifying/featuring a
listing, and sees `0` results for resources they aren't assigned to.

## SEO

- **Structured data**: a site-wide `RealEstateAgent` JSON-LD block (verified contact info only — no
  fabricated ratings/reviews), plus `Residence` on property detail pages, `ApartmentComplex` on project
  detail pages, and `BreadcrumbList` wherever `<Breadcrumbs>` renders. Injected client-side via
  `useJsonLd` and cleaned up on route change — verified in a real browser that stale schema doesn't
  linger after navigating away.
- **Canonical URLs + Open Graph tags**: set per-page by `useDocumentMeta`, keyed off the current route.
- **`sitemap.xml`**: generated dynamically by the API (`GET /sitemap.xml`, served at the Express app root,
  not under `/api`) from published properties/projects/active builders & locations/published blog posts —
  a static file can't reflect live DB content. **Production note**: sitemaps are expected to live on the
  site's own domain (`https://www.districtonerealty.com/sitemap.xml`), so point that path at this API
  route via a reverse-proxy/CDN rewrite rule (the exact mechanism depends on your hosting — see
  [Deployment](#deployment) once written).
- **`robots.txt`**: static — `apps/public-web/public/robots.txt` allows crawling and references the
  sitemap; `apps/admin-web/public/robots.txt` disallows everything (the admin panel must never be
  indexed), backed up by a `<meta name="robots" content="noindex, nofollow">` tag in `admin-web/index.html`.

## Build

```bash
npm run build           # builds shared packages, then api, public-web, admin-web in order
npm run build:api
npm run build:public
npm run build:admin
```

## Deployment (Hostinger Business Hosting)

This maps directly onto a single Hostinger Business plan: it includes shared MySQL, a Node.js
app slot (Passenger-managed, set up per-domain in hPanel), and static file hosting for the two
React builds — no separate host needed for anything.

**What goes where:**

| Component | Hostinger feature | Domain |
|---|---|---|
| `apps/api` | Node.js app (hPanel → Websites → your domain → Node.js) | `api.districtonerealty.com` |
| `apps/public-web` (built) | Static files (subdomain's document root) | `www.districtonerealty.com` |
| `apps/admin-web` (built) | Static files (subdomain's document root) | `admin.districtonerealty.com` |
| MySQL | hPanel → Databases → MySQL Databases | (internal — `localhost` only) |

### 0. Put the code in Git (recommended before deploying anything)

This project isn't a Git repo yet. Initializing one lets you deploy via `git pull` on the server
(or Hostinger's Git deploy feature, if your panel offers it under the Node.js app or Website →
Git section) instead of manually re-uploading files every change, and gives you a rollback point.
A private GitHub/GitLab repo is the natural place to push it.

### 1. MySQL database

In hPanel → **Databases → MySQL Databases**, create a database and a user, and grant that user
full privileges on the database. Hostinger prefixes both with your hosting account username
(e.g. `u123456789_d1realty` / `u123456789_d1user`) — copy them exactly as shown, they're not
editable to something cleaner. Note the database name, username, and password; the host is
`localhost` (Hostinger's shared MySQL doesn't accept remote connections, which is fine since the
API runs on the same server).

### 2. Node.js API app

In hPanel → your domain → **Advanced → Node.js** (exact label varies by panel version — look for
"Setup Node.js App"):

1. Create a new Node.js application:
   - **Node.js version**: 20 or 22 (match what you developed against — see [Requirements](#requirements)).
   - **Application root**: a folder under your hosting account, e.g. `api.districtonerealty.com`
     — this is where you'll upload/pull `apps/api`'s contents (not the whole monorepo — see the
     packaging note below).
   - **Application URL**: the `api.districtonerealty.com` subdomain.
   - **Application startup file**: `dist/server.js` (the compiled output of `npm run build`, not
     `src/server.ts` — Hostinger's Node.js runner doesn't transpile TypeScript for you).
2. Get the code onto the server (pick one):
   - **Git** (recommended, if hPanel offers it here): point it at your repo, and either deploy
     the whole monorepo and set the app root to `apps/api`, or maintain a deploy workflow that
     pushes just that folder — either works, but the app's `package.json` needs
     `@district-one/shared-types`/`@district-one/shared-utils` resolvable, which npm workspaces
     handles automatically if the monorepo root (with its `package.json` workspaces field) is
     what's present on the server.
   - **Manual upload**: `npm run build` locally (builds `shared-types`/`shared-utils` then `api`),
     then upload the monorepo root's `package.json`/`package-lock.json`, `apps/api/` (including
     its `dist/`, `prisma/`, and `package.json`), and `packages/*/dist` + `packages/*/package.json`
     — `node_modules` doesn't need to travel with it; you'll run `npm install` on the server.
3. Copy `apps/api/.env.production.example` to `.env` in the app's directory (via the Node.js
   app's file manager or SSH) and fill in every value — the MySQL credentials from step 1, a
   freshly generated `JWT_ACCESS_SECRET` (`openssl rand -base64 48`), and the production domains.
   **Never reuse a development secret in production.**
4. From the app's **npm install** button (or via SSH, `cd` into the app root and run it manually)
   install dependencies, then run once, via SSH (Business plans include SSH — hPanel → Advanced →
   SSH Access):
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npm run seed        # creates the Super Admin — see SEED_SUPER_ADMIN_* in your .env
   ```
5. Start (or restart) the Node.js app from hPanel. Hit `https://api.districtonerealty.com/api/health`
   — it should return `{"success":true,"data":{"status":"ok",...}}`.

### 3. Public website & Admin panel (static builds)

Both are plain static builds — no Node.js app needed for these two, just a document root:

```bash
npm run build:public   # reads apps/public-web/.env.production automatically
npm run build:admin    # reads apps/admin-web/.env.production automatically
```

Each `.env.production` already points `VITE_API_URL` at `https://api.districtonerealty.com/api`
(update it first if your API domain differs). Upload the **contents** of `apps/public-web/dist/`
to the `www.districtonerealty.com` subdomain's document root, and `apps/admin-web/dist/`'s
contents to `admin.districtonerealty.com`'s — both `dist/` folders already include a `.htaccess`
(copied automatically from each app's `public/` at build time) that rewrites client-side routes
back to `index.html`, so refreshing on e.g. `/properties/some-slug` doesn't 404.

### 4. SSL

Enable Hostinger's free SSL (hPanel → **Security → SSL**) for all three subdomains — `www`,
`admin`, and `api`. Once issued, confirm `PUBLIC_WEB_URL`/`ADMIN_WEB_URL` in the API's `.env` (and
both frontends' `.env.production`) use `https://`, matching what CORS and cookies expect —
mismatched scheme is a common cause of cookies silently not being sent.

### 5. Verify end to end

Run through the [public user flow and admin flow](#implementation-phases) against the live
domains: load the homepage, search properties, submit an inquiry, log into the admin panel with
the Super Admin account from step 2.4, and upload a property image (confirms the local media
storage fallback — or Cloudinary, if configured — is writable in production).

### DNS reference

If `districtonerealty.com` is already on Hostinger's nameservers (as it is here), hPanel's DNS
zone editor manages this for you when you create each subdomain in steps 2–3 above — you
generally won't need to hand-edit records. If you ever move DNS elsewhere, the equivalent records
are:

| Type | Name | Points to |
|---|---|---|
| A (or CNAME) | `www` | Hostinger's server IP for the public-web document root |
| A (or CNAME) | `admin` | Hostinger's server IP for the admin-web document root |
| A (or CNAME) | `api` | Hostinger's server IP for the Node.js app |

## Testing

The API has an integration test suite (Vitest + Supertest) that runs against a **real MySQL
database**, not mocks — the same Prisma schema, the same middleware stack, actual HTTP requests
through the Express app. It never touches your dev database:

```bash
# one-time setup — creates+migrates a dedicated district_one_realty_test database
cd apps/api
DATABASE_URL="mysql://root:<password>@127.0.0.1:3306/district_one_realty_test" npx prisma migrate deploy

# then just:
npm run test --workspace=apps/api
```

- `.env.test` (committed — a placeholder `DATABASE_URL`, no real credentials) points the suite at
  `district_one_realty_test`. Put your own local MySQL credentials in `.env.test.local` instead
  (gitignored, never committed) — `src/test/setup.ts` loads both, in that order, with
  `override: true`, before any test file can import `@/config/env`, so neither a real `.env` nor
  a real password ever needs to touch version control.
- `src/test/db.ts` wipes every table in FK-safe order between test files, so each suite starts
  from a known-empty database instead of accumulating state or colliding on unique slugs/emails.
- `src/test/fixtures.ts` / `authHelper.ts` create users, location hierarchies, and properties, and
  return a `supertest.agent()` already logged in as a given role — cookies persist across calls on
  that agent exactly like a real browser session.
- Coverage: login/session lifecycle (refresh rotation, logout, immediate lockout on deactivation),
  RBAC and ownership on properties and leads (the two most permission-sensitive resources — an
  agent's 403s and 0-result scoping are asserted directly, not just publish/CRUD happy paths),
  public form endpoints including the honeypot anti-spam behavior, and file-upload MIME validation
  at the HTTP layer (a bad file type is rejected before ever reaching Cloudinary).
- Frontend component/E2E tests are not yet automated in-repo — every phase of both `admin-web` and
  `public-web` was instead verified with a real headless-browser pass (Playwright) during
  development: booting the actual dev servers, logging in, clicking through every page, submitting
  real forms, and checking for console/network errors and layout overflow at mobile/tablet/desktop
  widths. That caught real bugs (a Vite CJS/ESM interop issue, missing Prisma includes crashing a
  component, a tablet-width header overlap) that type-checking alone would have missed. Formalizing
  those runs into a committed Playwright suite is the natural next step here.

## Security

Beyond what's covered above (RBAC, ownership checks, hashed passwords/tokens, Zod validation,
honeypots + rate limiting on public forms):

- **CORS** is a strict allowlist (`PUBLIC_WEB_URL`/`ADMIN_WEB_URL`, plus `DEV_*` origins only when
  `NODE_ENV=development`) — never a wildcard. A disallowed origin gets no
  `Access-Control-Allow-Origin` header and a normal response code, not a 500; treating a routine
  cross-origin probe as a server error would both look like a bug in logs and, if any monitoring
  alerts on 5xx rate, page someone for normal internet background noise.
- **Helmet** sets CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, and related headers on
  every response (verified live — see headers on any `curl -i` response).
- **CSRF**: no traditional cookie-only form posts exist here — every mutating request is JSON
  (`Content-Type: application/json`), which forces a CORS preflight that the strict origin
  allowlist above already blocks for any non-approved site. Combined with `SameSite=Lax` cookies,
  this covers the CSRF threat model without needing a separate double-submit token.
- **File uploads**: MIME-type allowlist (JPG/PNG/WEBP, plus PDF for documents) enforced by Multer's
  `fileFilter` before a file ever reaches a route handler or Cloudinary, plus per-file and
  per-request size/count limits.
- **Request size limits**: `express.json({ limit: "2mb" })`/`urlencoded` — the whole JSON body is
  capped, independent of the multipart file-size limits above.
- **No secrets in the repo**: `.env`/`.env.local` are git-ignored; `.env.example`/`.env.test` carry
  placeholder/dummy values only.

## Performance

- **Server-side pagination and filtering everywhere** — the frontend never fetches a full result
  set and filters client-side (see [API surface](#api-surface)).
- **Batched image lookups**: listing pages (properties, projects) fetch every card's primary image
  in one query via `getPrimaryImagesForOwners`, not one query per card — see `media.service.ts`.
- **Database indexes**: `@@index` on every foreign key plus the fields actually filtered/sorted on
  (`price`, `status`, `featured`, `verified`, `createdAt`, ...) and `@@fulltext` for search — see
  `prisma/schema.prisma`.
- **`loading="lazy"` on every below-the-fold image**; hero/above-the-fold images (the homepage
  hero, property/project/location detail hero banners, a blog post's featured image, the main
  image in the property gallery) are explicitly `loading="eager"` with `fetchPriority="high"` so
  they don't get deprioritized as the browser's likely LCP candidate.
- **HTTP caching** on read-mostly public endpoints (`/api/amenities`, `/api/features`,
  `/api/property-types`, `/api/purposes`, `/api/property-categories`: 5 minutes; `/api/locations`,
  `/api/builders`: 60s list / 30s detail) via `Cache-Control: public, max-age=..., stale-while-
  revalidate=...` — see `middlewares/cacheControl.ts`. Property/project listings are deliberately
  left uncached since they change often and are already paginated+filtered server-side.
- `compression()` gzips every response.

## Troubleshooting

**Blank white screen in `public-web`/`admin-web` dev server, with a browser console error like
`does not provide an export named '...'` pointing at `@district-one/shared-types` or
`@district-one/shared-utils`.** Those packages compile to CommonJS, but npm workspace linking
exposes them to Vite via a symlink that resolves to their real (non-`node_modules`) path — which
skips the automatic CJS→ESM interop Vite normally applies to `node_modules` dependencies. Both
apps' `vite.config.ts` force this via `optimizeDeps.include`; if it resurfaces (e.g. a new shared
package), add it there too and restart the dev server with its `node_modules/.vite` cache cleared.
This only affects the dev server — production builds (`vite build`) are unaffected.

## Brand

- Palette: White + Navy (`#0B2346` / `#142F5A` / `#193F78`) + Gold accent (`#C59A4A` / `#D7B66D` / `#E9D6AD`). Gold is an accent only — never a background or dominant color.
- Typography: Playfair Display for editorial headings (public site), Poppins for interface text (both apps).
- Consultant: Affan Shaikh, Real Estate Consultant · +91 93247 02438 · districtonerealty@gmail.com

## Implementation phases

This project is being built in phases, each verified before the next begins:

1. **Architecture & scaffolding** ✅ — monorepo, TypeScript, env config, Tailwind theme, base Express app
2. **MySQL schema, Prisma models, indexes, seed data** ✅
3. **Authentication (JWT + HTTP-only cookies), roles, RBAC** ✅
4. **API architecture — controllers, services, routes, validation, error handling** ✅
5. **Admin application — dashboard, CRUD, media, agents, leads, site visits** ✅
6. **Public website — homepage, property discovery, projects, builders, locations** ✅
7. **Search, filtering, pagination, SEO** ✅ — JSON-LD structured data, sitemap.xml, robots.txt, canonical URLs
8. **Premium UI refinement, animations, responsive design** ✅
9. **Testing, security hardening, performance** ✅
10. **Deployment, domains, DNS, SSL, production environment** ✅ — see [Deployment (Hostinger Business Hosting)](#deployment-hostinger-business-hosting).
    Documentation and production configs (`.htaccess` SPA routing, `.env.production`/
    `.env.production.example`) are ready; the actual live deploy (uploading to hPanel, running
    migrations against the production database, issuing SSL) is a step for whoever holds the
    Hostinger credentials to carry out, following that section.
