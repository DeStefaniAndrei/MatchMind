// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "./libraries/SafeMath.sol";

/**
 * @title GamePool
 * @dev Manages individual match betting and token distribution
 */
contract GamePool {
    using SafeMath for uint256;
    
    // State variables
    address public immutable owner;
    address public immutable factory;
    
    uint256 public constant MINIMUM_BET_AMOUNT = 0.01 ether; // 0.01 CHZ
    
    enum GameState { PRE_MATCH, MATCH_ACTIVE, MATCH_ENDED, DISTRIBUTED }
    GameState public gameState;
    
    struct Player {
        uint256 betAmount;
        uint256 betTime;
        uint256 winnings;
        bool hasWithdrawn;
        uint256 finalRank;
    }
    
    mapping(address => Player) public players;
    address[] public playerAddresses;
    
    uint256 public totalBets;
    uint256 public matchStartTime;
    uint256 public matchEndTime;
    
    // Events
    event PlayerBet(address indexed player, uint256 amount, uint256 timestamp);
    event MatchStarted(uint256 timestamp);
    event MatchEnded(uint256 timestamp);
    event WinningsDistributed(uint256 totalBets, uint256 playerCount);
    event PlayerWithdrawn(address indexed player, uint256 winnings);
    event EmergencyWithdraw(address indexed player, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory can call this function");
        _;
    }
    
    modifier onlyPreMatch() {
        require(gameState == GameState.PRE_MATCH, "Game not in pre-match state");
        _;
    }
    
    modifier onlyMatchActive() {
        require(gameState == GameState.MATCH_ACTIVE, "Game not active");
        _;
    }
    
    modifier onlyMatchEnded() {
        require(gameState == GameState.MATCH_ENDED, "Game not ended");
        _;
    }
    
    constructor(
        address _owner
    ) {
        owner = _owner;
        factory = msg.sender;
        gameState = GameState.PRE_MATCH;
    }
    
    /**
     * @dev Allows players to bet CHZ and enter the match
     */
    function betAndEnter() external onlyPreMatch payable {
        require(msg.value >= MINIMUM_BET_AMOUNT, "Bet below minimum");
        
        // Record player
        if (players[msg.sender].betAmount == 0) {
            playerAddresses.push(msg.sender);
        }
        
        players[msg.sender] = Player({
            betAmount: players[msg.sender].betAmount.add(msg.value),
            betTime: block.timestamp,
            winnings: 0,
            hasWithdrawn: false,
            finalRank: 0
        });
        
        totalBets = totalBets.add(msg.value);
        
        emit PlayerBet(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev Called by backend when match starts
     */
    function startMatch() external onlyFactory onlyPreMatch {
        gameState = GameState.MATCH_ACTIVE;
        matchStartTime = block.timestamp;
        emit MatchStarted(block.timestamp);
    }
    
    /**
     * @dev Called by backend when match ends
     */
    function endMatch() external onlyFactory onlyMatchActive {
        gameState = GameState.MATCH_ENDED;
        matchEndTime = block.timestamp;
        emit MatchEnded(block.timestamp);
    }
    
    /**
     * @dev Distributes winnings based on final leaderboard rankings
     * @param rankings Array of player addresses in final ranking order (1st place first)
     */
    function distributeWinnings(address[] calldata rankings) external onlyFactory onlyMatchEnded {
        require(gameState == GameState.MATCH_ENDED, "Match not ended");
        
        uint256 totalWeight = 0;
        uint256[] memory weights = new uint256[](rankings.length);
        
        // Calculate exponential weights
        for (uint256 i = 0; i < rankings.length; i++) {
            uint256 rank = i + 1;
            uint256 weight = 1000000 / (rank * rank); // Exponential decay: 1/rank^2
            weights[i] = weight;
            totalWeight = totalWeight.add(weight);
            
            // Set final rank for player
            players[rankings[i]].finalRank = rank;
        }
        
        // Distribute winnings based on weights
        for (uint256 i = 0; i < rankings.length; i++) {
            address player = rankings[i];
            uint256 playerWinnings = (totalBets.mul(weights[i])).div(totalWeight);
            players[player].winnings = playerWinnings;
        }
        
        gameState = GameState.DISTRIBUTED;
        emit WinningsDistributed(totalBets, rankings.length);
    }
    
    /**
     * @dev Allows players to withdraw their winnings after match ends
     */
    function withdraw() external {
        Player storage player = players[msg.sender];
        require(player.betAmount > 0, "No bet found");
        require(!player.hasWithdrawn, "Already withdrawn");
        require(gameState == GameState.DISTRIBUTED, "Game not finished");
        
        player.hasWithdrawn = true;
        
        // Transfer winnings to player (native CHZ)
        if (player.winnings > 0) {
            (bool success, ) = payable(msg.sender).call{value: player.winnings}("");
            require(success, "Winnings transfer failed");
        }
        
        emit PlayerWithdrawn(msg.sender, player.winnings);
    }
    
    /**
     * @dev Emergency withdraw function for stuck funds
     */
    function emergencyWithdraw() external onlyOwner {
        require(gameState == GameState.DISTRIBUTED, "Game not finished");
        
        uint256 contractBalance = address(this).balance;
        if (contractBalance > 0) {
            (bool success, ) = payable(owner).call{value: contractBalance}("");
            require(success, "Emergency transfer failed");
        }
    }
    
    /**
     * @dev Get player information
     */
    function getPlayer(address player) external view returns (
        uint256 betAmount,
        uint256 betTime,
        uint256 winnings,
        bool hasWithdrawn,
        uint256 finalRank
    ) {
        Player storage p = players[player];
        return (p.betAmount, p.betTime, p.winnings, p.hasWithdrawn, p.finalRank);
    }
    
    /**
     * @dev Get all players
     */
    function getAllPlayers() external view returns (address[] memory) {
        return playerAddresses;
    }
    
    /**
     * @dev Get contract statistics
     */
    function getGameStats() external view returns (
        uint256 _totalBets,
        uint256 _playerCount,
        GameState _gameState,
        uint256 _matchStartTime,
        uint256 _matchEndTime
    ) {
        return (totalBets, playerAddresses.length, gameState, matchStartTime, matchEndTime);
    }
} 