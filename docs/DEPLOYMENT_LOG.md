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

## Keeping the deploy repo in sync

`district-one-realty-deploy` (what Hostinger actually redeploys from) needs every fix pushed to
it separately from the source repo — it does not track `Kaifansari-17/district-one-realty`
automatically. Resolved approach: add it as a second local git remote (`deploy`) and, each time,
rebuild a temporary branch off the latest `deploy/main`, merge the source repo's `main` into it
(`--allow-unrelated-histories` only needed the very first time — after that first merge the
histories are related and it's a normal merge), then push that branch to `deploy`'s `main` as an
ordinary fast-forward push. No force-push is ever needed with this approach. In short, repeatable
form:

```bash
git remote add deploy https://github.com/Kaifansari-17/district-one-realty-deploy.git   # once
git fetch deploy
git branch -f deploy-sync deploy/main
git switch deploy-sync
git merge main -m "Sync source repo into Hostinger deploy repo"   # resolve any conflicts in favor of main's content
git push deploy deploy-sync:main
git switch main
git branch -d deploy-sync
```

## Deploy #2 — failed: `npm run build` only builds `apps/api` in the dropdown's eyes, but the Build command dropdown only offers scripts literally named `build`

Tried switching Build command to a custom `build:api:deploy` script (added to build only
`shared-types`, `shared-utils`, `apps/api` — skipping the two frontends, whose devDependencies
had the same problem). **The dropdown only ever lists `None` and `npm run build`** — it doesn't
surface other script names at all, custom or otherwise. Reverted that approach.

**Actual fix**: applied the same devDependencies-to-dependencies move to `apps/public-web` and
`apps/admin-web` (moved `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `tailwindcss`,
`typescript`, `@types/node`, `@types/react`, `@types/react-dom` into `dependencies`; left only
`oxlint`, lint-only, in `devDependencies`). Verified a full clean `npm run build` succeeds for
all five workspaces. This means the API's Web App build now also builds both frontends every
time (wasted time, but unavoidable given the dropdown constraint) — harmless since it doesn't
affect what actually gets deployed (`Output directory`/`Entry file` still point at `apps/api/dist`
only).

## Deploy #3 — build succeeded, but the app crashed on boot: `Cannot find module '@/app'`

Build completed, but `~/domains/api.districtonerealty.com/hbuilds/versions/<id>/nodejs/stderr.log`
showed the app crash-looping with `Error: Cannot find module '@/app'` (a TS path alias configured
in `apps/api/tsconfig.json`'s `paths: { "@/*": ["./src/*"] }`). Plain `tsc` does **not** rewrite
`@/*`-style imports into real relative paths in the compiled JS — it only worked locally because
`tsx` (used for local dev) resolves them itself at runtime; `node dist/server.js` run directly, as
Hostinger does, has no such resolution.

**Fix**: added `tsc-alias` as a dependency and changed `apps/api`'s `build` script to
`tsc -p tsconfig.json && tsc-alias -p tsconfig.json`. Verified `dist/server.js` has no bare `@/`
requires left and boots + connects to MySQL locally.

## Deploy #4 — app booted, but the Prisma query engine crash-looped: `PANIC: timer has gone away`

The app itself booted and even served one request successfully, but
`~/domains/api.districtonerealty.com/hbuilds/versions/<id>/nodejs/stderr.log` then showed a Rust
panic (`thread 'tokio-runtime-worker' panicked ... futures-timer ... timer has gone away`) from
Prisma's Rust query engine, and every subsequently-spawned worker process crashed on startup with
the same panic. Confirmed via SSH that nothing was actually listening on `127.0.0.1:5000` at all
once this started. This is a known class of Prisma issue (see e.g. prisma/prisma#26073 and
similar) that shows up specifically on CPU-throttled/shared-hosting/serverless-style environments,
where the host's process manager pauses and resumes the Node process (LiteSpeed's `lsnode`
supervisor here) and the Rust engine's embedded tokio timer wheel doesn't survive that pause —
not something fixable via retries or env tuning.

**Fix**: switched from Prisma's default Rust query engine to the **driver adapters** feature
(GA since Prisma 6.16, we're on 6.19.3 — no `previewFeatures` flag needed), using
`@prisma/adapter-mariadb` (the officially-recommended adapter for both MariaDB and plain MySQL)
pinned to `6.19.3` to match `@prisma/client`'s version exactly — the package's `latest` tag
(`7.10.0`) targets Prisma 7 and is not API-compatible with our Prisma 6 client. This runs the
`mariadb` npm package (a pure JS/native-binding driver, no separate Rust process/tokio runtime)
instead of the bundled engine binary, which sidesteps the panic entirely.

Note: `@prisma/adapter-mariadb@6.19.3` pins an exact vulnerable `mariadb@3.4.5` (GHSA-cqhc-2h57-wpxf,
high severity — cleartext password leak to a MITM despite `ssl: true`). Forced the patched
`mariadb@3.5.4` via a **nested** override in the root `package.json`:
```json
"overrides": { "@prisma/adapter-mariadb": { "mariadb": "^3.5.4" } }
```
A plain top-level `"mariadb": "^3.5.4"` override did **not** take effect here (`npm ls mariadb`
kept showing `3.4.5` even after a full clean reinstall) — needed the nested form scoped to the
specific parent package. `npm audit` now reports 0 vulnerabilities.

`apps/api/src/config/prisma.ts` now constructs `new PrismaMariaDb(env.DATABASE_URL)` and passes
it as `adapter` to the `PrismaClient` constructor. Verified locally: full clean rebuild, all 38
Vitest tests pass, and a manually-booted `node dist/server.js` served both `/api/health` and a
real DB-backed `/api/properties` query successfully.

**Next step when resuming**: sync this fix into the deploy repo (see "Keeping the deploy repo in
sync" above) and redeploy. If this clears, remaining Phase 10 work is: `prisma migrate deploy` +
seed against production MySQL, static frontend uploads for `public_html`/admin subdomain, and SSL
for all three subdomains.
