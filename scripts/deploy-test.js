const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    
    if (!deployer) {
        throw new Error("No deployer account found. Make sure PRIVATE_KEY is set in environment variables.");
    }
    
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());
    
    // Test addresses (replace with real addresses for Chiliz Chain)
    const CHZ_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"; // Zero address for native CHZ
    const STAKING_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000001000";
    const VALIDATOR_ADDRESS = "0x0000000000000000000000000000000000000001"; // Replace with actual validator
    
    console.log("Deploying MatchMind...");
    const MatchMind = await ethers.getContractFactory("MatchMind");
    const matchMind = await MatchMind.deploy(
        deployer.address,
        CHZ_TOKEN_ADDRESS,
        STAKING_CONTRACT_ADDRESS,
        VALIDATOR_ADDRESS
    );
    
    await matchMind.waitForDeployment();
    const matchMindAddress = await matchMind.getAddress();
    
    console.log("MatchMind deployed to:", matchMindAddress);
    
    // Get factory address
    const factoryAddress = await matchMind.factory();
    console.log("GameFactory deployed to:", factoryAddress);
    
    // Test creating a game
    console.log("Creating a test game...");
    const gameId = await matchMind.createGame();
    console.log("Game created with ID:", gameId.toString());
    
    const gameAddress = await matchMind.factory().then(async (factoryAddr) => {
        const factory = await ethers.getContractAt("GameFactory", factoryAddr);
        return await factory.getGameAddress(gameId);
    });
    
    console.log("GamePool deployed to:", gameAddress);
    
    console.log("\nDeployment Summary:");
    console.log("===================");
    console.log("MatchMind:", matchMindAddress);
    console.log("GameFactory:", factoryAddress);
    console.log("GamePool (Game 0):", gameAddress);
    console.log("Owner:", deployer.address);
    console.log("CHZ Token:", CHZ_TOKEN_ADDRESS);
    console.log("Staking Contract:", STAKING_CONTRACT_ADDRESS);
    console.log("Validator:", VALIDATOR_ADDRESS);
    
    // Export addresses for testing
    console.log("\nFor testing, update these addresses in your test files:");
    console.log(`MATCHMIND_ADDRESS = "${matchMindAddress}";`);
    console.log(`FACTORY_ADDRESS = "${factoryAddress}";`);
    console.log(`GAMEPOOL_ADDRESS = "${gameAddress}";`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 