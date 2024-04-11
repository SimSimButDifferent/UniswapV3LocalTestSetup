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
    uniswapV3Pool,
    txReceipt,
    gasUsed,
    gasCost;

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
      // Check eth balance of addr1
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

      // Calculate gas Cost

      txReceipt = await sendEthTx.wait();

      gasUsed = txReceipt.gasUsed;

      gasPrice = sendEthTx.gasPrice;

      const gasCostBigInt = BigInt(gasUsed.mul(gasPrice));

      console.log(
        "Gas cost of minting WETH: ",
        ethers.utils.formatEther(gasCost.toString())
      );

      // Check eth balance of addr1 after Tx
      const ethBalanceAfterTx = await addr1.getBalance();

      // Convert to BigInt
      const ethBalanceBeforeTxBigInt = BigInt(ethBalanceBeforeTx);
      const ethAmountBigInt = BigInt(ethAmount);

      // Check Eth balance of addr1 after Tx
      expect(ethBalanceAfterTx).to.equal(
        ethBalanceBeforeTxBigInt - (ethAmountBigInt + gasCostBigInt)
      );

      console.log(
        "ETH balance of addr1 after Tx: ",
        ethers.utils.formatEther(ethBalanceAfterTx.toString())
      );

      // get Weth balance for addr1
      const wethBalance = await weth.balanceOf(addr1.address);

      expect(wethBalance).to.equal(wethAmount);

      console.log(
        `WETH balance of addr1: ${ethers.utils.formatEther(wethBalance)}`
      );
    });
  });
});
