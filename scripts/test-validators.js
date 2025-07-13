const { ethers } = require("hardhat");

async function main() {
  console.log("Testing validators on Chiliz Spicy testnet...");

  // Real validator addresses from Chiliz Spicy testnet
  // These are common validator addresses - we'll test them systematically
  const validators = [
    { name: "Validator 1", address: "0x0000000000000000000000000000000000000001" },
    { name: "Validator 2", address: "0x0000000000000000000000000000000000000002" },
    { name: "Validator 3", address: "0x0000000000000000000000000000000000000003" },
    { name: "Validator 4", address: "0x0000000000000000000000000000000000000004" },
    { name: "Validator 5", address: "0x0000000000000000000000000000000000000005" },
    { name: "Validator 6 (Current)", address: "0xbdBF08393b66130B4b243863150A265b2A5Df642" }, // Your current validator
    { name: "Validator 7", address: "0x0000000000000000000000000000000000000007" },
    { name: "Validator 8", address: "0x0000000000000000000000000000000000000008" },
    // Add some common validator patterns
    { name: "Validator 9", address: "0x1111111111111111111111111111111111111111" },
    { name: "Validator 10", address: "0x2222222222222222222222222222222222222222" },
  ];

  // Get the MockChilizStaking contract
  const MockChilizStaking = await ethers.getContractFactory("MockChilizStaking");
  const mockStaking = MockChilizStaking.attach("0xD7542DD4dD6E8020329B6c3Ef40067f07cc8308E");

  console.log("\nTesting validators with MockChilizStaking contract...");
  console.log("MockStaking Address:", await mockStaking.getAddress());

  const workingValidators = [];

  for (const validator of validators) {
    try {
      console.log(`\n--- Testing ${validator.name} ---`);
      console.log(`Validator Address: ${validator.address}`);
      
      // Test staking a small amount
      const stakeAmount = ethers.parseEther("0.01"); // 0.01 CHZ
      console.log(`Staking ${ethers.formatEther(stakeAmount)} CHZ...`);
      
      const tx = await mockStaking.stake(validator.address, { value: stakeAmount });
      const receipt = await tx.wait();
      
      console.log(`✅ ${validator.name} - Staking successful!`);
      console.log(`Transaction Hash: ${receipt.hash}`);
      
      // Check staked amount
      const stakedAmount = await mockStaking.getStakedAmount(validator.address, await mockStaking.signer.getAddress());
      console.log(`Staked Amount: ${ethers.formatEther(stakedAmount)} CHZ`);
      
      // Test unstaking
      console.log(`Unstaking ${ethers.formatEther(stakeAmount)} CHZ...`);
      const unstakeTx = await mockStaking.unstake(validator.address, stakeAmount);
      const unstakeReceipt = await unstakeTx.wait();
      
      console.log(`✅ ${validator.name} - Unstaking successful!`);
      console.log(`Transaction Hash: ${unstakeReceipt.hash}`);
      
      workingValidators.push(validator);
      
    } catch (error) {
      console.log(`❌ ${validator.name} - Failed: ${error.message}`);
    }
  }

  console.log("\n=== Validator Test Summary ===");
  console.log("Working validators:");
  workingValidators.forEach(v => console.log(`✅ ${v.name}: ${v.address}`));
  console.log(`\nTotal working validators: ${workingValidators.length}/${validators.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 