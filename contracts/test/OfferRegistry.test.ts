import { expect } from "chai";
import { ethers } from "hardhat";
import { OfferRegistry } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("OfferRegistry", function () {
  let registry: OfferRegistry;
  let owner: HardhatEthersSigner;
  let business: HardhatEthersSigner;
  let institution: HardhatEthersSigner;
  let other: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, business, institution, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("OfferRegistry");
    registry = await Factory.deploy();
  });

  describe("Deployment", function () {
    it("should set the right owner", async function () {
      expect(await registry.owner()).to.equal(owner.address);
    });

    it("should start with zero offers", async function () {
      expect(await registry.offersCounter()).to.equal(0);
    });
  });

  describe("Registration", function () {
    describe("registerBusiness", function () {
      it("should register a business and emit event", async function () {
        await expect(registry.connect(business).registerBusiness())
          .to.emit(registry, "BusinessRegistered")
          .withArgs(business.address);

        expect(await registry.registeredBusinesses(business.address)).to.be.true;
        expect(await registry.isBusiness(business.address)).to.be.true;
      });

      it("should revert if already registered as business", async function () {
        await registry.connect(business).registerBusiness();
        await expect(registry.connect(business).registerBusiness()).to.be.revertedWith(
          "Already registered as business"
        );
      });

      it("should revert if already registered as institution", async function () {
        await registry.connect(business).registerInstitution();
        await expect(registry.connect(business).registerBusiness()).to.be.revertedWith(
          "Already registered as institution"
        );
      });
    });

    describe("registerInstitution", function () {
      it("should register an institution and emit event", async function () {
        await expect(registry.connect(institution).registerInstitution())
          .to.emit(registry, "InstitutionRegistered")
          .withArgs(institution.address);

        expect(await registry.registeredInstitutions(institution.address)).to.be.true;
        expect(await registry.isInstitution(institution.address)).to.be.true;
      });

      it("should revert if already registered as institution", async function () {
        await registry.connect(institution).registerInstitution();
        await expect(registry.connect(institution).registerInstitution()).to.be.revertedWith(
          "Already registered as institution"
        );
      });

      it("should revert if already registered as business", async function () {
        await registry.connect(institution).registerBusiness();
        await expect(registry.connect(institution).registerInstitution()).to.be.revertedWith(
          "Already registered as business"
        );
      });
    });
  });

  describe("createOffer", function () {
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes("test content"));
    const category = 0; // PRODUCE
    let futureExpiry: number;

    beforeEach(async function () {
      await registry.connect(business).registerBusiness();
      futureExpiry = Math.floor(Date.now() / 1000) + 86400;
    });

    it("should create an offer and emit OfferCreated event", async function () {
      const tx = await registry.connect(business).createOffer(contentHash, category, futureExpiry);

      await expect(tx)
        .to.emit(registry, "OfferCreated")
        .withArgs(1, business.address, contentHash, category, futureExpiry);

      expect(await registry.offersCounter()).to.equal(1);
    });

    it("should store the offer with correct data", async function () {
      await registry.connect(business).createOffer(contentHash, category, futureExpiry);

      const offer = await registry.getOffer(1);
      expect(offer.id).to.equal(1);
      expect(offer.creator).to.equal(business.address);
      expect(offer.contentHash).to.equal(contentHash);
      expect(offer.category).to.equal(category);
      expect(offer.expiresAt).to.equal(futureExpiry);
      expect(offer.status).to.equal(0); // ACTIVE
    });

    it("should increment offersCounter for each new offer", async function () {
      await registry.connect(business).createOffer(contentHash, category, futureExpiry);
      await registry.connect(business).createOffer(ethers.keccak256(ethers.toUtf8Bytes("another")), 1, futureExpiry + 100);

      expect(await registry.offersCounter()).to.equal(2);
    });

    it("should revert if not registered as business", async function () {
      await expect(
        registry.connect(other).createOffer(contentHash, category, futureExpiry)
      ).to.be.revertedWith("Not registered as business");
    });

    it("should revert if content hash is empty", async function () {
      await expect(
        registry.connect(business).createOffer(ethers.ZeroHash, category, futureExpiry)
      ).to.be.revertedWith("Content hash cannot be empty");
    });

    it("should revert if expiration is in the past", async function () {
      const pastExpiry = Math.floor(Date.now() / 1000) - 1;
      await expect(
        registry.connect(business).createOffer(contentHash, category, pastExpiry)
      ).to.be.revertedWith("Expiration must be in the future");
    });
  });

  describe("expressInterest", function () {
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes("test content"));
    const category = 0; // PRODUCE
    let futureExpiry: number;

    beforeEach(async function () {
      await registry.connect(business).registerBusiness();
      await registry.connect(institution).registerInstitution();
      futureExpiry = Math.floor(Date.now() / 1000) + 86400;
      await registry.connect(business).createOffer(contentHash, category, futureExpiry);
    });

    it("should express interest and emit event", async function () {
      await expect(registry.connect(institution).expressInterest(1))
        .to.emit(registry, "InterestExpressed")
        .withArgs(1, institution.address);

      expect(await registry.hasExpressedInterest(1, institution.address)).to.be.true;
    });

    it("should revert if not registered as institution", async function () {
      await expect(registry.connect(other).expressInterest(1)).to.be.revertedWith(
        "Not registered as institution"
      );
    });

    it("should revert for invalid offer ID", async function () {
      await expect(registry.connect(institution).expressInterest(0)).to.be.revertedWith(
        "Invalid offer ID"
      );
      await expect(registry.connect(institution).expressInterest(999)).to.be.revertedWith(
        "Invalid offer ID"
      );
    });

    it("should revert if already expressed interest", async function () {
      await registry.connect(institution).expressInterest(1);
      await expect(registry.connect(institution).expressInterest(1)).to.be.revertedWith(
        "Already expressed interest"
      );
    });

    it("should revert if offer is not active", async function () {
      await registry.connect(business).cancelOffer(1);
      await expect(registry.connect(institution).expressInterest(1)).to.be.revertedWith(
        "Offer not active"
      );
    });

    it("should revert if offer is expired", async function () {
      // Create an offer that expires very soon, then advance time
      const block = await ethers.provider.getBlock("latest");
      const nearExpiry = block!.timestamp + 10;
      await registry.connect(business).createOffer(contentHash, category, nearExpiry);
      await ethers.provider.send("evm_increaseTime", [20]);
      await ethers.provider.send("evm_mine", []);

      await expect(registry.connect(institution).expressInterest(2)).to.be.revertedWith(
        "Offer expired"
      );
    });
  });

  describe("Offer lifecycle", function () {
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes("test content"));
    const category = 0; // PRODUCE
    let futureExpiry: number;

    beforeEach(async function () {
      await registry.connect(business).registerBusiness();
      await registry.connect(institution).registerInstitution();
      futureExpiry = Math.floor(Date.now() / 1000) + 86400;
      await registry.connect(business).createOffer(contentHash, category, futureExpiry);
    });

    describe("cancelOffer", function () {
      it("should cancel an active offer and emit event", async function () {
        await expect(registry.connect(business).cancelOffer(1))
          .to.emit(registry, "OfferCancelled")
          .withArgs(1);

        const offer = await registry.getOffer(1);
        expect(offer.status).to.equal(3); // CANCELLED
      });

      it("should revert if not offer creator", async function () {
        await expect(registry.connect(other).cancelOffer(1)).to.be.revertedWith(
          "Not offer creator"
        );
      });

      it("should revert for invalid offer ID", async function () {
        await expect(registry.connect(business).cancelOffer(0)).to.be.revertedWith(
          "Invalid offer ID"
        );
        await expect(registry.connect(business).cancelOffer(999)).to.be.revertedWith(
          "Invalid offer ID"
        );
      });

      it("should revert if offer is not active", async function () {
        await registry.connect(business).cancelOffer(1);
        await expect(registry.connect(business).cancelOffer(1)).to.be.revertedWith(
          "Can only cancel active offers"
        );
      });
    });

    describe("markAsFulfilled", function () {
      it("should mark active offer as pending fulfillment", async function () {
        await registry.connect(business).markAsFulfilled(1);
        const offer = await registry.getOffer(1);
        expect(offer.status).to.equal(1); // PENDING_FULFILLMENT
      });

      it("should revert if not offer creator", async function () {
        await expect(registry.connect(other).markAsFulfilled(1)).to.be.revertedWith(
          "Not offer creator"
        );
      });

      it("should revert for invalid offer ID", async function () {
        await expect(registry.connect(business).markAsFulfilled(0)).to.be.revertedWith(
          "Invalid offer ID"
        );
        await expect(registry.connect(business).markAsFulfilled(999)).to.be.revertedWith(
          "Invalid offer ID"
        );
      });

      it("should revert if offer is not active", async function () {
        await registry.connect(business).cancelOffer(1);
        await expect(registry.connect(business).markAsFulfilled(1)).to.be.revertedWith(
          "Offer not active"
        );
      });
    });

    describe("fulfillOffer", function () {
      beforeEach(async function () {
        await registry.connect(business).markAsFulfilled(1);
      });

      it("should fulfill a pending offer and emit event", async function () {
        await expect(registry.connect(business).fulfillOffer(1, institution.address))
          .to.emit(registry, "OfferFulfilled")
          .withArgs(1, institution.address);

        const offer = await registry.getOffer(1);
        expect(offer.status).to.equal(2); // FULFILLED
      });

      it("should allow owner to fulfill", async function () {
        await expect(registry.connect(owner).fulfillOffer(1, institution.address))
          .to.emit(registry, "OfferFulfilled")
          .withArgs(1, institution.address);
      });

      it("should revert if not creator or owner", async function () {
        await expect(registry.connect(other).fulfillOffer(1, institution.address)).to.be.revertedWith(
          "Not authorized"
        );
      });

      it("should revert if offer not pending fulfillment", async function () {
        // Create a new active offer
        await registry.connect(business).createOffer(contentHash, category, futureExpiry);
        await expect(registry.connect(business).fulfillOffer(2, institution.address)).to.be.revertedWith(
          "Offer not pending fulfillment"
        );
      });

      it("should revert for invalid offer ID", async function () {
        await expect(registry.connect(business).fulfillOffer(0, institution.address)).to.be.revertedWith(
          "Invalid offer ID"
        );
        await expect(registry.connect(business).fulfillOffer(999, institution.address)).to.be.revertedWith(
          "Invalid offer ID"
        );
      });

      it("should revert if institution not registered", async function () {
        await expect(registry.connect(business).fulfillOffer(1, other.address)).to.be.revertedWith(
          "Not a registered institution"
        );
      });
    });
  });

  describe("View functions", function () {
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes("test content"));
    const category = 0; // PRODUCE
    let futureExpiry: number;

    beforeEach(async function () {
      await registry.connect(business).registerBusiness();
      await registry.connect(institution).registerInstitution();
      futureExpiry = Math.floor(Date.now() / 1000) + 86400;
      await registry.connect(business).createOffer(contentHash, category, futureExpiry);
    });

    describe("getOffer", function () {
      it("should return offer data", async function () {
        const offer = await registry.getOffer(1);
        expect(offer.id).to.equal(1);
        expect(offer.creator).to.equal(business.address);
        expect(offer.contentHash).to.equal(contentHash);
        expect(offer.category).to.equal(category);
        expect(offer.status).to.equal(0); // ACTIVE
      });

      it("should revert for invalid offer ID", async function () {
        await expect(registry.getOffer(0)).to.be.revertedWith("Invalid offer ID");
        await expect(registry.getOffer(999)).to.be.revertedWith("Invalid offer ID");
      });
    });

    describe("isBusiness", function () {
      it("should return true for registered business", async function () {
        expect(await registry.isBusiness(business.address)).to.be.true;
      });

      it("should return false for non-registered address", async function () {
        expect(await registry.isBusiness(other.address)).to.be.false;
      });
    });

    describe("isInstitution", function () {
      it("should return true for registered institution", async function () {
        expect(await registry.isInstitution(institution.address)).to.be.true;
      });

      it("should return false for non-registered address", async function () {
        expect(await registry.isInstitution(other.address)).to.be.false;
      });
    });
  });
});
