// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract OfferRegistry is Ownable {
    enum OfferCategory { PRODUCE, DAIRY, BAKERY, PREPARED, PACKAGED, BEVERAGES, MIXED }
    enum OfferStatus { ACTIVE, PENDING_FULFILLMENT, FULFILLED, CANCELLED }

    struct Offer {
        uint256 id;
        address creator;
        bytes32 contentHash;
        OfferCategory category;
        uint256 expiresAt;
        uint256 createdAt;
        OfferStatus status;
    }

    uint256 public offersCounter;

    mapping(uint256 => Offer) public offers;
    mapping(address => bool) public registeredBusinesses;
    mapping(address => bool) public registeredInstitutions;
    mapping(uint256 => mapping(address => bool)) public hasExpressedInterest;

    event OfferCreated(uint256 indexed id, address indexed creator, bytes32 contentHash, OfferCategory category, uint256 expiresAt);
    event OfferFulfilled(uint256 indexed id, address indexed institution);
    event OfferCancelled(uint256 indexed id);
    event BusinessRegistered(address indexed business);
    event InstitutionRegistered(address indexed institution);
    event InterestExpressed(uint256 indexed offerId, address indexed institution);

    constructor() Ownable(msg.sender) {}

    function registerBusiness() external {
        require(!registeredBusinesses[msg.sender], "Already registered as business");
        require(!registeredInstitutions[msg.sender], "Already registered as institution");
        registeredBusinesses[msg.sender] = true;
        emit BusinessRegistered(msg.sender);
    }

    function registerInstitution() external {
        require(!registeredInstitutions[msg.sender], "Already registered as institution");
        require(!registeredBusinesses[msg.sender], "Already registered as business");
        registeredInstitutions[msg.sender] = true;
        emit InstitutionRegistered(msg.sender);
    }

    function createOffer(
        bytes32 _contentHash,
        OfferCategory _category,
        uint256 _expiresAt
    ) external returns (uint256) {
        require(registeredBusinesses[msg.sender], "Not registered as business");
        require(_contentHash != bytes32(0), "Content hash cannot be empty");
        require(_expiresAt > block.timestamp, "Expiration must be in the future");

        offersCounter++;
        uint256 offerId = offersCounter;

        offers[offerId] = Offer({
            id: offerId,
            creator: msg.sender,
            contentHash: _contentHash,
            category: _category,
            expiresAt: _expiresAt,
            createdAt: block.timestamp,
            status: OfferStatus.ACTIVE
        });

        emit OfferCreated(offerId, msg.sender, _contentHash, _category, _expiresAt);
        return offerId;
    }

    function expressInterest(uint256 _offerId) external {
        require(registeredInstitutions[msg.sender], "Not registered as institution");
        require(_offerId > 0 && _offerId <= offersCounter, "Invalid offer ID");
        require(!hasExpressedInterest[_offerId][msg.sender], "Already expressed interest");
        require(offers[_offerId].status == OfferStatus.ACTIVE, "Offer not active");
        require(block.timestamp < offers[_offerId].expiresAt, "Offer expired");

        hasExpressedInterest[_offerId][msg.sender] = true;
        emit InterestExpressed(_offerId, msg.sender);
    }

    function fulfillOffer(uint256 _offerId, address _institution) external {
        require(_offerId > 0 && _offerId <= offersCounter, "Invalid offer ID");
        require(offers[_offerId].status == OfferStatus.PENDING_FULFILLMENT, "Offer not pending fulfillment");
        require(msg.sender == offers[_offerId].creator || msg.sender == owner(), "Not authorized");
        require(registeredInstitutions[_institution], "Not a registered institution");

        offers[_offerId].status = OfferStatus.FULFILLED;
        emit OfferFulfilled(_offerId, _institution);
    }

    function cancelOffer(uint256 _offerId) external {
        require(_offerId > 0 && _offerId <= offersCounter, "Invalid offer ID");
        require(msg.sender == offers[_offerId].creator, "Not offer creator");
        require(offers[_offerId].status == OfferStatus.ACTIVE, "Can only cancel active offers");

        offers[_offerId].status = OfferStatus.CANCELLED;
        emit OfferCancelled(_offerId);
    }

    function markAsFulfilled(uint256 _offerId) external {
        require(_offerId > 0 && _offerId <= offersCounter, "Invalid offer ID");
        require(offers[_offerId].status == OfferStatus.ACTIVE, "Offer not active");
        require(msg.sender == offers[_offerId].creator, "Not offer creator");

        offers[_offerId].status = OfferStatus.PENDING_FULFILLMENT;
    }

    function getOffer(uint256 _offerId) external view returns (Offer memory) {
        require(_offerId > 0 && _offerId <= offersCounter, "Invalid offer ID");
        return offers[_offerId];
    }

    function isBusiness(address _addr) external view returns (bool) {
        return registeredBusinesses[_addr];
    }

    function isInstitution(address _addr) external view returns (bool) {
        return registeredInstitutions[_addr];
    }
}
