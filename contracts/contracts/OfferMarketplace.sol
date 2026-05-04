// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract OfferMarketplace is Ownable {
    uint256 public offersCounter;

    struct Offer {
        uint256 id;
        address creator;
        string name;
        string objective;
        string description;
        string location;
        uint256 interested;
        uint256 createdAt;
    }

    mapping(uint256 => Offer) public offers;

    event OfferCreated(uint256 indexed id, address indexed creator, string name, string objective);
    event InterestExpressed(uint256 indexed offerId, address indexed user, uint256 newCount);

    constructor() Ownable(msg.sender) {}

    function createOffer(
        string memory _name,
        string memory _objective,
        string memory _description,
        string memory _location
    ) external returns (uint256) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_objective).length > 0, "Objective cannot be empty");

        offersCounter++;
        uint256 offerId = offersCounter;

        offers[offerId] = Offer({
            id: offerId,
            creator: msg.sender,
            name: _name,
            objective: _objective,
            description: _description,
            location: _location,
            interested: 0,
            createdAt: block.timestamp
        });

        emit OfferCreated(offerId, msg.sender, _name, _objective);
        return offerId;
    }

    function expressInterest(uint256 _offerId) external {
        require(_offerId > 0 && _offerId <= offersCounter, "Invalid offer ID");
        offers[_offerId].interested += 1;
        emit InterestExpressed(_offerId, msg.sender, offers[_offerId].interested);
    }

    function getOffer(uint256 _offerId) external view returns (Offer memory) {
        require(_offerId > 0 && _offerId <= offersCounter, "Invalid offer ID");
        return offers[_offerId];
    }

    function getAllOffers() external view returns (Offer[] memory) {
        Offer[] memory allOffers = new Offer[](offersCounter);
        for (uint256 i = 1; i <= offersCounter; i++) {
            allOffers[i - 1] = offers[i];
        }
        return allOffers;
    }
}
