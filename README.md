# Ekoky v2 — B2B Food Waste Marketplace

A blockchain-powered marketplace connecting food surplus businesses with redistribution institutions. Ekoky v2 introduces a hybrid on-chain/off-chain architecture with SIWE authentication, role-based access, off-chain interest and messaging, and an upgraded smart contract layer.

## What Changed (v2)

| Before (Revival) | After (v2) |
|---|---|
| Pure frontend ↔ blockchain | Hybrid: Next.js API routes + Prisma + SQLite |
| No authentication | SIWE (Sign-In with Ethereum) + session cookies |
| Single user type | Role-based access: **Business** vs **Institution** |
| Basic offer listing | Offer browsing with **search, filter, and pagination** |
| On-chain "express interest" (gas cost) | **Free, off-chain** interest system via API |
| No communication | **Messaging** between business and institution |
| No metrics | **Impact dashboard** with platform-wide stats |
| `OfferMarketplace` (basic CRUD) | `OfferRegistry` with role-based access and full lifecycle |

### Architecture Highlights

- **Backend Layer:** Next.js API routes handle authentication, offers, interests, messages, and impact metrics
- **Database:** Prisma ORM with SQLite for fast local development (User, Offer, Interest, Message, ImpactMetric)
- **Authentication:** SIWE with `iron-session` for secure, stateful sessions
- **Smart Contracts:** `OfferRegistry` enforces business/institution roles on-chain with offer lifecycle management
- **Frontend:** Next.js 16 App Router with server and client components

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Web3:** wagmi v2, RainbowKit v2, viem, SIWE
- **Backend:** Next.js API routes, Prisma ORM, SQLite, Zod validation
- **Auth:** iron-session, SIWE (Sign-In with Ethereum)
- **Smart Contracts:** Solidity ^0.8.24, Hardhat ^2.22, OpenZeppelin v5, ethers.js v6
- **Local Chain:** Hardhat node (port 8545, chain ID 31337)
- **Wallet:** MetaMask or any RainbowKit-compatible wallet

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   RainbowKit │  │   wagmi     │  │   iron-session      │ │
│  │   (connect)  │  │   (read)    │  │   (auth cookie)     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16 Frontend                       │
│  ┌─────────────────┐  ┌──────────────────────────────────┐  │
│  │   App Router     │  │        API Routes (/api/*)        │  │
│  │   (pages, RSC)   │  │  auth · offers · interests       │  │
│  │                  │  │  messages · impact · users       │  │
│  └─────────────────┘  └──────────────────────────────────┘  │
└──────────┬─────────────────────────────┬────────────────────┘
           │                             │
           ▼                             ▼
┌─────────────────────┐         ┌─────────────────────────────┐
│   Prisma + SQLite    │         │      Hardhat Local Node      │
│   (users, offers,    │         │  ┌─────────────────────────┐ │
│    interests, msgs)  │         │  │   OfferRegistry.sol     │ │
└─────────────────────┘         │  │   EkokyToken.sol        │ │
                                │  │   Staking.sol           │ │
                                │  └─────────────────────────┘ │
                                └─────────────────────────────┘
```

## How to Run Locally

You need **Node.js v20+**, **npm v10+**, and **MetaMask** (or similar wallet).

### 1. Clone & Install

```bash
git clone <repo-url>
cd ekoky

# Install contract dependencies
cd contracts && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Start Local Blockchain

```bash
cd ekoky/contracts
npx hardhat node
```

Keep this running. Copy the private key for **Account #0** — you'll need it for MetaMask.

### 3. Deploy Contracts

```bash
cd ekoky/contracts
npx hardhat run scripts/deploy.ts --network localhost
```

Expected output:
```
EkokyToken deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
OfferRegistry deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Staking deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
Funded Staking contract with 50000.0 EKY tokens
```

> **Note:** Deployed addresses are pre-configured in `frontend/src/lib/contracts.ts`. Update if yours differ.

### 4. Setup Database

```bash
cd ekoky/frontend
npx prisma migrate dev
npx prisma db seed
```

### 5. Configure Environment

```bash
cp .env.example .env
```

Ensure `.env` contains:
```env
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your-project-id>
IRON_SESSION_PASSWORD=<32-character-secret>
```

### 6. Start Frontend

```bash
cd ekoky/frontend
npm run dev
```

Open http://localhost:3000

### 7. Configure MetaMask

1. **Add Hardhat Local Network:**
   - Network name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency symbol: `ETH`

2. **Import Test Account:**
   - Import Account #0 private key
   - You'll see **1,000,000 EKY** tokens and **10,000 ETH**

---

## Feature Guide

### Authentication

1. Go to **Login** or **Register**
2. Connect your wallet via RainbowKit
3. Sign the SIWE message
4. Select your role: **Business** or **Institution**
5. Complete your profile (name, location, description)

### Business Workflow

1. **Create Offer:** Go to **Dashboard** → "New Offer"
   - Fill title, description, category, quantity, pickup address, expiration
   - Submit — offer is stored in SQLite + registered on-chain via `OfferRegistry`
2. **Manage Interests:** View institutions who expressed interest in your offers
   - Accept or reject interests
3. **Messaging:** Message institutions directly to coordinate pickups

### Institution Workflow

1. **Browse Offers:** Go to **Explore**
   - Search by keyword, filter by category, sort by date/relevance
   - Pagination for large result sets
2. **Express Interest:** Click "Express Interest" on any offer
   - Free, off-chain — no gas required
3. **Messaging:** Communicate with businesses to arrange collection

### Staking

1. Go to **Staking** page
2. View your EKY wallet balance
3. Enter amount and click **Stake**
4. MetaMask prompts twice: approve, then stake
5. Watch **Earned Rewards** grow over time
6. Click **Claim Rewards** to collect
7. Click **Unstake** to withdraw

### Impact Dashboard

1. Go to **Impact** page
2. View platform-wide metrics:
   - Total offers created and fulfilled
   - Food diverted (kg)
   - CO₂ saved (kg)
3. Track your personal contribution

---

## Project Structure

```
ekoky/
├── contracts/                    # Hardhat project
│   ├── contracts/
│   │   ├── OfferRegistry.sol     # Role-based offer lifecycle contract
│   │   ├── EkokyToken.sol        # ERC-20 utility token
│   │   ├── Staking.sol           # Staking rewards contract
│   │   └── OfferMarketplace.sol  # Legacy contract (v1)
│   ├── scripts/
│   │   └── deploy.ts             # Deployment script
│   ├── test/
│   │   ├── OfferRegistry.test.ts
│   │   ├── EkokyToken.test.ts
│   │   ├── Staking.test.ts
│   │   └── OfferMarketplace.test.ts
│   ├── hardhat.config.ts
│   └── package.json
│
└── frontend/                     # Next.js 16 app
    ├── prisma/
    │   ├── schema.prisma         # Database schema
    │   ├── seed.ts               # Seed data
    │   └── migrations/           # Prisma migrations
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx              # Home / landing
    │   │   ├── layout.tsx            # Root layout + providers
    │   │   ├── login/page.tsx        # SIWE login
    │   │   ├── register/page.tsx     # Role selection + profile
    │   │   ├── dashboard/page.tsx    # Business dashboard
    │   │   ├── explore/page.tsx      # Browse offers with search/filter
    │   │   ├── impact/page.tsx       # Impact metrics dashboard
    │   │   ├── staking/page.tsx      # Staking interface
    │   │   ├── offers/new/page.tsx   # Create offer
    │   │   └── offers/[id]/page.tsx  # Offer detail + messaging
    │   ├── app/api/
    │   │   ├── auth/
    │   │   │   ├── challenge/route.ts  # SIWE nonce
    │   │   │   ├── verify/route.ts     # SIWE verification + session
    │   │   │   ├── me/route.ts         # Current user
    │   │   │   └── logout/route.ts     # Clear session
    │   │   ├── offers/route.ts         # CRUD offers
    │   │   ├── offers/[id]/route.ts    # Single offer
    │   │   ├── interests/route.ts      # Express/manage interest
    │   │   ├── messages/route.ts       # Send/receive messages
    │   │   ├── impact/route.ts         # Aggregate metrics
    │   │   └── users/route.ts          # User profiles
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   ├── OfferCard.tsx
    │   │   ├── SearchBar.tsx
    │   │   ├── InterestList.tsx
    │   │   ├── MessageThread.tsx
    │   │   ├── StakeForm.tsx
    │   │   └── Providers.tsx
    │   ├── hooks/
    │   │   ├── useAuth.ts
    │   │   ├── useOfferRegistry.ts
    │   │   ├── useEkokyToken.ts
    │   │   └── useStaking.ts
    │   ├── lib/
    │   │   ├── contracts.ts          # ABIs + contract addresses
    │   │   ├── prisma.ts             # Prisma client singleton
    │   │   ├── session.ts            # iron-session config
    │   │   ├── siwe.ts               # SIWE helper
    │   │   └── api.ts                # API client helpers
    │   └── config/
    │       └── wagmi.ts              # wagmi + RainbowKit config
    ├── .env.example
    └── package.json
```

---

## Running Tests

### Contract Tests

```bash
cd contracts
npx hardhat test
```

**Expected:** All tests passing (OfferRegistry, EkokyToken, Staking, OfferMarketplace).

### Build Verification

```bash
cd frontend
npm run build
```

**Expected:** Clean build with no TypeScript or compilation errors.

---

## Troubleshooting

### Windows-Specific

| Issue | Solution |
|-------|----------|
| `Assertion failed: UV_HANDLE_CLOSING` after deploy | Harmless Node.js cleanup bug. Contracts deployed successfully. Ignore it. |
| Port 8545 in use | `Get-NetTCPConnection -LocalPort 8545` then `Stop-Process -Id <PID>` |
| `npm install` fails | `npm cache clean --force` then retry |

### MetaMask / Wallet

| Issue | Solution |
|-------|----------|
| Cannot connect to network | Ensure "Hardhat Local" is selected (not Ethereum Mainnet) |
| Transaction stuck pending | Settings → Advanced → "Clear activity tab data" |
| Wrong nonce error | Same as above — clear activity tab data |
| Imported account shows 0 ETH | Make sure Hardhat node is running and you're on "Hardhat Local" |

### Frontend / API

| Issue | Solution |
|-------|----------|
| "Contract not found" error | Verify addresses in `frontend/src/lib/contracts.ts` match deployed addresses |
| "Unauthorized" on API routes | Ensure you're logged in (wallet connected + SIWE signed) |
| Database errors after schema change | Run `npx prisma migrate dev` and `npx prisma generate` |
| Offers not appearing after creation | Refresh page — blockchain state updates asynchronously |
| Staking shows 0 balance | Connect with deployer account (has 1M EKY) or mint tokens |
| Rewards not increasing | Hardhat mines blocks on transactions. Do another transaction or wait. |

### Contracts

| Issue | Solution |
|-------|----------|
| Tests fail after contract changes | `npx hardhat clean` then `npx hardhat compile` then `npx hardhat test` |
| Hardhat node crashed | Restart it and redeploy contracts |
| Address mismatch after redeploy | Update `frontend/src/lib/contracts.ts` with new addresses |
| "Not registered as business" | Register via frontend or call `registerBusiness()` on OfferRegistry |
| "Not registered as institution" | Register via frontend or call `registerInstitution()` on OfferRegistry |

---

## License

MIT
