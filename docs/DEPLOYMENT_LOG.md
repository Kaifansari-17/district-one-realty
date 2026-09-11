# Deployment Log — Hostinger Business Hosting

Running record of the actual production deployment, kept so it can be replayed, audited, or
picked up again in a future session without re-deriving everything from scratch. See also the
[Deployment section in the README](../README.md#deployment-hostinger-business-hosting) — note
that section describes the classic "Setup Node.js App" (Passenger) flow, which turned out **not**
to be what this account's hPanel actually exposes (see below). This log reflects what actually
worked.

**Server**: Hostinger shared hosting, account `u762137287`, IP `82.25.120.194`, SSH port `65002`.
This is a shared agency account hosting multiple unrelated client domains
(`bookyourproperties.com`, `codesniffs.com`, `mensfashiontailor.com`, `resonancediagnostic.com`,
`rkidwale.com`, plus a Hostinger default subdomain) — **every command run here is scoped to
`~/domains/districtonerealty.com/` and `~/domains/api.districtonerealty.com/` only.**

**SSH access**: key-based, via a dedicated ed25519 key generated for this deployment
(`district-one-realty-deploy`, added under hPanel → Advanced → SSH Access → SSH keys). No
password was ever transmitted through chat.

```bash
ssh -p 65002 u762137287@82.25.120.194
```

**Secrets**: real production values (DB password, JWT secret, Super Admin password) are
intentionally **not** written into this file — they were exchanged directly with the account
owner. Ask them if you need to rotate or look one up.

---

## 2026-09-11 — Initial survey

Confirmed via SSH:
- `node`/`npm` are not on PATH by default outside of an actual deployed app's own environment.
  `git` is available globally (v2.47.3).
- `~/domains/districtonerealty.com/public_html/` was serving a static "Coming Soon" placeholder
  page — no app deployed yet.
- No `admin` or `api` subdomains existed yet.

## The actual Node.js hosting flow on this account

The classic "Setup Node.js App" (Phusion Passenger) feature — what the README's Deployment
section assumes — **does not appear anywhere in this account's hPanel** (checked under both
"Advanced" and "Website" for the `districtonerealty.com` site). Instead, this account has
Hostinger's newer, separate **"Web Apps" hosting product**, reached via the top-level
**Websites → Add Website → Deploy Web App**, with three options: import a Git repo, upload a zip,
or an IDE connector extension. We used **Import Git Repository**.

Key differences from the README's assumed flow:
- Each app becomes its **own top-level "Website" entry** in hPanel (not a subdomain nested inside
  the main site's management), even though it's technically serving a subdomain of the same
  domain.
- Deploying "from GitHub" does **not** deploy directly from your existing repo. It **creates a
  brand-new GitHub repository** (cloned from the one you point it at) and deploys from that new
  repo instead. Naming the new repo the same as the source repo fails (GitHub name collision) —
  we named it `district-one-realty-deploy`.
- **Consequence**: pushes to the real source repo (`Kaifansari-17/district-one-realty`) do **not**
  automatically appear in `district-one-realty-deploy`. Any fix needs to be pushed to
  `district-one-realty-deploy` directly (or re-synced some other way) before clicking "Redeploy" —
  this hasn't been fully solved yet; see "Open question" below.
- The wizard's monorepo support is basic: "Root directory" (left at `./`, i.e. repo root — needed
  so `npm install` at the root correctly links `@district-one/shared-types`/`shared-utils` via npm
  workspaces) plus free-text **Output directory** and **Entry file** fields, but the **Build
  command is a dropdown restricted to whatever scripts already exist in the repo's root
  `package.json`** — you can't type an arbitrary custom command. We used the existing `npm run
  build` (builds both shared packages, the API, and both frontends — more than strictly necessary
  for this app, but simplest given the dropdown constraint).

### Working configuration for the `api.districtonerealty.com` Web App

| Field | Value |
|---|---|
| Framework preset | Other |
| Branch | main |
| Node version | 22.x |
| Root directory | `./` |
| Build command | `npm run build` (dropdown-selected, not custom) |
| Package manager | npm |
| Output directory | `apps/api/dist` |
| Entry file | `apps/api/dist/server.js` |
| Environment variables | full production `.env` imported as a file (see Secrets note above) |

## Deploy #1 — failed: missing devDependencies for `apps/api`

First deploy attempt failed at the `apps/api` build step (`tsc -p tsconfig.json`) with ~150 type
errors — every single one either a Node.js built-in (`process`, `Buffer`, `console`, `global`,
`node:path`, etc., all only resolvable via `@types/node`) or a missing `@types/*` package
(`express`, `cors`, `cookie-parser`, `compression`, `hpp`, `morgan`, `multer`, `bcryptjs`,
`jsonwebtoken`). `packages/shared-types` and `packages/shared-utils` built cleanly just before it.

**Diagnosis**: those packages were all in `apps/api`'s `devDependencies`, and something in
Hostinger's build environment (likely applying `NODE_ENV=production` — visible in the imported env
file — during `npm install`, which makes npm skip devDependencies) meant they never got installed
for that workspace specifically. `typescript` itself is also a devDependency but happened to still
resolve via hoisting from another workspace (`public-web`/`admin-web`/the shared packages all also
depend on it) — which is also why a couple of stray-looking type errors (`err` narrowed as
`unknown` in `errorHandler.ts`, a `cloudinary` `UploadStream.end` mismatch) that never reproduce
locally showed up: the hoisted `typescript`/`cloudinary` resolved to different versions than the
ones actually pinned in `apps/api/package.json`.

**Fix**: moved every package `apps/api` needs at build-time or runtime — `typescript`, `prisma`
(the CLI), and all ten `@types/*` packages — from `devDependencies` into `dependencies`. Left only
genuinely test-only packages (`vitest`, `supertest`, `@types/supertest`, plus `tsx`, used for local
dev hot-reload only) in `devDependencies`. Verified locally: clean `tsc --noEmit`, clean
`npm run build:api`, all 38 Vitest tests still pass. Committed and pushed to the source repo.

## Open question — getting the fix into the deploy repo

`district-one-realty-deploy` (what Hostinger actually redeploys from) needs this same commit
before clicking "Redeploy" will pick it up. Options to resolve, not yet executed:
1. Push directly to `Kaifansari-17/district-one-realty-deploy` as a second git remote (simplest,
   if the same cached GitHub credentials that pushed the source repo also have write access here).
2. Check whether Hostinger's dashboard for this Web App has a "sync from source" or "change
   repository" option that could point it back at the real source repo instead of its clone.

**Next step when resuming**: try option 1 first.
