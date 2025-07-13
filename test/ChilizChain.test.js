const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Chiliz Chain Integration Tests", function () {
    let matchMind;
    let gameFactory;
    let owner;
    
    // Real Chiliz Chain addresses - UPDATE THESE WITH YOUR DEPLOYED ADDRESSES
    const MATCHMIND_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with your deployed MatchMind address
    const CHZ_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual CHZ address
    const STAKING_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000001000";
    const VALIDATOR_ADDRESS = "0x0000000000000000000000000000000000000001"; // Replace with actual validator
    
    before(async function () {
        [owner] = await ethers.getSigners();
        
        // Connect to deployed contracts
        if (MATCHMIND_ADDRESS !== "0x0000000000000000000000000000000000000000") {
            matchMind = await ethers.getContractAt("MatchMind", MATCHMIND_ADDRESS);
            const factoryAddress = await matchMind.factory();
            gameFactory = await ethers.getContractAt("GameFactory", factoryAddress);
        }
    });
    
    describe("Deployed Contract Verification", function () {
        it("Should connect to deployed MatchMind contract", async function () {
            if (MATCHMIND_ADDRESS === "0x0000000000000000000000000000000000000000") {
                console.log("⚠️  Skipping test - Please update MATCHMIND_ADDRESS in the test file");
                this.skip();
                return;
            }
            
            expect(matchMind).to.not.be.undefined;
            expect(await matchMind.owner()).to.equal(owner.address);
        });
        
        it("Should have correct contract parameters", async function () {
            if (MATCHMIND_ADDRESS === "0x0000000000000000000000000000000000000000") {
                this.skip();
                return;
            }
            
            expect(await matchMind.chzToken()).to.equal(CHZ_TOKEN_ADDRESS);
            expect(await matchMind.stakingContract()).to.equal(STAKING_CONTRACT_ADDRESS);
            expect(await matchMind.validator()).to.equal(VALIDATOR_ADDRESS);
        });
        
        it("Should have deployed GameFactory", async function () {
            if (MATCHMIND_ADDRESS === "0x0000000000000000000000000000000000000000") {
                this.skip();
                return;
            }
            
            const factoryAddress = await matchMind.factory();
            expect(factoryAddress).to.not.equal(ethers.ZeroAddress);
            
            gameFactory = await ethers.getContractAt("GameFactory", factoryAddress);
            expect(await gameFactory.owner()).to.equal(owner.address);
        });
    });
    
    describe("Game Creation on Chiliz Chain", function () {
        it("Should create a new game", async function () {
            if (MATCHMIND_ADDRESS === "0x0000000000000000000000000000000000000000") {
                this.skip();
                return;
            }
            
            const initialGameCount = await gameFactory.gameCounter();
            console.log(`Current game count: ${initialGameCount}`);
            
            const tx = await matchMind.createGame();
            const receipt = await tx.wait();
            
            console.log(`Game created! Transaction hash: ${receipt.hash}`);
            console.log(`New game count: ${await gameFactory.gameCounter()}`);
            
            expect(await gameFactory.gameCounter()).to.equal(initialGameCount + 1n);
        });
        
        it("Should get game address", async function () {
            if (MATCHMIND_ADDRESS === "0x0000000000000000000000000000000000000000") {
                this.skip();
                return;
            }
            
            const gameId = 0; // First game
            const gameAddress = await gameFactory.getGameAddress(gameId);
            console.log(`Game ${gameId} address: ${gameAddress}`);
            
            expect(gameAddress).to.not.equal(ethers.ZeroAddress);
        });
    });
    
    describe("Match Management on Chiliz Chain", function () {
        it("Should start a match", async function () {
            if (MATCHMIND_ADDRESS === "0x0000000000000000000000000000000000000000") {
                this.skip();
                return;
            }
            
            const gameId = 0;
            const gameAddress = await gameFactory.getGameAddress(gameId);
            const gamePool = await ethers.getContractAt("GamePool", gameAddress);
            
            console.log(`Starting match for game ${gameId}...`);
            const tx = await matchMind.startMatch(gameId);
            const receipt = await tx.wait();
            
            console.log(`Match started! Transaction hash: ${receipt.hash}`);
            console.log(`Game state: ${await gamePool.gameState()}`);
            
            expect(await gamePool.gameState()).to.equal(1); // MATCH_ACTIVE
        });
        
        it("Should end a match", async function () {
            if (MATCHMIND_ADDRESS === "0x0000000000000000000000000000000000000000") {
                this.skip();
                return;
            }
            
            const gameId = 0;
            const gameAddress = await gameFactory.getGameAddress(gameId);
            const gamePool = await ethers.getContractAt("GamePool", gameAddress);
            
            console.log(`Ending match for game ${gameId}...`);
            const tx = await matchMind.endMatch(gameId);
            const receipt = await tx.wait();
            
            console.log(`Match ended! Transaction hash: ${receipt.hash}`);
            console.log(`Game state: ${await gamePool.gameState()}`);
            
            expect(await gamePool.gameState()).to.equal(2); // MATCH_ENDED
        });
    });
    
    describe("Yield Distribution on Chiliz Chain", function () {
        it("Should distribute yield", async function () {
            if (MATCHMIND_ADDRESS === "0x0000000000000000000000000000000000000000") {
                this.skip();
                return;
            }
            
            const gameId = 0;
            const gameAddress = await gameFactory.getGameAddress(gameId);
            const gamePool = await ethers.getContractAt("GamePool", gameAddress);
            
            // Example rankings (replace with actual player addresses)
            const rankings = [
                "0x1234567890123456789012345678901234567890",
                "0x2345678901234567890123456789012345678901",
                "0x3456789012345678901234567890123456789012"
            ];
            
            console.log(`Distributing yield for game ${gameId}...`);
            const tx = await matchMind.distributeYield(gameId, rankings);
            const receipt = await tx.wait();
            
            console.log(`Yield distributed! Transaction hash: ${receipt.hash}`);
            console.log(`Game state: ${await gamePool.gameState()}`);
            
            expect(await gamePool.gameState()).to.equal(3); // DISTRIBUTED
        });
    });
    
    describe("Contract State Verification", function () {
        it("Should verify contract states", async function () {
            if (MATCHMIND_ADDRESS === "0x0000000000000000000000000000000000000000") {
                this.skip();
                return;
            }
            
            const gameId = 0;
            const gameAddress = await gameFactory.getGameAddress(gameId);
            const gamePool = await ethers.getContractAt("GamePool", gameAddress);
            
            const stats = await gamePool.getGameStats();
            console.log("Game Statistics:");
            console.log(`- Total Staked: ${ethers.formatEther(stats._totalStaked)} CHZ`);
            console.log(`- Total Yield: ${ethers.formatEther(stats._totalYield)} CHZ`);
            console.log(`- Player Count: ${stats._playerCount}`);
            console.log(`- Game State: ${stats._gameState}`);
            console.log(`- Match Start Time: ${new Date(stats._matchStartTime * 1000)}`);
            console.log(`- Match End Time: ${new Date(stats._matchEndTime * 1000)}`);
        });
    });
}); 