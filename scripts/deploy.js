// Deployment script for MatchMind contract on Chiliz Chain
// Use this in Remix IDE

async function main() {
    // Chiliz Chain addresses (you'll need to replace these with actual addresses)
    const CHZ_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual CHZ token address
    const STAKING_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual staking contract
    const VALIDATOR_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual validator address
    const OWNER_ADDRESS = "0x93d43c27746D76e7606C55493A757127b33D7763"; // Your address

    console.log("Deploying MatchMind contract...");
    console.log("CHZ Token:", CHZ_TOKEN_ADDRESS);
    console.log("Staking Contract:", STAKING_CONTRACT_ADDRESS);
    console.log("Validator:", VALIDATOR_ADDRESS);
    console.log("Owner:", OWNER_ADDRESS);

    // Deploy the contract
    const MatchMind = await ethers.getContractFactory("MatchMind");
    const matchMind = await MatchMind.deploy(
        OWNER_ADDRESS,
        CHZ_TOKEN_ADDRESS,
        STAKING_CONTRACT_ADDRESS,
        VALIDATOR_ADDRESS
    );

    await matchMind.waitForDeployment();

    console.log("MatchMind deployed to:", await matchMind.getAddress());
    console.log("Factory deployed to:", await matchMind.factory());

    // Create a test game
    console.log("Creating test game...");
    const tx = await matchMind.createGame();
    const receipt = await tx.wait();
    console.log("Test game created!");

    return {
        matchMind: await matchMind.getAddress(),
        factory: await matchMind.factory(),
        owner: OWNER_ADDRESS
    };
}

// For Remix IDE, export the main function
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { main };
}

// For direct execution
if (typeof window === 'undefined') {
    main()
        .then((result) => {
            console.log("Deployment successful:", result);
            process.exit(0);
        })
        .catch((error) => {
            console.error("Deployment failed:", error);
            process.exit(1);
        });
} 