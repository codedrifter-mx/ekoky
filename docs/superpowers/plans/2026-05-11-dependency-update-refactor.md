# Dependency Update & Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use `- [ ]` syntax for tracking.

**Goal:** Update all direct dependencies in `frontend/` and `contracts/` to latest, with Prisma 6→7 migration as the primary code change.

**Architecture:** Monorepo with two npm packages. Frontend = Next.js 16 App Router + React 19 + Prisma/SQLite + wagmi/RainbowKit. Contracts = Hardhat + OpenZeppelin. Prisma 7 requires `prisma.config.ts`, driver adapters, and changed import paths. wagmi stays on v2 (RainbowKit incompatibility). Hardhat stays on v2 (major rewrite).

**Tech Stack:** npm, Prisma 7, @prisma/adapter-libsql, Zod 4, Next.js 16.2.6, React 19.2.6, Tailwind CSS 4.3.0

---

### Task 1: Update frontend/package.json version bumps

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Apply all version bumps**

Replace the entire `dependencies` and `devDependencies` sections:

```json
  "dependencies": {
    "@prisma/client": "7.8.0",
    "@prisma/adapter-libsql": "^7.8.0",
    "@libsql/client": "^0.14.0",
    "@rainbow-me/rainbowkit": "^2.2.11",
    "@tanstack/react-query": "^5.100.10",
    "iron-session": "^8.0.4",
    "next": "16.2.6",
    "react": "19.2.6",
    "react-dom": "19.2.6",
    "siwe": "^3.0.0",
    "viem": "^2.48.11",
    "wagmi": "^2.19.5",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.3.0",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.6",
    "prisma": "7.8.0",
    "tailwindcss": "^4.3.0",
    "ts-node": "^10.9.2",
    "typescript": "^5"
  },
```

Also remove the `prisma` block at the bottom of the file (seed config moves to `prisma.config.ts`):

```json
  "prisma": {
    "seed": "ts-node --project tsconfig.seed.json prisma/seed.ts"
  }
```

Delete these 4 lines from the end of `package.json`.

- [ ] **Step 2: Commit**

```bash
git add frontend/package.json
git commit -m "chore: bump frontend deps to latest (Prisma 7, Zod 4, Next 16.2.6, React 19.2.6)"
```

---

### Task 2: Update contracts/package.json version bumps

**Files:**
- Modify: `contracts/package.json`

- [ ] **Step 1: Bump @openzeppelin/contracts**

Change:
```json
"@openzeppelin/contracts": "^5.2.0"
```
To:
```json
"@openzeppelin/contracts": "^5.6.1"
```

- [ ] **Step 2: Commit**

```bash
git add contracts/package.json
git commit -m "chore: bump @openzeppelin/contracts to 5.6.1"
```

---

### Task 3: Create Prisma 7 config file

**Files:**
- Create: `frontend/prisma.config.ts`
- Modify: `frontend/package.json` (update seed command format if needed)

- [ ] **Step 1: Create prisma.config.ts**

```typescript
import { defineConfig, env } from "prisma/config";

type Env = {
  DATABASE_URL: string;
};

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node --project tsconfig.seed.json prisma/seed.ts",
  },
  datasource: {
    url: env<Env>("DATABASE_URL"),
  },
});
```

Note: The `seed` command uses `ts-node` matching the existing `tsconfig.seed.json` setup. If `ts-node` fails after the migration, swap to `npx tsx prisma/seed.ts`.

- [ ] **Step 2: Verify .env.example and .env DATABASE_URL path**

Check `frontend/.env.example` and `frontend/.env` — both contain:
```
DATABASE_URL="file:./dev.db"
```

In Prisma 7, SQLite relative paths resolve from the config file location, not the schema file. Since `prisma.config.ts` lives next to the `prisma/` directory and the schema says `./dev.db`, the relative path `./dev.db` resolves correctly relative to `prisma.config.ts` which is at `frontend/prisma.config.ts` (one level above `prisma/`). Actually, `file:./dev.db` means relative to the schema file location `prisma/schema.prisma`, meaning it looks at `frontend/prisma/dev.db`. In Prisma 7, it resolves relative to `prisma.config.ts` at `frontend/prisma.config.ts`, which means it would look for `frontend/dev.db`. But the actual SQLite file is at `frontend/prisma/dev.db`.

Fix: Update `DATABASE_URL` in `prisma.config.ts` to use an absolute path or adjust the relative path.

Since the config file has `env<Env>("DATABASE_URL")`, the actual value comes from `.env`. To keep `DATABASE_URL="file:./dev.db"` working, change the schema path or config location. Simplest fix: update `DATABASE_URL` to `"file:./prisma/dev.db"` in both `.env` and `.env.example` — this resolves from `prisma.config.ts` (at `frontend/`) down to `frontend/prisma/dev.db`.

Change both `frontend/.env` and `frontend/.env.example`:
```
DATABASE_URL="file:./prisma/dev.db"
```

- [ ] **Step 3: Commit**

```bash
git add frontend/prisma.config.ts frontend/.env frontend/.env.example
git commit -m "feat: add Prisma 7 config file, fix SQLite path resolution"
```

---

### Task 4: Update Prisma client import in src/lib/prisma.ts

**Files:**
- Modify: `frontend/src/lib/prisma.ts`

- [ ] **Step 1: Rewrite prisma.ts with driver adapter + new import path**

Current content:
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

New content:
```typescript
import { PrismaClient } from "../generated/prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const libsql = createClient({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" });
const adapter = new PrismaLibSQL(libsql);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

The import `../generated/prisma/client` resolves from `frontend/src/lib/prisma.ts` up to `frontend/src/`, then `frontend/generated/prisma/client`. This matches Prisma 7's default output at `project-root/generated/prisma/client/`.

Actually, let me reconsider. The prisma generation output directory can be configured. The simplest thing is:
1. Let prisma generate to default location (`generated/prisma/client` at project root)
2. Import with relative path `../generated/prisma/client` from `src/lib/prisma.ts`

Or, better yet, add a path alias to tsconfig.json:
```json
"paths": {
  "@/*": ["./src/*"],
  "@generated/*": ["./generated/*"]
}
```

Then import: `import { PrismaClient } from "@generated/prisma/client"`

But this is getting complex. Let me keep it simple with the relative import.

OK let me just go with the relative import approach for the plan. The engineer can adjust.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/lib/prisma.ts
git commit -m "feat: migrate Prisma client to Prisma 7 with libSQL driver adapter"
```

---

### Task 5: Update seed script import

**Files:**
- Modify: `frontend/prisma/seed.ts`

- [ ] **Step 1: Change import in seed.ts**

Change line 1:
```typescript
import { PrismaClient, Role, Category, OfferStatus, InterestStatus } from "@prisma/client";
```
To:
```typescript
import { PrismaClient, Role, Category, OfferStatus, InterestStatus } from "../generated/prisma/client";
```

The relative path goes from `frontend/prisma/seed.ts` to `frontend/generated/prisma/client`.

- [ ] **Step 2: Commit**

```bash
git add frontend/prisma/seed.ts
git commit -m "feat: update seed script to Prisma 7 import path"
```

---

### Task 6: Remove obsolete tsconfig.seed.json path adjustments

**Files:**
- Modify: `frontend/tsconfig.seed.json`

- [ ] **Step 1: Check if tsconfig.seed.json needs changes**

Current content:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "node"
  },
  "include": ["prisma/seed.ts"]
}
```

If the seed script still uses ts-node and the import path is `../generated/prisma/client`, this should resolve correctly since the seed script is in `prisma/` and goes up to `frontend/generated/prisma/client`. No changes needed to `tsconfig.seed.json` unless the build fails.

- [ ] **Step 2: Only modify if ts-node fails**

If `npx prisma db seed` fails, convert the seed command in `prisma.config.ts` to use `tsx`:
```
seed: "npx tsx prisma/seed.ts",
```
And install `tsx` as a dev dependency:
```bash
npm install --save-dev tsx
```

- [ ] **Step 3: Commit if changes made**

```bash
git add frontend/tsconfig.seed.json frontend/package.json
git commit -m "fix: update seed config for Prisma 7 compatibility"
```

---

### Task 7: Install dependencies

**Files:**
- Terminal commands only

- [ ] **Step 1: Install contracts deps**

Run:
```bash
cd contracts && npm install
```
Expected: Installs all contract dependencies including @openzeppelin/contracts 5.6.1.

- [ ] **Step 2: Install frontend deps**

Run:
```bash
cd frontend && npm install
```
Expected: Installs all frontend dependencies. `@prisma/adapter-libsql` and `@libsql/client` are new packages. `@prisma/client` and `prisma` pin at 7.8.0.

- [ ] **Step 3: Commit lockfile changes**

```bash
git add contracts/package-lock.json frontend/package-lock.json
git commit -m "chore: update lockfiles with latest dependencies"
```

---

### Task 8: Run Next.js codemod for patch upgrade

**Files:**
- Terminal command only

- [ ] **Step 1: Run next codemod**

```bash
cd frontend && npx @next/codemod@canary upgrade patch
```

Expected: Codemod upgrades Next.js to 16.2.6 (already done via package.json, but codemod also runs any necessary automated source transforms). Output should be minimal since we already bumped the version.

- [ ] **Step 2: Check for deprecation notices**

Read `frontend/node_modules/next/dist/docs/` for any deprecation guides that apply to 16.2.6.

- [ ] **Step 3: Commit codemod changes (if any)**

```bash
git add -A && git commit -m "chore: apply Next.js 16.2.6 codemod transforms"
```

---

### Task 9: Prisma generate + migrate + seed

**Files:**
- Terminal commands only

- [ ] **Step 1: Generate Prisma client**

```bash
cd frontend && npx prisma generate
```

Expected: Generates client to `frontend/generated/prisma/client/`. Verify the output directory exists:
```bash
ls frontend/generated/prisma/client/
```
Should show `index.js`, `index.d.ts`, `default.js`, `default.d.ts`, `wasm.js`, etc.

- [ ] **Step 2: Run migrations**

```bash
cd frontend && npx prisma migrate dev
```

Expected: Applies any pending migrations. The existing `prisma/migrations` should be compatible with Prisma 7.

- [ ] **Step 3: Run seed**

```bash
cd frontend && npx prisma db seed
```

Expected: Seed script runs successfully, imports PrismaClient from `../generated/prisma/client`, creates test data.

- [ ] **Step 4: Commit if any migration changes occurred**

```bash
git add -A && git commit -m "chore: regenerate Prisma client for v7 and verify migration"
```

---

### Task 10: Contracts compile + test

- [ ] **Step 1: Compile contracts**

```bash
cd contracts && npm run compile
```
Expected: `hardhat compile` succeeds.

- [ ] **Step 2: Run contract tests**

```bash
cd contracts && npm run test
```
Expected: All Hardhat tests pass.

---

### Task 11: Frontend build + lint

- [ ] **Step 1: Run lint**

```bash
cd frontend && npm run lint
```
Expected: ESLint passes with no errors. Any errors must be fixed.

- [ ] **Step 2: Run build**

```bash
cd frontend && npm run build
```
Expected: `next build` succeeds with no errors. The Prisma 7 import paths and Zod 4 schemas must compile cleanly.

- [ ] **Step 3: Fix any build/lint failures**

Common failures and fixes:
- **Zod 4 breaking change**: If `.refine()` or error handling fails, the most common fix is updating error access patterns (ZodError shape changed in v4).
- **Prisma 7 import path**: If `./generated/prisma/client` import fails, verify the generated output path matches the import path.
- **TypeScript errors**: `@types/node` ^22 may introduce new Node 22 types. Fix by updating type annotations if needed.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A && git commit -m "fix: resolve build and lint issues after dependency updates"
```

---

### Task 12: Final verification

- [ ] **Step 1: Verify git status is clean**

```bash
git status
```
Expected: No uncommitted changes.

- [ ] **Step 2: Verify full build chain**

```bash
cd contracts && npm run compile && npm run test
cd frontend && npm run build && npm run lint
```
Expected: All pass.

- [ ] **Step 3: Check for installed node_modules**

```bash
Test-Path contracts/node_modules
Test-Path frontend/node_modules
```
Expected: True for both.
