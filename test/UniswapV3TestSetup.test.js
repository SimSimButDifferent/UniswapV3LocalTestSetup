require("@nomicfoundation/hardhat-network-helpers");
require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const tokenArtifacts = require("../mainnetTokens.json");
const {
  deployWeth,
  deployUniswapV3Factory,
  deployUniswapV3Router,
  deployUniswapV3Pool,
  deployUsdt,
} = require("../utils/deployV3Contracts");

describe("UniswapV3TestSetup", function () {
  let deployer,
    addr1,
    weth,
    usdt,
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

    // Deploy USDT Contract - NOT WORKING

    usdt = await deployUsdt();

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
        ethers.utils.formatEther(gasCostBigInt.toString())
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

    it("Should successfully fund addr 1 with Usdt", async function () {
      // Get USDT contract
      // const usdt = await ethers.getContractAt(
      //   tokenArtifacts["USDT"].abi,
      //   tokenArtifacts["USDT"].address
      // );

      // Check USDT balance of addr1
      const usdtBalanceBeforeTx = await usdt.balanceOf(addr1.address);

      console.log(
        "USDT balance of addr1 before Tx: ",
        ethers.utils.formatUnits(usdtBalanceBeforeTx.toString(), 18)
      );

      // Transfer USDT to addr1
      const transferUsdtTx = await usdt.mint(addr1.address, usdtAmount);

      // Calculate gas Cost

      txReceipt = await transferUsdtTx.wait();

      gasUsed = txReceipt.gasUsed;

      gasPrice = transferUsdtTx.gasPrice;

      const gasCostBigInt = BigInt(gasUsed.mul(gasPrice));

      console.log(
        "Gas cost of funding addr1 with USDT: ",
        ethers.utils.formatEther(gasCostBigInt.toString())
      );

      // Check USDT balance of addr1 after Tx
      const usdtBalanceAfterTx = await usdt.balanceOf(addr1.address);

      // Convert to BigInt
      const usdtBalanceBeforeTxBigInt = BigInt(usdtBalanceBeforeTx);
      const usdtAmountBigInt = BigInt(usdtAmount);

      // Check USDT balance of addr1 after Tx
      expect(usdtBalanceAfterTx).to.equal(
        usdtBalanceBeforeTxBigInt + usdtAmountBigInt
      );

      console.log(
        "USDT balance of addr1 after Tx: ",
        ethers.utils.formatUnits(usdtBalanceAfterTx.toString(), 18)
      );
    });
  });
});
