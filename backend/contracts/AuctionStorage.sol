// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AuctionStorage {
    struct AuctionRecord {
        string winner;
        string reason;
        string scores;
        uint256 timestamp;
    }

    AuctionRecord[] private auctions;

    event AuctionStored(
        uint256 indexed auctionId,
        string winner,
        string reason,
        string scores,
        uint256 timestamp
    );

    function storeAuction(
        string calldata winner,
        string calldata reason,
        string calldata scores
    ) external {
        uint256 timestamp = block.timestamp;

        auctions.push(
            AuctionRecord({
                winner: winner,
                reason: reason,
                scores: scores,
                timestamp: timestamp
            })
        );

        emit AuctionStored(auctions.length - 1, winner, reason, scores, timestamp);
    }

    function getAuctionCount() external view returns (uint256) {
        return auctions.length;
    }

    function getAuction(uint256 index)
        external
        view
        returns (string memory winner, string memory reason, string memory scores, uint256 timestamp)
    {
        AuctionRecord storage auction = auctions[index];
        return (auction.winner, auction.reason, auction.scores, auction.timestamp);
    }
}