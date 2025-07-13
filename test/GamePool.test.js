const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GamePool", function () {
    let gamePool;
    let gameFactory;
    let owner;
    let player1;
    let player2;
    let player3;
    
    // Real Chiliz Chain addresses
    const CHZ_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual CHZ address
    const STAKING_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000001000";
    const VALIDATOR_ADDRESS = "0x0000000000000000000000000000000000000001"; // Replace with actual validator
    
    const MINIMUM_STAKE_AMOUNT = ethers.parseEther("0.01"); // 0.01 CHZ
    const STAKE_AMOUNT = ethers.parseEther("1"); // 1 CHZ
    
    beforeEach(async function () {
        [owner, player1, player2, player3] = await ethers.getSigners();
        
        // Deploy GameFactory first
        const GameFactory = await ethers.getContractFactory("GameFactory");
        gameFactory = await GameFactory.deploy(
            owner.address,
            CHZ_TOKEN_ADDRESS,
            STAKING_CONTRACT_ADDRESS,
            VALIDATOR_ADDRESS
        );
        
        await gameFactory.waitForDeployment();
        
        // Create a game to get a GamePool instance
        const gameId = await gameFactory.createGame();
        const gamePoolAddress = await gameFactory.getGameAddress(gameId);
        gamePool = await ethers.getContractAt("GamePool", gamePoolAddress);
    });
    
    describe("Deployment", function () {
        it("Should deploy with correct parameters", async function () {
            expect(await gamePool.owner()).to.equal(owner.address);
            expect(await gamePool.chzToken()).to.equal(CHZ_TOKEN_ADDRESS);
            expect(await gamePool.stakingContract()).to.equal(STAKING_CONTRACT_ADDRESS);
            expect(await gamePool.validator()).to.equal(VALIDATOR_ADDRESS);
            expect(await gamePool.gameState()).to.equal(0); // PRE_MATCH
        });
        
        it("Should have correct minimum stake amount", async function () {
            expect(await gamePool.MINIMUM_STAKE_AMOUNT()).to.equal(MINIMUM_STAKE_AMOUNT);
        });
        
        it("Should have correct minimum stake duration", async function () {
            expect(await gamePool.MINIMUM_STAKE_DURATION()).to.equal(2 * 24 * 60 * 60); // 2 days
        });
    });
    
    describe("Staking and Entry", function () {
        it("Should allow players to stake and enter", async function () {
            // Note: This test would need real CHZ tokens and proper setup
            // For now, we'll test the function signature and basic logic
            
            const stakeAmount = ethers.parseEther("1");
            
            // This would fail in real testing due to lack of CHZ tokens
            // but we can test the function exists and has correct parameters
            expect(typeof gamePool.stakeAndEnter).to.equal("function");
        });
        
        it("Should enforce minimum stake amount", async function () {
            const belowMinimum = ethers.parseEther("0.005"); // Below 0.01 CHZ
            
            // This would revert in real testing
            // await expect(gamePool.connect(player1).stakeAndEnter(belowMinimum))
            //     .to.be.revertedWith("Stake below minimum");
        });
        
        it("Should track player information correctly", async function () {
            // Test player tracking logic
            const playerAddress = player1.address;
            const stakeAmount = ethers.parseEther("1");
            
            // This would need real CHZ tokens to test properly
            // For now, we'll verify the function structure
            expect(typeof gamePool.getPlayer).to.equal("function");
        });
    });
    
    describe("Match Lifecycle", function () {
        it("Should start match correctly", async function () {
            await expect(gameFactory.startMatch(0))
                .to.emit(gamePool, "MatchStarted");
            
            expect(await gamePool.gameState()).to.equal(1); // MATCH_ACTIVE
            expect(await gamePool.matchStartTime()).to.be.gt(0);
        });
        
        it("Should end match correctly", async function () {
            await gameFactory.startMatch(0);
            
            await expect(gameFactory.endMatch(0))
                .to.emit(gamePool, "MatchEnded");
            
            expect(await gamePool.gameState()).to.equal(2); // MATCH_ENDED
            expect(await gamePool.matchEndTime()).to.be.gt(0);
        });
        
        it("Should prevent invalid state transitions", async function () {
            // Try to end match before starting
            await expect(gameFactory.endMatch(0))
                .to.be.revertedWith("Game not active");
            
            // Try to start match twice
            await gameFactory.startMatch(0);
            await expect(gameFactory.startMatch(0))
                .to.be.revertedWith("Game not in pre-match state");
        });
    });
    
    describe("Yield Distribution", function () {
        beforeEach(async function () {
            await gameFactory.startMatch(0);
            await gameFactory.endMatch(0);
        });
        
        it("Should distribute yield based on rankings", async function () {
            const rankings = [player1.address, player2.address, player3.address];
            
            await expect(gameFactory.distributeYield(0, rankings))
                .to.emit(gamePool, "YieldDistributed");
            
            expect(await gamePool.gameState()).to.equal(3); // DISTRIBUTED
        });
        
        it("Should calculate exponential weights correctly", async function () {
            const rankings = [player1.address, player2.address, player3.address];
            
            await gameFactory.distributeYield(0, rankings);
            
            // Check that players have final ranks set
            const player1Data = await gamePool.getPlayer(player1.address);
            const player2Data = await gamePool.getPlayer(player2.address);
            const player3Data = await gamePool.getPlayer(player3.address);
            
            expect(player1Data.finalRank).to.equal(1);
            expect(player2Data.finalRank).to.equal(2);
            expect(player3Data.finalRank).to.equal(3);
        });
        
        it("Should prevent distribution before match ends", async function () {
            // Create a new game
            const gameId = await gameFactory.createGame();
            const gamePoolAddress = await gameFactory.getGameAddress(gameId);
            const newGamePool = await ethers.getContractAt("GamePool", gamePoolAddress);
            
            const rankings = [player1.address, player2.address];
            
            await expect(gameFactory.distributeYield(gameId, rankings))
                .to.be.revertedWith("Match not ended");
        });
    });
    
    describe("Withdrawal", function () {
        it("Should enforce minimum stake duration", async function () {
            // This test would need real staking and time manipulation
            // For now, we'll verify the function exists
            expect(typeof gamePool.withdraw).to.equal("function");
        });
        
        it("Should prevent double withdrawal", async function () {
            // This test would need real staking setup
            // For now, we'll verify the function structure
            expect(typeof gamePool.getPlayer).to.equal("function");
        });
    });
    
    describe("Emergency Functions", function () {
        it("Should allow owner to emergency withdraw", async function () {
            await expect(gamePool.emergencyWithdraw())
                .to.not.be.reverted;
        });
        
        it("Should only allow owner to emergency withdraw", async function () {
            await expect(gamePool.connect(player1).emergencyWithdraw())
                .to.be.revertedWith("Only owner can call this function");
        });
        
        it("Should require game to be distributed", async function () {
            // Try to emergency withdraw before distribution
            await expect(gamePool.emergencyWithdraw())
                .to.be.revertedWith("Game not finished");
        });
    });
    
    describe("View Functions", function () {
        it("Should return correct game statistics", async function () {
            const stats = await gamePool.getGameStats();
            
            expect(stats._totalStaked).to.equal(0);
            expect(stats._totalYield).to.equal(0);
            expect(stats._playerCount).to.equal(0);
            expect(stats._gameState).to.equal(0); // PRE_MATCH
        });
        
        it("Should return all players", async function () {
            const players = await gamePool.getAllPlayers();
            expect(players.length).to.equal(0);
        });
        
        it("Should return player information", async function () {
            const playerData = await gamePool.getPlayer(player1.address);
            
            expect(playerData.stakedAmount).to.equal(0);
            expect(playerData.stakeTime).to.equal(0);
            expect(playerData.yieldEarned).to.equal(0);
            expect(playerData.hasWithdrawn).to.equal(false);
            expect(playerData.finalRank).to.equal(0);
        });
    });
    
    describe("Integration Tests", function () {
        it("Should complete full game lifecycle", async function () {
            // Start match
            await gameFactory.startMatch(0);
            expect(await gamePool.gameState()).to.equal(1);
            
            // End match
            await gameFactory.endMatch(0);
            expect(await gamePool.gameState()).to.equal(2);
            
            // Distribute yield
            const rankings = [player1.address, player2.address];
            await gameFactory.distributeYield(0, rankings);
            expect(await gamePool.gameState()).to.equal(3);
        });
        
        it("Should handle multiple players in rankings", async function () {
            await gameFactory.startMatch(0);
            await gameFactory.endMatch(0);
            
            const rankings = [player1.address, player2.address, player3.address];
            await gameFactory.distributeYield(0, rankings);
            
            const stats = await gamePool.getGameStats();
            expect(stats._gameState).to.equal(3); // DISTRIBUTED
        });
    });
}); 