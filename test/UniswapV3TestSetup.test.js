const { helpers } = require("@nomicfoundation/hardhat-network-helpers");
require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { Contract } = require("ethers");
const { Token } = require("@uniswap/sdk-core");
const { Pool, Position, nearestUsableTick } = require("@uniswap/v3-sdk");

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
const { encodePriceSqrt, getPoolData } = require("../utils/Utilities");

const artifacts = {
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
  UniswapV3PositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
};

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
    wethPrice,
    deployerUsdtAmount,
    deployerWethAmount,
    uniswapV3Factory,
    uniswapV3Router,
    usdtWethPool,
    usdtWethPoolContract,
    usdtWethPoolAddress,
    uniswapV3NFTDescriptor,
    uniswapV3NonFungiblePositionManager,
    uniswapV3NonFungibleTokenPositionDescriptor,
    poolData,
    txReceipt,
    gasUsed,
    gasCost;

  before(async function () {
    [deployer, addr1, addr2, addr3] = await ethers.getSigners();
    provider = deployer.provider;

    await setBalance(deployer.address, ethers.utils.parseEther("500000"));

    feeTier = 3000;

    wethPrice = 3000;

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
      await deployUniswapV3NonFungibleTokenPositionDescriptor(
        weth.address,
        uniswapV3NFTDescriptor.address
      );

    // Deploy Uniswap V3 Non-Fungible Position Manager Contract
    uniswapV3NonFungiblePositionManager =
      await deployUniswapV3NonFungiblePositionManager(
        uniswapV3Factory.address,
        weth.address,
        uniswapV3NonFungibleTokenPositionDescriptor.address
      );

    const uniswapV3NonFungiblePositionManagerAddress =
      uniswapV3NonFungiblePositionManager.address;

    // Deploy USDT Contract
    usdt = await deployUsdt();

    // Fund addresses with WETH and USDT
    await fundTestAddresses(weth, usdt);

    // Deploy usdt/weth pool
    usdtWethPool =
      await uniswapV3NonFungiblePositionManager.createAndInitializePoolIfNecessary(
        usdt.address,
        weth.address,
        feeTier,
        encodePriceSqrt(wethPrice, 1),
        { gasLimit: 5000000 }
      );

    await usdtWethPool.wait();

    usdtWethPoolAddress = await uniswapV3Factory.getPool(
      usdt.address,
      weth.address,
      feeTier
    );

    // Get pool data
    usdtWethPoolContract = new Contract(
      usdtWethPoolAddress,
      artifacts.UniswapV3Pool.abi,
      deployer
    );

    poolData = await getPoolData(usdtWethPoolContract);

    // Create token + pool objects
    const WethToken = new Token(1, weth.address, 18, "WETH", "Wrapped Ether");
    const UsdtToken = new Token(1, usdt.address, 6, "USDT", "Tether USD");

    const pool = new Pool(
      WethToken,
      UsdtToken,
      poolData.fee,
      poolData.sqrtPriceX96.toString(),
      poolData.liquidity.toString(),
      poolData.tick
    );

    // Create position object
    const position = new Position({
      pool: pool,
      liquidity: ethers.utils.parseEther("3000"),
      tickLower:
        nearestUsableTick(poolData.tick, poolData.tickSpacing) -
        poolData.tickSpacing * 2,
      tickUpper:
        nearestUsableTick(poolData.tick, poolData.tickSpacing) +
        poolData.tickSpacing * 2,
    });

    // Outputs amount of each token required to mint position. Enter each into params.
    const { amount0: amount0Desired, amount1: amount1Desired } =
      position.mintAmounts;

    // Create params object for minting position
    params = {
      token0: weth.address,
      token1: usdt.address,
      fee: poolData.fee,
      tickLower:
        nearestUsableTick(poolData.tick, poolData.tickSpacing) -
        poolData.tickSpacing * 2,
      tickUpper:
        nearestUsableTick(poolData.tick, poolData.tickSpacing) +
        poolData.tickSpacing * 2,
      amount0Desired: amount0Desired.toString(),
      amount1Desired: amount1Desired.toString(),
      amount0Min: 0,
      amount1Min: 0,
      recipient: deployer.address,
      deadline: Math.floor(Date.now() / 1000) + 60 * 10,
    };

    // const nonfungiblePositionManager = new Contract(
    //   uniswapV3NonFungiblePositionManagerAddress,
    //   artifacts.UniswapV3PositionManager.abi,
    //   deployer
    // );

    // const tx = await nonfungiblePositionManager.mint(params, {
    //   gasLimit: "1000000",
    // });
    // const receipt = await tx.wait();
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
      expect(uniswapV3NonFungiblePositionManager.address).to.be.properAddress;

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
      console.log(
        `Uniswap V3 Non-Fungible Position Manager deployed to ${uniswapV3NonFungiblePositionManager.address}`
      );
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
