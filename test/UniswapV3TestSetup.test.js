const { helpers } = require("@nomicfoundation/hardhat-network-helpers");
require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
//require("@uniswapsd");
const {
  deployWeth,
  deployUniswapV3Factory,
  deployUniswapV3Router,
  deployUniswapV3NFTDescriptor,
  deployUniswapV3NonFungibleTokenPositionDescriptor,
  deployUniswapV3NonFungiblePositionManager,
  deployUsdt,
} = require("../utils/deployV3Contracts");
const { fundTestAddresses } = require("../utils/fundTestAddresses");
const { setBalance } = require("@nomicfoundation/hardhat-network-helpers");

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
    deployerUsdtAmount,
    deployerWethAmount,
    uniswapV3Factory,
    uniswapV3Router,
    usdtWethPool,
    usdtWethPoolAddress,
    uniswapV3NFTDescriptor,
    uniswapV3NonFungiblePositionManager,
    uniswapV3NonFungibleTokenPositionDescriptor,
    txReceipt,
    gasUsed,
    gasCost;

  beforeEach(async function () {
    [deployer, addr1, addr2, addr3] = await ethers.getSigners();

    await setBalance(deployer.address, ethers.utils.parseEther("500000"));

    feeTier = 3000;

    deployerUsdtAmount = ethers.utils.parseUnits("1000000000", 6);

    deployerWethAmount = ethers.utils.parseEther("300000");

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

    // Deploy NFT descriptor contract
    uniswapV3NFTDescriptor = await deployUniswapV3NFTDescriptor();

    // Deploy Uniswap V3 Non-Fungible Token Position Descriptor Contract
    uniswapV3NonFungibleTokenPositionDescriptor =
      deployUniswapV3NonFungibleTokenPositionDescriptor(weth.address);

    // // Deploy Uniswap V3 Non-Fungible Position Manager Contract
    // uniswapV3NonFungiblePositionManager =
    //   await deployUniswapV3NonFungiblePositionManager(
    //     uniswapV3Factory,
    //     weth,
    //     usdt
    //   );

    // Deploy USDT Contract

    usdt = await deployUsdt();

    // Fund addresses with WETH and USDT
    await fundTestAddresses(weth, usdt);

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

    // // Approve the router to spend USDT and WETH
    // await usdt.approve(uniswapV3Router.address, usdtAmount);
    // await weth.approve(uniswapV3Router.address, wethAmount);

    // // Prepare the parameters for minting liquidity
    // const params = {
    //   token0: usdt.address,
    //   token1: weth.address,
    //   fee: feeTier, // The fee tier of the pool
    //   tickLower: -887272, // The lower tick of the price range
    //   tickUpper: 887272, // The upper tick of the price range
    //   amount0Desired: usdtAmount, // The desired amount of token0 to add
    //   amount1Desired: wethAmount, // The desired amount of token1 to add
    //   amount0Min: 0, // The minimum amount of token0 to add
    //   amount1Min: 0, // The minimum amount of token1 to add
    //   recipient: deployer.address, // The address that will receive the liquidity tokens
    //   deadline: Date.now() + 1000, // The deadline for the transaction
    // };

    // // Mint liquidity
    // await usdtWethPool.addLiquidity(params);

    // // console.log amounts of WETH and USDT in the pool
    // const poolAmounts = await uniswapV3Router.getPoolAmounts(
    //   usdt.address,
    //   weth.address,
    //   feeTier
    // );

    // console.log(`Pool Amounts: ${poolAmounts[0]}, ${poolAmounts[1]}`);
  });

  describe("Test contract deployment and setup", function () {
    it("should have deployed all contracts", async function () {
      expect(weth.address).to.be.properAddress;
      expect(usdt.address).to.be.properAddress;
      expect(uniswapV3Factory.address).to.be.properAddress;
      expect(uniswapV3Router.address).to.be.properAddress;
      expect(uniswapV3NFTDescriptor.address).to.be.properAddress;
      expect(uniswapV3NonFungibleTokenPositionDescriptor.address).to.be
        .properAddress;
      // expect(uniswapV3NonFungiblePositionManager.address).to.be.properAddress;

      expect(
        await uniswapV3Factory.getPool(usdt.address, weth.address, feeTier)
      ).to.be.properAddress;

      console.log(`WETH deployed to ${weth.address}`);
      console.log(`Uniswap V3 Factory deployed to ${uniswapV3Factory.address}`);
      console.log(`Uniswap V3 Router deployed to ${uniswapV3Router.address}`);
      console.log(
        `Uniswap V3 NFT Descriptor deployed to ${uniswapV3NFTDescriptor.address}`
      );
      console.log(
        `Uniswap V3 Non-Fungible Token Position Descriptor deployed to ${uniswapV3NonFungibleTokenPositionDescriptor.address}`
      );
      // console.log(
      //   `Uniswap V3 Non-Fungible Position Manager deployed to ${uniswapV3NonFungiblePositionManager.address}`
      // );
      console.log(`USDT deployed to ${usdt.address}`);
      console.log(`USDT/WETH Pool created at address: ${usdtWethPoolAddress}`);
    });
    it("Should have funded addresses with USDT and WETH", async function () {
      // Check USDT balance of deployer + addr1, 2 and 3
      const usdtBalanceD = await usdt.balanceOf(deployer.address);
      const usdtBalanceA1 = await usdt.balanceOf(addr1.address);
      const usdtBalanceA2 = await usdt.balanceOf(addr2.address);
      const usdtBalanceA3 = await usdt.balanceOf(addr3.address);

      expect(usdtBalanceD).to.equal(deployerUsdtAmount);
      expect(usdtBalanceA1).to.equal(usdtAmount);
      expect(usdtBalanceA2).to.equal(usdtAmount);
      expect(usdtBalanceA3).to.equal(usdtAmount);

      // Check WETH balance of deployer + addr1, 2 and 3
      const wethBalanceD = await weth.balanceOf(deployer.address);
      const wethBalanceA1 = await weth.balanceOf(addr1.address);
      const wethBalanceA2 = await weth.balanceOf(addr2.address);
      const wethBalanceA3 = await weth.balanceOf(addr3.address);

      expect(wethBalanceD).to.equal(deployerWethAmount);
      expect(wethBalanceA1).to.equal(wethAmount);
      expect(wethBalanceA2).to.equal(wethAmount);
      expect(wethBalanceA3).to.equal(wethAmount);

      console.log("Addresses succesfully funded with WETH!");
      console.log(
        `deployer WETH Balance: ${ethers.utils.formatEther(wethBalanceD)}`
      );
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
      console.log(`deployer USDT Balance: ${usdtBalanceD}`);
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
