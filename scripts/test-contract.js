const { ethers } = require("hardhat");

async function main() {
  console.log("Testing MatchMind contract...");

  // Get the signer
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // MatchMind contract address
  const matchMindAddress = "0x6f91424d7f6B88F73D73E6cD83678872f7F51bBD";

  // Get the MatchMind contract
  const MatchMind = await ethers.getContractFactory("MatchMind");
  const matchMind = MatchMind.attach(matchMindAddress);

  console.log("MatchMind contract address:", matchMindAddress);

  try {
    // Check owner
    const owner = await matchMind.owner();
    console.log("Contract owner:", owner);
    console.log("Deployer address:", deployer.address);
    console.log("Owner matches deployer:", owner === deployer.address);

    // Check factory
    const factory = await matchMind.factory();
    console.log("Factory address:", factory);

    // Check GameFactory owner
    const GameFactoryContract = await ethers.getContractFactory("GameFactory");
    const gameFactoryContract = GameFactoryContract.attach(factory);
    const gameFactoryOwner = await gameFactoryContract.owner();
    console.log("GameFactory owner:", gameFactoryOwner);
    console.log("GameFactory owner matches deployer:", gameFactoryOwner === deployer.address);

    // Try to create a game
    console.log("\nAttempting to create a game...");
    const tx = await matchMind.createGame();
    const receipt = await tx.wait();
    
    console.log("✅ Game created successfully!");
    console.log("Transaction hash:", receipt.hash);
    
    // Get the game ID
    const gameId = 0; // First game
    console.log("Game ID:", gameId);
    
    // Get the GameFactory to find the game address
    const gameFactoryAddress = "0x4B58545a3c2Bf7a4Bf2742B9C08821DF637CD8aE";
    const gameFactory = GameFactoryContract.attach(gameFactoryAddress);
    
    const gameAddress = await gameFactory.getGameAddress(gameId);
    console.log("Game Pool Address:", gameAddress);
    
    console.log("\n=== New Game Created ===");
    console.log("Game ID:", gameId);
    console.log("Game Pool Address:", gameAddress);
    console.log("MatchMind Address:", matchMindAddress);
    console.log("GameFactory Address:", gameFactoryAddress);
    
    console.log("\nUpdate your database with:");
    console.log(`contract_address: '${gameAddress}'`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 