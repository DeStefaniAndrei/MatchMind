const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying simplified betting system...");

  // Get the signer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy MatchMind contract first (we'll need its address)
  console.log("\nDeploying MatchMind contract...");
  const MatchMind = await ethers.getContractFactory("MatchMind");
  const matchMind = await MatchMind.deploy(deployer.address, "0x0000000000000000000000000000000000000000"); // Temporary factory address
  await matchMind.waitForDeployment();
  const matchMindAddress = await matchMind.getAddress();
  console.log("MatchMind deployed to:", matchMindAddress);

  // Deploy GameFactory contract with MatchMind address
  console.log("\nDeploying GameFactory contract...");
  const GameFactory = await ethers.getContractFactory("GameFactory");
  const gameFactory = await GameFactory.deploy(deployer.address, matchMindAddress);
  await gameFactory.waitForDeployment();
  const gameFactoryAddress = await gameFactory.getAddress();
  console.log("GameFactory deployed to:", gameFactoryAddress);

  console.log("\n=== Deployment Summary ===");
  console.log("MatchMind:", matchMindAddress);
  console.log("GameFactory:", gameFactoryAddress);
  
  console.log("\nUpdate your frontend config with:");
  console.log(`matchMind: '${matchMindAddress}',`);
  console.log(`gameFactory: '${gameFactoryAddress}',`);
  
  console.log("\n=== How to use ===");
  console.log("1. Create games using MatchMind.createGame()");
  console.log("2. Users can bet using GamePool.betAndEnter()");
  console.log("3. Start matches using MatchMind.startMatch()");
  console.log("4. End matches using MatchMind.endMatch()");
  console.log("5. Distribute winnings using MatchMind.distributeWinnings()");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 