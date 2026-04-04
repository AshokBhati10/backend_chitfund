// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title AI Chit Fund Group
/// @notice One contract instance represents one chit fund group and serves as treasury + payout logic.
contract AIChitFundGroup is Ownable, ReentrancyGuard {
    uint256 private constant BPS_DENOMINATOR = 10_000;
    uint256 private constant SAFE_CHIT_BPS = 8_000; // 80%

    mapping(address => bool) public isMember;
    address[] public members;

    mapping(address => uint256) public chitBalance;
    mapping(address => uint256) public emergencyBalance;
    mapping(address => uint256) public totalContributed;
    mapping(address => bool) public hasPaidThisMonth;

    uint256 public totalChitPool;
    uint256 public totalEmergencyPool;
    address public lastWinner;

    struct Contribution {
        uint256 amount;
        uint256 timestamp;
        bool safeMode;
    }

    mapping(address => Contribution[]) private contributionHistory;

    event Invested(address user, uint256 amount, string mode);
    event WinnerDeclared(address winner, uint256 amount);
    event EmergencyClaimed(address user, uint256 amount);
    event MonthlyPaymentsReset(uint256 timestamp);
    event FundsReceived(address sender, uint256 amount);

    modifier onlyMember() {
        require(isMember[msg.sender], "Caller is not a group member");
        _;
    }

    /// @param initialMembers List of wallet addresses that belong to this chit fund group.
    constructor(address[] memory initialMembers) Ownable(msg.sender) {
        require(initialMembers.length > 0, "At least one member required");

        uint256 len = initialMembers.length;
        for (uint256 i = 0; i < len; ) {
            address member = initialMembers[i];
            require(member != address(0), "Zero address not allowed");
            require(!isMember[member], "Duplicate member");

            isMember[member] = true;
            members.push(member);

            unchecked {
                ++i;
            }
        }
    }

    /// @notice Invest using SAFE mode: 80% to chit pool and 20% to emergency pool.
    function investSafe() external payable onlyMember {
        require(msg.value > 0, "Investment must be greater than 0");

        uint256 chitPart = (msg.value * SAFE_CHIT_BPS) / BPS_DENOMINATOR;
        uint256 emergencyPart = msg.value - chitPart;

        chitBalance[msg.sender] += chitPart;
        emergencyBalance[msg.sender] += emergencyPart;
        totalContributed[msg.sender] += msg.value;

        totalChitPool += chitPart;
        totalEmergencyPool += emergencyPart;

        _markPayment(msg.sender);
        contributionHistory[msg.sender].push(
            Contribution({
                amount: msg.value,
                timestamp: block.timestamp,
                safeMode: true
            })
        );

        emit Invested(msg.sender, msg.value, "SAFE");
    }

    /// @notice Invest using NORMAL mode: 100% to chit pool.
    function investNormal() external payable onlyMember {
        require(msg.value > 0, "Investment must be greater than 0");

        chitBalance[msg.sender] += msg.value;
        totalContributed[msg.sender] += msg.value;
        totalChitPool += msg.value;

        _markPayment(msg.sender);
        contributionHistory[msg.sender].push(
            Contribution({
                amount: msg.value,
                timestamp: block.timestamp,
                safeMode: false
            })
        );

        emit Invested(msg.sender, msg.value, "NORMAL");
    }

    /// @notice Backend/AI calls this through owner wallet to declare monthly winner.
    /// @dev Uses checks-effects-interactions + nonReentrant for payout safety.
    function declareWinner(address winner) external onlyOwner nonReentrant {
        require(isMember[winner], "Winner must be a member");

        uint256 payoutAmount = totalChitPool;
        require(payoutAmount > 0, "No funds in chit pool");

        lastWinner = winner;
        totalChitPool = 0;

        (bool success, ) = payable(winner).call{value: payoutAmount}("");
        require(success, "Winner payout failed");

        emit WinnerDeclared(winner, payoutAmount);
    }

    /// @notice Allows each member to claim their own emergency balance.
    function claimEmergency() external onlyMember nonReentrant {
        uint256 amount = emergencyBalance[msg.sender];
        require(amount > 0, "No emergency balance");

        emergencyBalance[msg.sender] = 0;
        totalEmergencyPool -= amount;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Emergency payout failed");

        emit EmergencyClaimed(msg.sender, amount);
    }

    /// @notice Owner resets monthly payment status for the next cycle.
    function resetMonthlyPayments() external onlyOwner {
        uint256 len = members.length;
        for (uint256 i = 0; i < len; ) {
            hasPaidThisMonth[members[i]] = false;
            unchecked {
                ++i;
            }
        }

        emit MonthlyPaymentsReset(block.timestamp);
    }

    function _markPayment(address user) internal {
        hasPaidThisMonth[user] = true;
    }

    /// @notice Frontend helper: full ETH balance held by this contract.
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Returns current ETH balance of this contract.
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Generic ETH deposit function.
    function deposit() external payable {
        require(msg.value > 0, "Send ETH");
        emit FundsReceived(msg.sender, msg.value);
    }

    /// @notice Returns group member list.
    function getMembers() public view returns (address[] memory) {
        return members;
    }

    /// @notice BONUS: dashboard analytics in one call.
    function getDashboardData(address user)
        external
        view
        returns (
            uint256 contractBalance,
            uint256 chitPool,
            uint256 emergencyPool,
            uint256 userChit,
            uint256 userEmergency,
            uint256 userTotalContributed,
            bool paidThisMonth,
            uint256 userContributionCount,
            address recentWinner
        )
    {
        contractBalance = address(this).balance;
        chitPool = totalChitPool;
        emergencyPool = totalEmergencyPool;
        userChit = chitBalance[user];
        userEmergency = emergencyBalance[user];
        userTotalContributed = totalContributed[user];
        paidThisMonth = hasPaidThisMonth[user];
        userContributionCount = contributionHistory[user].length;
        recentWinner = lastWinner;
    }

    /// @notice BONUS: complete contribution history for a user.
    function getContributionHistory(address user)
        external
        view
        returns (Contribution[] memory)
    {
        return contributionHistory[user];
    }

    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }

    fallback() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }
}
