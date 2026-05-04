import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // 1. Deploy EkokyToken
  const EkokyToken = await ethers.getContractFactory("EkokyToken");
  const token = await EkokyToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("EkokyToken deployed to:", tokenAddress);

  // 2. Deploy OfferMarketplace
  const OfferMarketplace = await ethers.getContractFactory("OfferMarketplace");
  const marketplace = await OfferMarketplace.deploy();
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("OfferMarketplace deployed to:", marketplaceAddress);

  // 3. Deploy Staking (token as both staking and reward token)
  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(tokenAddress, tokenAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("Staking deployed to:", stakingAddress);

  // 4. Fund staking contract with reward tokens (10% of max supply)
  const rewardFund = ethers.parseUnits("50000", 18);
  await token.connect(deployer).transfer(stakingAddress, rewardFund);
  console.log("Funded Staking contract with", ethers.formatUnits(rewardFund, 18), "EKY tokens");

  console.log("\n=== Deployment Summary ===");
  console.log("EkokyToken:       ", tokenAddress);
  console.log("OfferMarketplace:  ", marketplaceAddress);
  console.log("Staking:           ", stakingAddress);
  console.log("================================");

  console.log("\nUpdate frontend/src/lib/contracts.ts with these addresses:");
  console.log(`OFFER_MARKETPLACE_ADDRESS = "${marketplaceAddress}"`);
  console.log(`EKOKY_TOKEN_ADDRESS = "${tokenAddress}"`);
  console.log(`STAKING_ADDRESS = "${stakingAddress}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
