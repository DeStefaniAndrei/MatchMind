// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "./GameFactory.sol";

/**
 * @title MatchMind
 * @dev Main contract for managing football prediction games
 */
contract MatchMind {
    address public immutable owner;
    address public immutable factory;
    
    event GameCreated(uint256 indexed gameId, address indexed gameAddress);
    event MatchStarted(uint256 indexed gameId);
    event MatchEnded(uint256 indexed gameId);
    event WinningsDistributed(uint256 indexed gameId, address[] rankings);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor(address _owner, address _factory) {
        owner = _owner;
        factory = _factory;
    }
    
    /**
     * @dev Creates a new game through the factory
     * @return gameId The ID of the created game
     */
    function createGame() external onlyOwner returns (uint256 gameId) {
        GameFactory gameFactory = GameFactory(factory);
        gameId = gameFactory.createGame();
        address gameAddress = gameFactory.getGameAddress(gameId);
        emit GameCreated(gameId, gameAddress);
        return gameId;
    }
    
    /**
     * @dev Starts a match
     * @param gameId The ID of the game to start
     */
    function startMatch(uint256 gameId) external onlyOwner {
        GameFactory gameFactory = GameFactory(factory);
        gameFactory.startMatch(gameId);
        emit MatchStarted(gameId);
    }
    
    /**
     * @dev Ends a match
     * @param gameId The ID of the game to end
     */
    function endMatch(uint256 gameId) external onlyOwner {
        GameFactory gameFactory = GameFactory(factory);
        gameFactory.endMatch(gameId);
        emit MatchEnded(gameId);
    }
    
    /**
     * @dev Distributes winnings for a game
     * @param gameId The ID of the game
     * @param rankings Array of player addresses in final ranking order
     */
    function distributeWinnings(uint256 gameId, address[] calldata rankings) external onlyOwner {
        GameFactory gameFactory = GameFactory(factory);
        gameFactory.distributeWinnings(gameId, rankings);
        emit WinningsDistributed(gameId, rankings);
    }
    
    /**
     * @dev Emergency function to recover stuck tokens
     * @param token The token address to recover
     * @param amount The amount to recover
     */
    function emergencyRecover(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            // Recover native CHZ
            (bool success, ) = payable(owner).call{value: amount}("");
            require(success, "Transfer failed");
        } else {
            // Recover ERC20 tokens
            // This would require IERC20 interface, but we're keeping it simple
            revert("ERC20 recovery not implemented");
        }
    }
} 