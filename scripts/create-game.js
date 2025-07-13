const { ethers } = require("hardhat");

async function main() {
  console.log("Creating a new game using the new MatchMind contract...");

  // Get the signer
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // MatchMind contract address (new simplified betting system)
  const matchMindAddress = "0x6f91424d7f6B88F73D73E6cD83678872f7F51bBD";

  // Get the MatchMind contract
  const MatchMind = await ethers.getContractFactory("MatchMind");
  const matchMind = MatchMind.attach(matchMindAddress);

  console.log("MatchMind contract address:", matchMindAddress);

  try {
    // Create a new game
    console.log("\nCreating a new game...");
    const tx = await matchMind.createGame();
    const receipt = await tx.wait();
    
    console.log("✅ Game created successfully!");
    console.log("Transaction hash:", receipt.hash);
    
    // Get the game ID and address
    const gameId = await matchMind.gameCounter() - 1; // Assuming gameCounter is incremented after creation
    console.log("Game ID:", gameId);
    
    // Get the GameFactory to find the game address
    const GameFactory = await ethers.getContractFactory("GameFactory");
    const gameFactoryAddress = "0xeF0635a14c2E606cfF97cB6B0950228811b5bd62";
    const gameFactory = GameFactory.attach(gameFactoryAddress);
    
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
    console.error("❌ Error creating game:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 