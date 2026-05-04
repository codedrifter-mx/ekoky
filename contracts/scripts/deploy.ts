import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  const OfferMarketplace = await ethers.getContractFactory("OfferMarketplace");
  const marketplace = await OfferMarketplace.deploy();
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("OfferMarketplace deployed to:", marketplaceAddress);

  console.log("\n=== Deployment Summary ===");
  console.log("OfferMarketplace:", marketplaceAddress);
  console.log("================================");

  console.log("\nUpdate frontend/src/lib/contracts.ts:");
  console.log(`OFFER_MARKETPLACE_ADDRESS = "${marketplaceAddress}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
