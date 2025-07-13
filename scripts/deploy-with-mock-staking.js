const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying MatchMind contracts with MockChilizStaking...");

  // Mock staking contract address (already deployed)
  const mockStakingAddress = "0xD7542DD4dD6E8020329B6c3Ef40067f07cc8308E";
  
  // Validator address (your current validator)
  const validatorAddress = "0xbdBF08393b66130B4b243863150A265b2A5Df642";
  
  // Zero address for native CHZ
  const chzTokenAddress = "0x0000000000000000000000000000000000000000";

  console.log("Using MockStaking Address:", mockStakingAddress);
  console.log("Using Validator Address:", validatorAddress);
  console.log("Using CHZ Token Address:", chzTokenAddress);

  // Get the signer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy MatchMind contract
  console.log("\nDeploying MatchMind contract...");
  const MatchMind = await ethers.getContractFactory("MatchMind");
  const matchMind = await MatchMind.deploy(
    deployer.address, // owner
    chzTokenAddress,  // chzToken
    mockStakingAddress, // stakingContract
    validatorAddress   // validator
  );
  await matchMind.waitForDeployment();
  const matchMindAddress = await matchMind.getAddress();
  console.log("MatchMind deployed to:", matchMindAddress);

  // Deploy GameFactory contract
  console.log("\nDeploying GameFactory contract...");
  const GameFactory = await ethers.getContractFactory("GameFactory");
  const gameFactory = await GameFactory.deploy(
    deployer.address, // owner
    chzTokenAddress,  // chzToken
    mockStakingAddress, // stakingContract
    validatorAddress   // validator
  );
  await gameFactory.waitForDeployment();
  const gameFactoryAddress = await gameFactory.getAddress();
  console.log("GameFactory deployed to:", gameFactoryAddress);

  console.log("\n=== Deployment Summary ===");
  console.log("MatchMind:", matchMindAddress);
  console.log("GameFactory:", gameFactoryAddress);
  console.log("MockStaking:", mockStakingAddress);
  console.log("Validator:", validatorAddress);
  
  console.log("\nUpdate your frontend config with:");
  console.log(`matchMind: '${matchMindAddress}',`);
  console.log(`gameFactory: '${gameFactoryAddress}',`);
  console.log(`chzStakingPool: '${mockStakingAddress}',`);
  console.log(`validator: '${validatorAddress}',`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 