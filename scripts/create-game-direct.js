const { ethers } = require("hardhat");

async function main() {
  console.log("Creating a new game directly using GameFactory...");

  // Get the signer
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // GameFactory contract address
  const gameFactoryAddress = "0x4B58545a3c2Bf7a4Bf2742B9C08821DF637CD8aE";

  // Get the GameFactory contract
  const GameFactory = await ethers.getContractFactory("GameFactory");
  const gameFactory = GameFactory.attach(gameFactoryAddress);

  console.log("GameFactory contract address:", gameFactoryAddress);

  try {
    // Check owner
    const owner = await gameFactory.owner();
    console.log("GameFactory owner:", owner);
    console.log("Deployer address:", deployer.address);
    console.log("Owner matches deployer:", owner === deployer.address);

    // Create a new game directly
    console.log("\nCreating a new game...");
    const tx = await gameFactory.createGame();
    const receipt = await tx.wait();
    
    console.log("✅ Game created successfully!");
    console.log("Transaction hash:", receipt.hash);
    
    // Get the game ID and address
    const gameCounter = await gameFactory.gameCounter();
    const gameId = Number(gameCounter) - 1;
    console.log("Game ID:", gameId);
    
    const gameAddress = await gameFactory.getGameAddress(gameId);
    console.log("Game Pool Address:", gameAddress);
    
    console.log("\n=== New Game Created ===");
    console.log("Game ID:", gameId);
    console.log("Game Pool Address:", gameAddress);
    console.log("GameFactory Address:", gameFactoryAddress);
    
    console.log("\nUpdate your database with:");
    console.log(`contract_address: '${gameAddress}'`);
    
  } catch (error) {
    console.error("❌ Error creating game:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 