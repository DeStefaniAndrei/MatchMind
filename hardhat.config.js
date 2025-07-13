require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.23",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    chiliz: {
      url: "https://rpc.chiliz.com",
      chainId: 88888,
      accounts: [
        "0x6ac767029147ca423267ec4a001285fec314564a46fdc56436e38934c6bf3c70"
      ]
    },
    chilizTestnet: {
      url: "https://spicy-rpc.chiliz.com",
      chainId: 88882,
      accounts: [
        "0x6ac767029147ca423267ec4a001285fec314564a46fdc56436e38934c6bf3c70"
      ]
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
}; 