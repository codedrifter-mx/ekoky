import { expect } from "chai";
import { ethers } from "hardhat";
import { EkokyToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("EkokyToken", function () {
  let token: EkokyToken;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  const INITIAL_SUPPLY = ethers.parseUnits("1000000", 18);
  const MAX_SUPPLY = ethers.parseUnits("10000000", 18);

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("EkokyToken");
    token = await Factory.deploy();
  });

  describe("Deployment", function () {
    it("should set the right name and symbol", async function () {
      expect(await token.name()).to.equal("Ekoky Token");
      expect(await token.symbol()).to.equal("EKY");
    });

    it("should mint initial supply to deployer", async function () {
      expect(await token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
      expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY);
    });

    it("should set the right owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseUnits("1000", 18);
      await token.connect(owner).mint(user1.address, mintAmount);
      expect(await token.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("should revert if non-owner tries to mint", async function () {
      const mintAmount = ethers.parseUnits("1000", 18);
      await expect(
        token.connect(user1).mint(user2.address, mintAmount)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("should revert if minting exceeds max supply", async function () {
      const overMax = MAX_SUPPLY - INITIAL_SUPPLY + ethers.parseUnits("1", 18);
      await expect(
        token.connect(owner).mint(user1.address, overMax)
      ).to.be.revertedWith("Exceeds max supply");
    });

    it("should allow minting up to max supply", async function () {
      const remaining = MAX_SUPPLY - INITIAL_SUPPLY;
      await token.connect(owner).mint(user1.address, remaining);
      expect(await token.totalSupply()).to.equal(MAX_SUPPLY);
    });
  });

  describe("Transfers", function () {
    it("should allow token transfers between accounts", async function () {
      const amount = ethers.parseUnits("100", 18);
      await token.connect(owner).transfer(user1.address, amount);
      expect(await token.balanceOf(user1.address)).to.equal(amount);

      await token.connect(user1).transfer(user2.address, amount);
      expect(await token.balanceOf(user2.address)).to.equal(amount);
    });
  });
});
