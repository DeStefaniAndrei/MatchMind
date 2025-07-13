const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MatchMind (Local, No Staking)", function () {
    let matchMind;
    let gameFactory;
    let gamePool;
    let owner;
    let player1;
    let player2;
    let player3;
    let mockCHZ;
    let mockStaking;

    beforeEach(async function () {
        [owner, player1, player2, player3] = await ethers.getSigners();

        // Deploy mocks
        const MockCHZ = await ethers.getContractFactory("MockCHZ");
        mockCHZ = await MockCHZ.deploy();
        await mockCHZ.waitForDeployment();
        const chzTokenAddress = await mockCHZ.getAddress();

        const MockChilizStaking = await ethers.getContractFactory("MockChilizStaking");
        mockStaking = await MockChilizStaking.deploy();
        await mockStaking.waitForDeployment();
        const stakingAddress = await mockStaking.getAddress();

        // Use a dummy validator address
        const validator = ethers.ZeroAddress;

        // Deploy MatchMind contract
        const MatchMind = await ethers.getContractFactory("MatchMind");
        matchMind = await MatchMind.deploy(
            owner.address,
            chzTokenAddress,
            stakingAddress,
            validator
        );
        await matchMind.waitForDeployment();

        // Get the factory address from the deployed contract
        const factoryAddress = await matchMind.factory();
        gameFactory = await ethers.getContractAt("GameFactory", factoryAddress);
    });

    describe("Deployment", function () {
        it("Should deploy MatchMind with correct parameters", async function () {
            expect(await matchMind.owner()).to.equal(owner.address);
            expect(await matchMind.chzToken()).to.equal(await mockCHZ.getAddress());
            expect(await matchMind.stakingContract()).to.equal(await mockStaking.getAddress());
            expect(await matchMind.validator()).to.equal(ethers.ZeroAddress);
        });
        it("Should deploy GameFactory automatically", async function () {
            expect(await matchMind.factory()).to.not.equal(ethers.ZeroAddress);
        });
        it("Should emit FactoryDeployed event", async function () {
            const MatchMind = await ethers.getContractFactory("MatchMind");
            const newMatchMind = await MatchMind.deploy(
                owner.address,
                await mockCHZ.getAddress(),
                await mockStaking.getAddress(),
                ethers.ZeroAddress
            );
            await expect(newMatchMind.deploymentTransaction())
                .to.emit(newMatchMind, "FactoryDeployed");
        });
    });

    describe("Game Creation", function () {
        it("Should create a new game", async function () {
            const initialGameCount = await gameFactory.gameCounter();
            const tx = await matchMind.createGame();
            await tx.wait();
            expect(await gameFactory.gameCounter()).to.equal(initialGameCount + 1n);
        });
        it("Should only allow owner to create games", async function () {
            await expect(matchMind.connect(player1).createGame())
                .to.be.revertedWith("Only owner can call this function");
        });
        it("Should return correct game address", async function () {
            const tx = await matchMind.createGame();
            await tx.wait();
            const gameId = (await gameFactory.gameCounter()) - 1n;
            const gameAddress = await gameFactory.getGameAddress(gameId);
            expect(gameAddress).to.not.equal(ethers.ZeroAddress);
        });
    });

    describe("Game Management", function () {
        let gameId;
        let gamePoolAddress;
        beforeEach(async function () {
            const tx = await matchMind.createGame();
            await tx.wait();
            gameId = (await gameFactory.gameCounter()) - 1n;
            gamePoolAddress = await gameFactory.getGameAddress(gameId);
            gamePool = await ethers.getContractAt("GamePool", gamePoolAddress);
        });
        it("Should start a match", async function () {
            await expect(matchMind.startMatch(gameId))
                .to.emit(gamePool, "MatchStarted");
            expect(await gamePool.gameState()).to.equal(1); // MATCH_ACTIVE
        });
        it("Should end a match", async function () {
            await matchMind.startMatch(gameId);
            await expect(matchMind.endMatch(gameId))
                .to.emit(gamePool, "MatchEnded");
            expect(await gamePool.gameState()).to.equal(2); // MATCH_ENDED
        });
        it("Should only allow owner to manage matches", async function () {
            await expect(matchMind.connect(player1).startMatch(gameId))
                .to.be.revertedWith("Only owner can call this function");
            await expect(matchMind.connect(player1).endMatch(gameId))
                .to.be.revertedWith("Only owner can call this function");
        });
        it("Should prevent invalid game operations", async function () {
            await expect(matchMind.endMatch(gameId))
                .to.be.revertedWith("Game not active");
            await matchMind.startMatch(gameId);
            await expect(matchMind.startMatch(gameId))
                .to.be.revertedWith("Game not in pre-match state");
        });
    });

    describe("Yield Distribution", function () {
        let gameId;
        let gamePoolAddress;
        beforeEach(async function () {
            const tx = await matchMind.createGame();
            await tx.wait();
            gameId = (await gameFactory.gameCounter()) - 1n;
            gamePoolAddress = await gameFactory.getGameAddress(gameId);
            gamePool = await ethers.getContractAt("GamePool", gamePoolAddress);
            await matchMind.startMatch(gameId);
            await matchMind.endMatch(gameId);
        });
        it("Should distribute yield based on rankings", async function () {
            const rankings = [player1.address, player2.address, player3.address];
            await expect(matchMind.distributeYield(gameId, rankings))
                .to.emit(gamePool, "YieldDistributed");
            expect(await gamePool.gameState()).to.equal(3); // DISTRIBUTED
        });
        it("Should only allow owner to distribute yield", async function () {
            const rankings = [player1.address, player2.address];
            await expect(matchMind.connect(player1).distributeYield(gameId, rankings))
                .to.be.revertedWith("Only owner can call this function");
        });
        it("Should prevent distribution before match ends", async function () {
            const tx = await matchMind.createGame();
            await tx.wait();
            const newGameId = (await gameFactory.gameCounter()) - 1n;
            const rankings = [player1.address, player2.address];
            await expect(matchMind.distributeYield(newGameId, rankings))
                .to.be.revertedWith("Game not ended");
        });
    });

    describe("Emergency Functions", function () {
        it("Should only allow owner to use emergency functions", async function () {
            const tokenAddress = await mockCHZ.getAddress();
            const amount = ethers.parseEther("1");
            await expect(matchMind.connect(player1).emergencyRecover(tokenAddress, amount))
                .to.be.revertedWith("Only owner can call this function");
        });
    });

    describe("Integration Tests", function () {
        it("Should complete full game lifecycle", async function () {
            const tx = await matchMind.createGame();
            await tx.wait();
            const gameId = (await gameFactory.gameCounter()) - 1n;
            const gamePoolAddress = await gameFactory.getGameAddress(gameId);
            const gamePool = await ethers.getContractAt("GamePool", gamePoolAddress);
            await matchMind.startMatch(gameId);
            expect(await gamePool.gameState()).to.equal(1);
            await matchMind.endMatch(gameId);
            expect(await gamePool.gameState()).to.equal(2);
            const rankings = [player1.address, player2.address];
            await matchMind.distributeYield(gameId, rankings);
            expect(await gamePool.gameState()).to.equal(3);
        });
        it("Should handle multiple games", async function () {
            const tx1 = await matchMind.createGame();
            await tx1.wait();
            const tx2 = await matchMind.createGame();
            await tx2.wait();
            expect(await gameFactory.gameCounter()).to.equal(2n);
            const allGames = await gameFactory.getAllGames();
            expect(allGames.length).to.equal(2);
        });
    });
}); 