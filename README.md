# Ekoky — Food Waste Blockchain Marketplace

An eco-friendly, blockchain-based marketplace connecting businesses with food surplus to institutions that can redistribute it. Originally built as a hackathon project in June 2022, now revived and modernized with 2026 web3 patterns.

## What Changed (Revival)

| Before (2022) | After (2026 Revival) |
|---|---|
| Truffle + Ganache | Hardhat + TypeScript |
| Vanilla JS + Bootstrap 5 | Next.js 15 + React + Tailwind CSS |
| web3.js v1 | wagmi v2 + viem + RainbowKit |
| ABI/source mismatch bugs | Fresh Hardhat compilation |
| `incrementInterested` never worked (postfix increment bug) | Fixed: `offers[_id].interested += 1` |
| PII (email, phone) stored on-chain | Removed — only name, objective, description, location |
| No access control | OpenZeppelin `Ownable` |
| No input validation | `require` checks on all params |
| Single contract (CRUD only) | 3 contracts: OfferMarketplace + EkokyToken (ERC-20) + Staking |
| No production build path | Next.js `npm run build` |

## Tech Stack

- **Smart Contracts:** Solidity ^0.8.24, Hardhat ^2.22, OpenZeppelin v5, ethers.js v6
- **Frontend:** Next.js 16, TypeScript, wagmi v2, RainbowKit v2, Tailwind CSS v4
- **Local Chain:** Hardhat node (port 8545, chain ID 31337)
- **Wallet:** MetaMask

## How to Run Locally

You need **3 separate terminals** and **MetaMask browser extension**.

### Prerequisites

- Node.js v20+ (`node --version`)
- npm v10+ (`npm --version`)
- MetaMask browser extension installed
- Git

### Step 1: Clone & Install

```bash
git clone <repo-url>
cd ekoky

# Install contract dependencies
cd contracts && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Step 2: Start Local Blockchain (Terminal 1)

```bash
cd ekoky/contracts
npx hardhat node
```

Keep this running. It will print **20 test accounts with private keys**. Copy the private key for **Account #0** — you'll need it for MetaMask.

Expected output:
```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Step 3: Deploy Contracts (Terminal 2)

Wait for Terminal 1 to show it's ready, then:

```bash
cd ekoky/contracts
npx hardhat run scripts/deploy.ts --network localhost
```

Expected output:
```
EkokyToken deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
OfferMarketplace deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Staking deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
Funded Staking contract with 50000.0 EKY tokens
```

> **Note:** The deployed addresses are already configured in `frontend/src/lib/contracts.ts`. If they differ, update them there.

### Step 4: Configure MetaMask

1. **Add Hardhat Local Network:**
   - MetaMask → Click network dropdown → "Add Network"
   - **Network name:** `Hardhat Local`
   - **New RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency symbol:** `ETH`

2. **Import Test Account:**
   - MetaMask → "Import Account"
   - Paste the private key from Account #0 (from Terminal 1)
   - You'll see **1,000,000 EKY** tokens and **10,000 ETH**

### Step 5: Start Frontend (Terminal 3)

```bash
cd ekoky/frontend
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Feature Guide

### 🏪 Business — Create Food Waste Offers

1. Go to **Business** page
2. Click **"Create Offer"**
3. Fill in:
   - **Business Name** (required)
   - **Objective** (required) — e.g. "We waste fruit and vegetables weekly"
   - **Description** — details about the food waste
   - **Location** — pickup address
4. Click **"Submit Offer"**
5. MetaMask prompts — click **"Confirm"**
6. Offer appears in the list below

### 🏛️ Institution — Browse & Express Interest

1. Go to **Institution** page
2. Browse available offers
3. Click **"Express Interest"** on any offer
4. MetaMask prompts — click **"Confirm"**
5. The "interested" counter increments

### 💰 Staking — Earn Rewards with EKY Tokens

1. Go to **Home** page (scroll down to staking section)
2. **Wallet Balance** shows your EKY tokens
3. Enter amount to stake, click **"Stake"**
4. MetaMask prompts **twice**: first to approve, then to stake
5. **Earned Rewards** grows over time
6. Click **"Claim Rewards"** to collect
7. Click **"Unstake"** to withdraw your staked tokens

---

## Manual Testing Checklist

| Feature | Steps | Expected Result |
|---------|-------|----------------|
| Create Offer | Business page → Fill form → Submit | Offer appears in list |
| Express Interest | Institution page → Click button | Counter increments |
| Validation | Empty Name/Objective → Submit | Form prevents submission |
| Empty State | Restart Hardhat → Redeploy | "No offers yet" message |
| Token Balance | Connect deployer account | Shows ~950,000 EKY |
| Stake | Enter amount → Click Stake | Staked balance increases |
| Earn Rewards | Wait 10-30s after staking | Earned Rewards > 0 |
| Claim Rewards | Click Claim → Confirm | Balance increases, rewards reset |
| Unstake | Enter amount → Click Unstake | Staked balance decreases |
| Invalid Stake | Enter 0 → Click Stake | MetaMask shows revert error |

---

## Running Contract Tests

```bash
cd contracts
npx hardhat test
```

**Expected:** All 31 tests passing (OfferMarketplace: 15, EkokyToken: 8, Staking: 8).

---

## Project Structure

```
ekoky/
├── contracts/              # Hardhat project
│   ├── contracts/
│   │   ├── OfferMarketplace.sol    # Offer CRUD marketplace
│   │   ├── EkokyToken.sol          # ERC-20 utility token
│   │   └── Staking.sol             # Staking rewards contract
│   ├── scripts/
│   │   └── deploy.ts               # Deployment script
│   ├── test/
│   │   ├── OfferMarketplace.test.ts
│   │   ├── EkokyToken.test.ts
│   │   └── Staking.test.ts
│   ├── hardhat.config.ts
│   └── package.json
│
└── frontend/               # Next.js app
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx              # Home (landing + staking)
    │   │   ├── business/
    │   │   │   └── page.tsx          # Create offers
    │   │   └── institution/
    │   │       └── page.tsx          # Browse + express interest
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   ├── OfferCard.tsx
    │   │   ├── StakeForm.tsx
    │   │   └── Providers.tsx
    │   ├── hooks/
    │   │   ├── useOfferMarketplace.ts
    │   │   ├── useEkokyToken.ts
    │   │   └── useStaking.ts
    │   ├── lib/
    │   │   └── contracts.ts          # ABIs + addresses
    │   └── config/
    │       └── wagmi.ts              # Chain config
    └── package.json
```

---

## Troubleshooting

### Windows-Specific

| Issue | Solution |
|-------|----------|
| `Assertion failed: UV_HANDLE_CLOSING` after deploy | Harmless Node.js cleanup bug. Contracts deployed successfully. Ignore it. |
| Port 8545 in use | `Get-NetTCPConnection -LocalPort 8545` then `Stop-Process -Id <PID>` |
| `npm install` fails | `npm cache clean --force` then retry |

### MetaMask

| Issue | Solution |
|-------|----------|
| Cannot connect to network | Ensure "Hardhat Local" is selected (not Ethereum Mainnet) |
| Transaction stuck pending | Settings → Advanced → "Clear activity tab data" |
| Wrong nonce error | Same as above — clear activity tab data |
| Imported account shows 0 ETH | Make sure Hardhat node is running and you're on "Hardhat Local" |

### Frontend

| Issue | Solution |
|-------|----------|
| "Contract not found" error | Verify addresses in `frontend/src/lib/contracts.ts` match deployed addresses |
| "Too many re-renders" error | Refresh page — fixed in latest commit |
| Offers not appearing after creation | Wait 2-3 seconds and refresh. Blockchain state updates asynchronously. |
| Staking shows 0 balance | Make sure you're connected with the deployer account (has 1M EKY) |
| Rewards not increasing | Hardhat mines blocks on transactions. Do another transaction or wait. |

### Contracts

| Issue | Solution |
|-------|----------|
| Tests fail after contract changes | `npx hardhat clean` then `npx hardhat compile` then `npx hardhat test` |
| Hardhat node crashed | Restart it and redeploy contracts |
| Address mismatch after redeploy | Update `frontend/src/lib/contracts.ts` with new addresses |

---

## License

MIT
