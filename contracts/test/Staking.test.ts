import { expect } from "chai";
import { ethers } from "hardhat";
import { EkokyToken, Staking } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Staking", function () {
  let token: EkokyToken;
  let staking: Staking;
  let owner: HardhatEthersSigner;
  let staker1: HardhatEthersSigner;
  let staker2: HardhatEthersSigner;

  const STAKE_AMOUNT = ethers.parseUnits("1000", 18);
  const REWARD_AMOUNT = ethers.parseUnits("50000", 18);

  beforeEach(async function () {
    [owner, staker1, staker2] = await ethers.getSigners();

    const TokenFactory = await ethers.getContractFactory("EkokyToken");
    token = await TokenFactory.deploy();

    const StakingFactory = await ethers.getContractFactory("Staking");
    staking = await StakingFactory.deploy(await token.getAddress(), await token.getAddress());

    await token.connect(owner).transfer(await staking.getAddress(), REWARD_AMOUNT);
  });

  describe("Deployment", function () {
    it("should set staking and reward tokens", async function () {
      expect(await staking.stakingToken()).to.equal(await token.getAddress());
      expect(await staking.rewardToken()).to.equal(await token.getAddress());
    });
  });

  describe("Stake", function () {
    it("should allow users to stake tokens", async function () {
      await token.connect(owner).transfer(staker1.address, STAKE_AMOUNT);
      await token.connect(staker1).approve(await staking.getAddress(), STAKE_AMOUNT);
      await staking.connect(staker1).stake(STAKE_AMOUNT);

      expect(await staking.totalStaked()).to.equal(STAKE_AMOUNT);
    });

    it("should revert if staking zero tokens", async function () {
      await expect(staking.connect(staker1).stake(0)).to.be.revertedWith("Cannot stake 0");
    });
  });

  describe("Unstake", function () {
    beforeEach(async function () {
      await token.connect(owner).transfer(staker1.address, STAKE_AMOUNT);
      await token.connect(staker1).approve(await staking.getAddress(), STAKE_AMOUNT);
      await staking.connect(staker1).stake(STAKE_AMOUNT);
    });

    it("should allow users to unstake tokens", async function () {
      const balanceBefore = await token.balanceOf(staker1.address);
      await staking.connect(staker1).unstake(STAKE_AMOUNT);
      expect(await token.balanceOf(staker1.address)).to.equal(balanceBefore + STAKE_AMOUNT);
    });

    it("should revert if unstaking more than staked", async function () {
      await expect(
        staking.connect(staker1).unstake(STAKE_AMOUNT + ethers.parseUnits("1", 18))
      ).to.be.revertedWith("Insufficient staked balance");
    });

    it("should revert if unstaking zero tokens", async function () {
      await expect(staking.connect(staker1).unstake(0)).to.be.revertedWith("Cannot unstake 0");
    });
  });

  describe("Rewards", function () {
    beforeEach(async function () {
      await token.connect(owner).transfer(staker1.address, STAKE_AMOUNT);
      await token.connect(staker1).approve(await staking.getAddress(), STAKE_AMOUNT);
      await staking.connect(staker1).stake(STAKE_AMOUNT);
    });

    it("should accumulate rewards over time", async function () {
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");

      const earned = await staking.earned(staker1.address);
      expect(earned).to.be.gt(0);
    });

    it("should allow claiming rewards", async function () {
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");

      const earned = await staking.earned(staker1.address);
      expect(earned).to.be.gt(0);

      const balanceBefore = await token.balanceOf(staker1.address);
      await staking.connect(staker1).claimRewards();
      expect(await token.balanceOf(staker1.address)).to.equal(balanceBefore + earned);
    });
  });
});
