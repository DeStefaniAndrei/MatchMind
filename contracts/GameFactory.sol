// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "./GamePool.sol";

/**
 * @title GameFactory
 * @dev Factory contract for creating GamePool instances
 */
contract GameFactory {
    address public immutable owner;
    
    GamePool[] public games;
    mapping(uint256 => address) public gameAddresses;
    uint256 public gameCounter;
    
    event GameCreated(uint256 indexed gameId, address indexed gameAddress);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor(address _owner) {
        owner = _owner;
    }
    
    /**
     * @dev Creates a new game pool
     * @return gameId The ID of the created game
     */
    function createGame() external onlyOwner returns (uint256 gameId) {
        GamePool newGame = new GamePool(owner);
        gameId = games.length;
        games.push(newGame);
        gameAddresses[gameId] = address(newGame);
        gameCounter = gameCounter + 1;
        
        emit GameCreated(gameId, address(newGame));
        return gameId;
    }
    
    /**
     * @dev Starts a match
     * @param gameId The ID of the game to start
     */
    function startMatch(uint256 gameId) external onlyOwner {
        require(gameId < games.length, "Game does not exist");
        GamePool game = games[gameId];
        game.startMatch();
    }
    
    /**
     * @dev Ends a match
     * @param gameId The ID of the game to end
     */
    function endMatch(uint256 gameId) external onlyOwner {
        require(gameId < games.length, "Game does not exist");
        GamePool game = games[gameId];
        game.endMatch();
    }
    
    /**
     * @dev Distributes winnings for a game
     * @param gameId The ID of the game
     * @param rankings Array of player addresses in final ranking order
     */
    function distributeWinnings(uint256 gameId, address[] calldata rankings) external onlyOwner {
        require(gameId < games.length, "Game does not exist");
        GamePool game = games[gameId];
        game.distributeWinnings(rankings);
    }
    
    /**
     * @dev Gets all games
     * @return Array of game addresses
     */
    function getAllGames() external view returns (address[] memory) {
        address[] memory gameAddresses = new address[](games.length);
        for (uint256 i = 0; i < games.length; i++) {
            gameAddresses[i] = address(games[i]);
        }
        return gameAddresses;
    }
    
    /**
     * @dev Gets the address of a specific game
     * @param gameId The ID of the game
     * @return The address of the game
     */
    function getGameAddress(uint256 gameId) external view returns (address) {
        require(gameId < games.length, "Game does not exist");
        return address(games[gameId]);
    }
} 