const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying MockChilizStaking contract...");

  const MockChilizStaking = await ethers.getContractFactory("MockChilizStaking");
  const mockStaking = await MockChilizStaking.deploy();
  await mockStaking.waitForDeployment();

  const address = await mockStaking.getAddress();
  console.log("MockChilizStaking deployed to:", address);

  console.log("\nDeployment Summary:");
  console.log("====================");
  console.log("MockChilizStaking:", address);
  console.log("\nUpdate your contract-config.ts with:");
  console.log(`chzStakingPool: '${address}',`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 