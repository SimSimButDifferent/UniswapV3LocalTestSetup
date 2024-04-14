require("@nomicfoundation/hardhat-network-helpers");
require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  deployWeth,
  deployUniswapV3Factory,
  deployUniswapV3Router,
  deployUsdt,
} = require("../utils/deployV3Contracts");
const { fundTestAddresses } = require("../utils/fundTestAddresses");

describe("UniswapV3TestSetup", function () {
  let deployer,
    addr1,
    addr2,
    addr3,
    weth,
    usdt,
    feeTier,
    ethAmount,
    usdtAmount,
    wethAmount,
    uniswapV3Factory,
    uniswapV3Router,
    usdtWethPool,
    usdtWethPoolAddress,
    txReceipt,
    gasUsed,
    gasCost;

  beforeEach(async function () {
    [deployer, addr1, addr2, addr3] = await ethers.getSigners();

    feeTier = 3000;

    usdtAmount = ethers.utils.parseUnits("10000000", 18);

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

    // Deploy USDT Contract

    usdt = await deployUsdt();

    console.log("---------------------------------");
    console.log(" ");

    // Deploy usdt/weth pool

    usdtWethPool = await uniswapV3Factory.createPool(
      usdt.address,
      weth.address,
      feeTier
    );

    await usdtWethPool.wait();

    usdtWethPoolAddress = await uniswapV3Factory.getPool(
      usdt.address,
      weth.address,
      feeTier
    );

    console.log("Creating USDT/WETH Pool...");
    console.log(`USDT/WETH Pool created at address: ${usdtWethPoolAddress}`);
    console.log(" ");
    console.log("Contracts Deployed!");
    console.log("---------------------------------");
    console.log(" ");

    // Fund addresses with WETH and USDT
    await fundTestAddresses(weth, usdt);

    console.log("Funding addresses with WETH...");
    console.log(
      `addr1 WETH Balance: ${ethers.utils.formatEther(
        await weth.balanceOf(addr1.address)
      )}`
    );
    console.log(
      `addr2 WETH Balance: ${ethers.utils.formatEther(
        await weth.balanceOf(addr1.address)
      )}`
    );
    console.log(
      `addr3 WETH Balance: ${ethers.utils.formatEther(
        await weth.balanceOf(addr1.address)
      )}`
    );

    console.log(" ");
    console.log("Funding addresses with USDT...");
    console.log(
      `addr1 USDT Balance: ${ethers.utils.formatUnits(
        await usdt.balanceOf(addr1.address),
        6
      )}`
    );
    console.log(
      `addr2 USDT Balance: ${ethers.utils.formatUnits(
        await usdt.balanceOf(addr2.address),
        6
      )}`
    );
    console.log(
      `addr3 USDT Balance: ${ethers.utils.formatUnits(
        await usdt.balanceOf(addr3.address),
        6
      )}`
    );

    console.log("Wallet addresses funded!");
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

      expect(wethBalance).to.equal(BigInt(wethAmount * 2));

      console.log(
        `WETH balance of addr1: ${ethers.utils.formatEther(wethBalance)}`
      );
    });

    //     it("Should successfully fund addr 1 with Usdt", async function () {
    //       // Check USDT balance of addr1
    //       const usdtBalanceBeforeTx = await usdt.balanceOf(addr1.address);

    //       console.log(
    //         "USDT balance of addr1 before Tx: ",
    //         ethers.utils.formatUnits(usdtBalanceBeforeTx.toString(), 18)
    //       );

    //       // Transfer USDT to addr1
    //       const transferUsdtTx = await usdt.mint(addr1.address, usdtAmount);

    //       // Calculate gas Cost

    //       txReceipt = await transferUsdtTx.wait();

    //       gasUsed = txReceipt.gasUsed;

    //       gasPrice = transferUsdtTx.gasPrice;

    //       const gasCostBigInt = BigInt(gasUsed.mul(gasPrice));

    //       console.log(
    //         "Gas cost of funding addr1 with USDT: ",
    //         ethers.utils.formatEther(gasCostBigInt.toString())
    //       );

    //       // Check USDT balance of addr1 after Tx
    //       const usdtBalanceAfterTx = await usdt.balanceOf(addr1.address);

    //       // Convert to BigInt
    //       const usdtBalanceBeforeTxBigInt = BigInt(usdtBalanceBeforeTx);
    //       const usdtAmountBigInt = BigInt(usdtAmount);

    //       // Check USDT balance of addr1 after Tx
    //       expect(usdtBalanceAfterTx).to.equal(
    //         usdtBalanceBeforeTxBigInt + usdtAmountBigInt
    //       );

    //       console.log(
    //         "USDT balance of addr1 after Tx: ",
    //         ethers.utils.formatUnits(usdtBalanceAfterTx.toString(), 18)
    //       );
    //     });
    //     it("Should successfully create a pool for USDT/WETH", async function () {
    //       // Check if pool exists
    //       const poolExists = await uniswapV3Factory.getPool(
    //         usdt.address,
    //         weth.address,
    //         feeTier
    //       );

    //       expect(poolExists).to.equal(usdtWethPoolAddress);
    //     });
  });
});

// A function that takes a array of addresses and funds them with 1000 WETH
// async function fundWeth(weth) {
//   const [deployer, addr1, addr2, addr3] = await ethers.getSigners();

//   const wethA1 = await await addr1.sendTransaction({
//     to: weth.address,
//     value: ethers.utils.parseEther("1000"),
//   });

//   const wethA2 = await addr2.sendTransaction({
//     to: weth.address,
//     value: ethers.utils.parseEther("1000"),
//   });

//   const wethA3 = await addr3.sendTransaction({
//     to: weth.address,
//     value: ethers.utils.parseEther("1000"),
//   });

//   return wethA1, wethA2, wethA3;
// }
