// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ChitAuctionRecorder {
    struct AuctionRecord {
        string winner;
        string reason;
        uint256 timestamp;
        string[] users;
        uint256[] scores;
    }

    AuctionRecord[] private records;

    event AuctionRecorded(uint256 indexed auctionId, string winner, string reason, uint256 timestamp);

    function recordAuction(
        string calldata winner,
        string[] calldata users,
        uint256[] calldata scores,
        string calldata reason,
        uint256 timestamp
    ) external returns (bytes32) {
        require(users.length == scores.length, 'Length mismatch');

        AuctionRecord storage record = records.push();
        record.winner = winner;
        record.reason = reason;
        record.timestamp = timestamp;

        for (uint256 i = 0; i < users.length; i++) {
            record.users.push(users[i]);
            record.scores.push(scores[i]);
        }

        uint256 auctionId = records.length - 1;
        emit AuctionRecorded(auctionId, winner, reason, timestamp);

        return keccak256(abi.encodePacked(auctionId, winner, reason, timestamp));
    }

    function getAuctionCount() external view returns (uint256) {
        return records.length;
    }

    function getAuctionMeta(uint256 auctionId)
        external
        view
        returns (string memory winner, string memory reason, uint256 timestamp)
    {
        AuctionRecord storage record = records[auctionId];
        return (record.winner, record.reason, record.timestamp);
    }

    function getAuctionScores(uint256 auctionId)
        external
        view
        returns (string[] memory users, uint256[] memory scores)
    {
        AuctionRecord storage record = records[auctionId];
        return (record.users, record.scores);
    }
}
