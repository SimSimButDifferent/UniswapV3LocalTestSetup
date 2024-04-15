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

    usdtAmount = ethers.utils.parseUnits("10000000", 6);

    wethAmount = ethers.utils.parseUnits("1000", 18);

    ethAmount = ethers.utils.parseEther("1000");

    // Deploying UniswapV3 Contracts

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

    // Fund addresses with WETH and USDT
    await fundTestAddresses(weth, usdt);
  });

  describe("Test contract deployment and setup", function () {
    it("should have deployed all contracts", async function () {
      expect(weth.address).to.be.properAddress;
      expect(usdt.address).to.be.properAddress;
      expect(uniswapV3Factory.address).to.be.properAddress;
      expect(uniswapV3Router.address).to.be.properAddress;
      expect(
        await uniswapV3Factory.getPool(usdt.address, weth.address, feeTier)
      ).to.be.properAddress;

      console.log(`WETH deployed to ${weth.address}`);
      console.log(`Uniswap V3 Factory deployed to ${uniswapV3Factory.address}`);
      console.log(`Uniswap V3 Router deployed to ${uniswapV3Router.address}`);
      console.log(`USDT deployed to ${usdt.address}`);
      console.log(`USDT/WETH Pool created at address: ${usdtWethPoolAddress}`);
    });
    it("Should have funded addresses with USDT and WETH", async function () {
      // Check USDT balance of addr1, 2 and 3
      const usdtBalanceA1 = await usdt.balanceOf(addr1.address);
      const usdtBalanceA2 = await usdt.balanceOf(addr2.address);
      const usdtBalanceA3 = await usdt.balanceOf(addr3.address);

      expect(usdtBalanceA1).to.equal(usdtAmount);
      expect(usdtBalanceA2).to.equal(usdtAmount);
      expect(usdtBalanceA3).to.equal(usdtAmount);

      // Check WETH balance of addr1, 2 and 3
      const wethBalanceA1 = await weth.balanceOf(addr1.address);
      const wethBalanceA2 = await weth.balanceOf(addr2.address);
      const wethBalanceA3 = await weth.balanceOf(addr3.address);

      expect(wethBalanceA1).to.equal(wethAmount);
      expect(wethBalanceA2).to.equal(wethAmount);
      expect(wethBalanceA3).to.equal(wethAmount);

      console.log("Addresses succesfully funded with WETH!");
      console.log(
        `addr1 WETH Balance: ${ethers.utils.formatEther(wethBalanceA1)}`
      );
      console.log(
        `addr2 WETH Balance: ${ethers.utils.formatEther(wethBalanceA2)}`
      );
      console.log(
        `addr3 WETH Balance: ${ethers.utils.formatEther(wethBalanceA3)}`
      );

      console.log(" ");
      console.log("Addresses succesfully funded with USDT!");
      console.log(
        `addr1 USDT Balance: ${ethers.utils.formatUnits(usdtBalanceA1, 6)}`
      );
      console.log(
        `addr2 USDT Balance: ${ethers.utils.formatUnits(usdtBalanceA2, 6)}`
      );
      console.log(
        `addr3 USDT Balance: ${ethers.utils.formatUnits(usdtBalanceA3, 6)}`
      );
    });
  });
});
