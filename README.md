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
