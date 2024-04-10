require("@nomicfoundation/hardhat-network-helpers");
require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const tokenArtifacts = require("../mainnetTokens.json");
const {
  deployWeth,
  deployUniswapV3Factory,
  deployUniswapV3Router,
} = require("../utils/deployV3Contracts");

describe("UniswapV3TestSetup", function () {
  let deployer,
    addr1,
    weth,
    feeTier,
    ethAmount,
    usdtAmount,
    wethAmount,
    uniswapV3Factory,
    uniswapV3Router,
    uniswapV3Pool;

  beforeEach(async function () {
    [deployer, addr1] = await ethers.getSigners();

    feeTier = 3000;

    usdtAmount = ethers.utils.parseUnits("1000000", 18);

    wethAmount = ethers.utils.parseUnits("1000", 18);

    ethAmount = ethers.utils.parseEther("1000");

    console.log("Deploying UniswapV3 Contracts...");
    console.log("---------------------------------");

    // Deploy WETH Contract
    weth = await deployWeth();

    // Deploy Uinswap V3 Factory Contract
    uniswapV3Factory = await deployUniswapV3Factory();

    // Deploy Uniswap V3 Router Contract
    uniswapV3Router = await deployUniswapV3Router(
      uniswapV3Factory.address,
      weth.address
    );

    console.log("Contracts Deployed!");
    console.log("---------------------------------");
  });

  describe("Test contract deployment and setup", function () {
    it("Should Succesfully mint weth", async function () {
      // Check eth balance of deployer
      const ethBalanceBeforeTx = await addr1.getBalance();

      console.log(
        "ETH balance of addr1 before Tx: ",
        ethers.utils.formatEther(ethBalanceBeforeTx.toString())
      );

      // Send eth to weth contract
      const sendEthTx = await addr1.sendTransaction({
        to: weth.address,
        value: wethAmount,
      });

      const txReceipt = sendEthTx.wait();

      // const gasCost = txReceipt.gasUsed * sendEthTx.gasPrice;

      // console.log(
      //   "Gas cost of minting WETH: ",
      //   ethers.utils.formatEther(gasCost.toString())
      // );

      const ethBalanceAfterTx = await addr1.getBalance();

      // expect(ethBalanceAfterTx).to.equal(
      //   ethBalanceBeforeTx.sub(ethAmount + gasCost)
      // );

      console.log(
        "ETH balance of addr1 after Tx: ",
        ethers.utils.formatEther(ethBalanceAfterTx.toString())
      );
    });
  });
});
