# Dependency Update & Refactor Design

**Date**: 2026-05-11
**Scope**: All direct dependencies in `frontend/` and `contracts/`
**Strategy**: Latest everything, skipping only packages with hard ecosystem incompatibilities

---

## 1. Architecture Overview

Two npm packages live in this monorepo:

- **`frontend/`** — Next.js 16 App Router, React 19, Prisma + SQLite, wagmi/RainbowKit, SIWE auth, Tailwind CSS v4
- **`contracts/`** — Hardhat 2, Solidity 0.8.24, OpenZeppelin v5

Each has its own `package.json` and `package-lock.json`. Updates are applied per-package.

---

## 2. Frontend Updates

### 2.1 Patch/Minor Updates (no code changes needed)

| Package | Current | Target | Notes |
|---------|---------|--------|-------|
| next | 16.2.4 | 16.2.6 | Patch; run `npx @next/codemod upgrade patch` |
| react | 19.2.4 | 19.2.6 | Patch |
| react-dom | 19.2.4 | 19.2.6 | Patch |
| @rainbow-me/rainbowkit | ^2.2.10 | 2.2.11 | Patch |
| @tanstack/react-query | ^5.100.9 | 5.100.10 | Patch |
| viem | ^2.48.8 | 2.48.11 | Patch |
| @tailwindcss/postcss | ^4 | 4.3.0 | Minor within v4 |
| tailwindcss | ^4 | 4.3.0 | Minor within v4 |
| eslint-config-next | 16.2.4 | 16.2.6 | Patch |
| @types/react | ^19 | latest ^19 | Patch |
| @types/react-dom | ^19 | latest ^19 | Patch |
| @types/node | ^20 | ^22 | Bump to v22 line |

### 2.2 Prisma 6 → 7 (requires code/config changes)

**Target**: `@prisma/client` 7.8.0, `prisma` CLI 7.8.0

**Breaking changes to address**:

1. **New config file**: Create `frontend/prisma.config.ts` with `defineConfig()` specifying schema path, migrations path, seed command, and datasource URL.
2. **Driver adapters**: Prisma 7 requires explicit driver adapters. For SQLite, install `@prisma/adapter-libsql` and configure `PrismaClient` with `new PrismaLibSQL({ url: 'file:./prisma/dev.db' })` as the adapter.
3. **Import path change**: Client import changes from `import { PrismaClient } from "@prisma/client"` to `import { PrismaClient } from "./generated/prisma/client"`. The generated client output directory changes.
4. **Schema datasource**: The `url` in `schema.prisma` datasource block stays as `env("DATABASE_URL")`, but Prisma 7 resolves SQLite relative paths from the config file location rather than the schema file location. Verify the SQLite file path still resolves correctly.
5. **Seed script**: Update `tsconfig.seed.json` if needed to resolve the new generated client path. Update `prisma/seed.ts` imports accordingly.
6. **`prisma generate` now outputs to `./generated/prisma/`** by default instead of `node_modules/@prisma/client`.

**Files to modify**:
- `frontend/package.json` — update prisma + @prisma/client versions; add `@prismatic/client` driver adapter dep
- `frontend/prisma.config.ts` — new file
- `frontend/src/lib/prisma.ts` — change import path and add driver adapter
- `frontend/prisma/schema.prisma` — verify datasource url resolution
- `frontend/prisma/seed.ts` — update PrismaClient import
- `frontend/tsconfig.seed.json` — may need path adjustments
- All API route files importing from `@prisma/client` — update to new import path

### 2.3 Zod 3 → 4 (requires code review)

**Target**: zod 4.4.3

Zod 4 is largely backward-compatible with Zod 3 schemas for basic use. Key breaking changes:
- The `z.object()`, `z.string()`, `z.number()` etc. APIs are unchanged.
- `.transform()`, `.refine()`, `.superRefine()` continue to work.
- Error mapping uses a new `ZodError` shape — any custom error handling must be reviewed.
- The `z.infer<>` type helper still works.

**Files to review**: All files importing from `zod` in the codebase (primarily API route validators).

### 2.4 Deliberately NOT Upgrading

| Package | Reason |
|---------|--------|
| wagmi (staying on ^2.19) | RainbowKit 2.2.11 has `wagmi: ^2.9.0` as a peer dependency. No RainbowKit version supports wagmi 3. Upgrading would require dropping RainbowKit and building a custom wallet connector — unacceptable UX regression. |
| eslint (staying on ^9) | eslint-config-next 16.2.x targets ESLint 9. ESLint 10 is a major flat-config change and eslint-config-next may not yet support it. |
| typescript (staying on ^5) | Prisma 7 requires TS >=5.7.3 (met). Hardhat 2 and ESLint 9 ecosystem may not yet support TS 6. No benefit to TS 6 in this project. |

---

## 3. Contracts Updates

### 3.1 Patch/Minor Updates

| Package | Current | Target | Notes |
|---------|---------|--------|-------|
| @openzeppelin/contracts | ^5.2.0 | ^5.6.1 | Minor within v5; backward-compatible |

### 3.2 Deliberately NOT Upgrading

| Package | Reason |
|---------|--------|
| hardhat (staying on ^2.22) | Hardhat 3 is a complete architecture rewrite (different config format, different plugin system). This is a separate project. |
| @nomicfoundation/hardhat-toolbox (staying on ^5) | Must match Hardhat 2. |
| typescript (staying on ^5.5) | Hardhat 2 toolbox targets TS 5.x. |

---

## 4. Code Changes Summary

| Change | Files | Effort |
|--------|-------|--------|
| Prisma 7 config file | New `prisma.config.ts`, modify `package.json` seeds | Medium |
| Prisma 7 driver adapter | `src/lib/prisma.ts`, add `@prisma/adapter-libsql` dep | Medium |
| Prisma 7 import paths | All files importing `@prisma/client` → `./generated/prisma/client` | Medium |
| Prisma 7 seed script | `prisma/seed.ts`, `tsconfig.seed.json` | Low |
| Zod 4 validation review | All API routes using `z.*` schemas | Low |
| Next.js codemod run | Automated by `npx @next/codemod upgrade patch` | Low |
| package.json version bumps | Both `package.json` files | Low |
| npm install + build + lint verify | Terminal commands | Low |

---

## 5. Testing Strategy

1. **Install deps**: `npm install` in both `frontend/` and `contracts/`
2. **Contracts compile + test**: `cd contracts && npx hardhat compile && npx hardhat test`
3. **Frontend lint**: `cd frontend && npm run lint`
4. **Frontend build**: `cd frontend && npm run build`
5. **Prisma generate + migrate**: `cd frontend && npx prisma generate && npx prisma migrate dev`
6. **Prisma seed**: `cd frontend && npx prisma db seed`
7. **Manual smoke test**: Start dev server, verify wallet connect, auth flow, offer CRUD, and staking

---

## 6. Rollback Plan

- Git branch for all changes; do not merge until all tests pass
- Each major migration (Prisma, Zod) committed separately for easy revert
- If Prisma 7 migration proves too disruptive, stay on Prisma 6 latest (6.19.x) and only apply other updates