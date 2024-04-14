const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  UniswapV3Router: require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
  WETH9: require("@uniswap/hardhat-v3-deploy/src/util/WETH9.json"),
};

const ERC20 = require("../mainnetTokens.json");

async function deployWeth() {
  const [deployer] = await ethers.getSigners();

  const Weth = new hre.ethers.ContractFactory(
    artifacts.WETH9.abi,
    artifacts.WETH9.bytecode,
    deployer
  );

  const weth = await Weth.deploy();

  await weth.deployed();

  console.log(`WETH deployed to ${weth.address}`);

  return weth;
}

async function deployUniswapV3Factory() {
  const [deployer] = await ethers.getSigners();

  const UniswapV3Factory = new hre.ethers.ContractFactory(
    artifacts.UniswapV3Factory.abi,
    artifacts.UniswapV3Factory.bytecode,
    deployer
  );

  const uniswapV3Factory = await UniswapV3Factory.deploy();

  await uniswapV3Factory.deployed();

  console.log(`Uniswap V3 Factory deployed to ${uniswapV3Factory.address}`);

  return uniswapV3Factory;
}

async function deployUniswapV3Router(uniswapV3Factory, weth) {
  const [deployer] = await ethers.getSigners();

  const UniswapV3Router = new hre.ethers.ContractFactory(
    artifacts.UniswapV3Router.abi,
    artifacts.UniswapV3Router.bytecode,
    deployer
  );

  const uniswapV3Router = await UniswapV3Router.deploy(uniswapV3Factory, weth);

  await uniswapV3Router.deployed();

  console.log(`Uniswap V3 Router deployed to ${uniswapV3Router.address}`);

  return uniswapV3Router;
}

async function deployUsdt() {
  const [deployer] = await ethers.getSigners();

  const Usdt = await hre.ethers.getContractFactory("USDT", deployer);

  const usdt = await Usdt.deploy();

  await usdt.deployed();

  console.log(`USDT deployed to ${usdt.address}`);

  return usdt;
}

module.exports = {
  deployUniswapV3Router,
  deployUniswapV3Factory,
  deployUniswapV3Pool,
  deployWeth,
  deployUsdt,
};
