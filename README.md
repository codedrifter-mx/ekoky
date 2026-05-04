# Ekoky — Food Waste Blockchain Marketplace

An eco-friendly, blockchain-based marketplace connecting businesses with food surplus to institutions that can redistribute it. Built with modern 2026 web3 patterns.

## Tech Stack

- **Smart Contracts:** Solidity ^0.8.24, Hardhat, OpenZeppelin v5
- **Frontend:** Next.js 15, TypeScript, wagmi v2, RainbowKit, Tailwind CSS
- **Local Chain:** Hardhat node (port 8545, chain ID 31337)

## Quick Start

### Prerequisites

- Node.js v20+ (LTS)
- MetaMask browser extension
- Git

### 1. Install Dependencies

```bash
# Contracts
cd contracts && npm install

# Frontend
cd frontend && npm install
```

### 2. Start Local Blockchain

```bash
cd contracts
npx hardhat node
```

Keep this terminal running. Hardhat will print 20 test accounts with private keys.

### 3. Deploy Contracts

In a new terminal:

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```

Note the deployed `OfferMarketplace` address from the output. If it differs from the default in `frontend/src/lib/contracts.ts`, update the address there.

### 4. Configure MetaMask

1. Open MetaMask → Networks → Add Network → Add Network Manually
2. Enter:
   - **Network name:** Hardhat Local
   - **New RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency symbol:** ETH
3. Switch to the "Hardhat Local" network
4. Import a test account: Click "Import Account" and paste one of the private keys printed by `npx hardhat node`

### 5. Start Frontend

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000`.

## Manual Testing

### Test: Create an Offer (Business)

1. Connect your wallet on the Business page
2. Click "Create Offer"
3. Fill in:
   - Business Name: `Test Restaurant`
   - Objective: `Reduce food waste`
   - Description: `Daily surplus of prepared meals`
   - Location: `456 Main St`
4. Click "Submit Offer"
5. MetaMask will prompt — click "Confirm"
6. Wait for transaction confirmation
7. The offer should appear in the list below
8. ✅ Verify: offer card shows name, objective, description, location, "0 interested"

### Test: Express Interest (Institution)

1. Switch to the Institution page
2. Connect your wallet (same or different account)
3. Find the offer created above
4. Click "Express Interest" button on the offer card
5. MetaMask will prompt — click "Confirm"
6. Wait for transaction confirmation
7. ✅ Verify: "interested" count changes from "0" to "1"
8. Click "Express Interest" again from a different account
9. ✅ Verify: count increments to "2"

### Test: Validation (Business)

1. Try to create an offer with empty "Business Name"
2. ✅ Verify: form validation prevents submission (HTML `required` attribute)
3. Try to create an offer with empty "Objective"
4. ✅ Verify: form validation prevents submission

### Test: Empty State

1. Stop and restart the Hardhat node: `Ctrl+C` then `npx hardhat node`
2. Redeploy: `npx hardhat run scripts/deploy.ts --network localhost`
3. Update contract address in `frontend/src/lib/contracts.ts` if needed
4. Refresh frontend
5. ✅ Verify: Business page shows "No offers yet. Create one above!"
6. ✅ Verify: Institution page shows "No offers available yet."

### Test: Multiple Offers

1. Create 3-4 offers as a business
2. ✅ Verify: All offers appear in both Business and Institution pages
3. Express interest on different offers from different accounts
4. ✅ Verify: Each offer's interest count updates independently

## Phase 2 Manual Testing: Token + Staking

### Prerequisites

Start a fresh local chain and deploy all three contracts:

```bash
# Terminal 1: Start Hardhat node
cd contracts
npx hardhat node

# Terminal 2: Deploy all contracts
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```

Copy the three deployed addresses from the deployment output and update `frontend/src/lib/contracts.ts`:
- `OFFER_MARKETPLACE_ADDRESS`
- `EKOKY_TOKEN_ADDRESS`
- `STAKING_ADDRESS`

### Test: Token Balance Display

1. Connect MetaMask using the deployer account (the one that received 1M EKY tokens)
2. Open `http://localhost:3000`
3. ✅ Verify: "Wallet Balance" shows approximately 950,000 EKY (1M minus 50K sent to staking contract)
4. ✅ Verify: "Total Staked (Protocol)" shows 0 EKY

### Test: Stake Tokens

1. Enter `100` in the "Amount to stake" field
2. Click "MAX" button — it should populate with your full wallet balance
3. Clear and enter `100` again
4. Click "Stake"
5. MetaMask will prompt twice:
   - First prompt: **Token approval** — approve the Staking contract to spend 100 EKY
   - Second prompt: **Stake transaction** — confirm the stake
6. After both transactions confirm:
7. ✅ Verify: "Staked" shows ~100 EKY
8. ✅ Verify: "Wallet Balance" decreased by ~100 EKY
9. ✅ Verify: "Total Staked (Protocol)" shows ~100 EKY

### Test: Earn Rewards

1. Wait 10-30 seconds after staking
2. ✅ Verify: "Earned Rewards" shows a value > 0 (grows over time)
3. Click "Claim Rewards"
4. MetaMask prompt — click "Confirm"
5. ✅ Verify: Wallet balance increases by the claimed reward amount
6. ✅ Verify: "Earned Rewards" resets to ~0 after claiming

### Test: Unstake Tokens

1. Enter the amount you staked earlier (e.g., `100`) in the "Unstake" field
2. Click "MAX" — it should populate with your currently staked amount
3. Enter `100` again
4. Click "Unstake"
5. MetaMask prompt — click "Confirm"
6. ✅ Verify: "Staked" balance shows 0 or close to 0
7. ✅ Verify: "Wallet Balance" increased by the unstaked amount

### Test: Staking with Multiple Accounts

1. Import a second Hardhat test account into MetaMask (use a private key from the node output)
2. Switch to the deployer account
3. Send 500 EKY tokens to the second account using MetaMask
4. Switch MetaMask to the second account
5. ✅ Verify: Wallet balance shows ~500 EKY
6. Stake 200 EKY from the second account
7. ✅ Verify: Both accounts can stake independently
8. ✅ Verify: "Total Staked (Protocol)" reflects combined staked amount

### Test: Invalid Inputs

1. Try to stake 0 EKY
2. ✅ Verify: Transaction reverts with "Cannot stake 0"
3. Try to unstake more than your staked balance
4. ✅ Verify: Transaction reverts with "Insufficient staked balance"
5. Try to claim rewards when you have 0
6. ✅ Verify: Transaction reverts with "No rewards to claim"

## Troubleshooting (Phase 2)

- **"ERC20: insufficient allowance"**: You need to approve the Staking contract first. The UI handles this automatically via the two-transaction flow.
- **"ERC20: transfer from the zero address"**: Ensure the staking contract has reward tokens. The deploy script sends 50K EKY to the staking contract automatically.
- **Rewards not increasing**: Time-based rewards require the Hardhat node to be mining blocks. Use `evm_increaseTime` in the Hardhat console, or just wait — the local node mines blocks on transactions.
- **Approve then stake fails**: If you approved then staking didn't trigger, the auto-approve-and-stake flow may have a race condition. Click "Stake" again — it will skip approval if already approved.

## Project Structure

```
ekoky/
├── contracts/          # Hardhat project
│   ├── contracts/      # Solidity contracts
│   ├── scripts/        # Deployment scripts
│   ├── test/           # Contract tests
│   └── ...
└── frontend/           # Next.js app
    ├── src/
    │   ├── app/        # App Router pages
    │   ├── components/ # React components
    │   ├── hooks/      # wagmi hooks
    │   └── lib/        # Contract ABIs + addresses
    └── ...
```

## Troubleshooting

- **"Cannot connect to network"**: Ensure Hardhat node is running and MetaMask is on "Hardhat Local"
- **"Contract not found"**: Verify the address in `frontend/src/lib/contracts.ts` matches the deployed address
- **Transaction stuck pending**: Reset MetaMask nonce: Settings → Advanced → Clear activity tab data
- **Wrong data / stale state**: Hard refresh the page (Ctrl+Shift+R). Hardhat resets when restarted.
- **"No offers yet" after creating**: Wait a few seconds and refresh — the blockchain state updates asynchronously
