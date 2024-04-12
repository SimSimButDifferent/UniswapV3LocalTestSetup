require("@nomicfoundation/hardhat-toolbox");
require("@uniswap/hardhat-v3-deploy");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.7.6",
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/VuIQG_PWKLrGJ3At5UsTBFVSaq97E41r",
        blockNumber: 19586495,
        gasLimit: 12000000,
      },
    },
  },
};
