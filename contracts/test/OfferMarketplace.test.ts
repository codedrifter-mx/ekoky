import { expect } from "chai";
import { ethers } from "hardhat";
import { OfferMarketplace } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("OfferMarketplace", function () {
  let marketplace: OfferMarketplace;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("OfferMarketplace");
    marketplace = await Factory.deploy();
  });

  describe("Deployment", function () {
    it("should set the right owner", async function () {
      expect(await marketplace.owner()).to.equal(owner.address);
    });

    it("should start with zero offers", async function () {
      expect(await marketplace.offersCounter()).to.equal(0);
    });
  });

  describe("createOffer", function () {
    it("should create an offer and emit OfferCreated event", async function () {
      const tx = await marketplace.connect(user1).createOffer(
        "Green Grocers",
        "Reduce vegetable waste",
        "Weekly surplus of fresh produce that would otherwise be discarded",
        "123 Green St, Portland"
      );
      
      await expect(tx)
        .to.emit(marketplace, "OfferCreated")
        .withArgs(1, user1.address, "Green Grocers", "Reduce vegetable waste");

      expect(await marketplace.offersCounter()).to.equal(1);
    });

    it("should store the offer with correct data", async function () {
      await marketplace.connect(user1).createOffer(
        "Green Grocers",
        "Reduce vegetable waste",
        "Weekly surplus of fresh produce",
        "123 Green St, Portland"
      );

      const offer = await marketplace.getOffer(1);
      expect(offer.id).to.equal(1);
      expect(offer.creator).to.equal(user1.address);
      expect(offer.name).to.equal("Green Grocers");
      expect(offer.objective).to.equal("Reduce vegetable waste");
      expect(offer.description).to.equal("Weekly surplus of fresh produce");
      expect(offer.location).to.equal("123 Green St, Portland");
      expect(offer.interested).to.equal(0);
    });

    it("should increment offersCounter for each new offer", async function () {
      await marketplace.connect(user1).createOffer("Biz A", "Obj A", "Desc A", "Loc A");
      await marketplace.connect(user2).createOffer("Biz B", "Obj B", "Desc B", "Loc B");

      expect(await marketplace.offersCounter()).to.equal(2);
    });

    it("should revert if name is empty", async function () {
      await expect(
        marketplace.connect(user1).createOffer("", "Objective", "Description", "Location")
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("should revert if objective is empty", async function () {
      await expect(
        marketplace.connect(user1).createOffer("Name", "", "Description", "Location")
      ).to.be.revertedWith("Objective cannot be empty");
    });

    it("should allow empty description and location", async function () {
      await expect(
        marketplace.connect(user1).createOffer("Name", "Objective", "", "")
      ).to.not.be.reverted;
    });
  });

  describe("expressInterest", function () {
    beforeEach(async function () {
      await marketplace.connect(user1).createOffer(
        "Green Grocers", "Reduce waste", "Surplus produce", "Portland"
      );
    });

    it("should increment interested counter", async function () {
      await marketplace.connect(user2).expressInterest(1);
      const offer = await marketplace.getOffer(1);
      expect(offer.interested).to.equal(1);
    });

    it("should increment multiple times", async function () {
      await marketplace.connect(user1).expressInterest(1);
      await marketplace.connect(user2).expressInterest(1);
      const offer = await marketplace.getOffer(1);
      expect(offer.interested).to.equal(2);
    });

    it("should emit InterestExpressed event", async function () {
      await expect(marketplace.connect(user2).expressInterest(1))
        .to.emit(marketplace, "InterestExpressed")
        .withArgs(1, user2.address, 1);
    });

    it("should revert for invalid offer ID", async function () {
      await expect(marketplace.connect(user1).expressInterest(0))
        .to.be.revertedWith("Invalid offer ID");
      await expect(marketplace.connect(user1).expressInterest(999))
        .to.be.revertedWith("Invalid offer ID");
    });
  });

  describe("getOffer", function () {
    it("should revert for invalid offer ID", async function () {
      await expect(marketplace.getOffer(0)).to.be.revertedWith("Invalid offer ID");
      await expect(marketplace.getOffer(999)).to.be.revertedWith("Invalid offer ID");
    });
  });

  describe("getAllOffers", function () {
    it("should return empty array when no offers", async function () {
      const offers = await marketplace.getAllOffers();
      expect(offers.length).to.equal(0);
    });

    it("should return all offers", async function () {
      await marketplace.connect(user1).createOffer("A", "Obj A", "Desc A", "Loc A");
      await marketplace.connect(user2).createOffer("B", "Obj B", "Desc B", "Loc B");

      const offers = await marketplace.getAllOffers();
      expect(offers.length).to.equal(2);
      expect(offers[0].name).to.equal("A");
      expect(offers[1].name).to.equal("B");
    });
  });
});
