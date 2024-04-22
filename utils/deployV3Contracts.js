const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  UniswapV3Router: require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
  UniswapV3NFTDescriptor: require("@uniswap/v3-periphery/artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json"),
  UniswapV3NonFungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  UniswapV3NonFungibleTokenPositionDescriptor: require("@uniswap/v3-periphery/artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json"),
  WETH9: require("@uniswap/hardhat-v3-deploy/src/util/WETH9.json"),
};

const { linkLibraries } = require("./linkLibraries");

async function deployWeth() {
  const [deployer] = await ethers.getSigners();

  const Weth = new hre.ethers.ContractFactory(
    artifacts.WETH9.abi,
    artifacts.WETH9.bytecode,
    deployer
  );

  const weth = await Weth.deploy();

  await weth.deployed();

  // console.log(`WETH deployed to ${weth.address}`);

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

  // console.log(`Uniswap V3 Factory deployed to ${uniswapV3Factory.address}`);

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

  // console.log(`Uniswap V3 Router deployed to ${uniswapV3Router.address}`);

  return uniswapV3Router;
}

// Deploy NFTDescriptor contract
async function deployUniswapV3NFTDescriptor() {
  const [deployer] = await ethers.getSigners();

  const UniswapV3NFTDescriptor = new hre.ethers.ContractFactory(
    artifacts.UniswapV3NFTDescriptor.abi,
    artifacts.UniswapV3NFTDescriptor.bytecode,
    deployer
  );

  const uniswapV3NFTDescriptor = await UniswapV3NFTDescriptor.deploy();

  await uniswapV3NFTDescriptor.deployed();

  // console.log(
  //   `Uniswap V3 NFT Descriptor deployed to ${uniswapV3NFTDescriptor.address}`
  // );

  return uniswapV3NFTDescriptor;
}

// Deploy UniswapV3 non-fungible Token position descriptor contract
async function deployUniswapV3NonFungibleTokenPositionDescriptor(
  wethAddress,
  nftDescriptorAddress
) {
  const [deployer] = await ethers.getSigners();

  const linkedBytecode = linkLibraries(
    {
      bytecode: artifacts.UniswapV3NonFungibleTokenPositionDescriptor.bytecode,
      linkReferences: {
        "NFTDescriptor.sol": {
          NFTDescriptor: [
            {
              length: 20,
              start: 1261,
            },
          ],
        },
      },
    },
    {
      NFTDescriptor: nftDescriptorAddress,
    }
  );

  const UniswapV3NonFungibleTokenPositionDescriptor =
    new hre.ethers.ContractFactory(
      artifacts.UniswapV3NonFungibleTokenPositionDescriptor.abi,
      linkedBytecode,
      deployer
    );

  const uniswapV3NonFungibleTokenPositionDescriptor =
    await UniswapV3NonFungibleTokenPositionDescriptor.deploy(wethAddress);

  await uniswapV3NonFungibleTokenPositionDescriptor.deployed();

  // console.log(
  //   `Uniswap V3 Non-Fungible Token Position Descriptor deployed to ${uniswapV3NonFungibleTokenPositionDescriptor.address}`
  // );

  return uniswapV3NonFungibleTokenPositionDescriptor;
}

// Deploy UniswapV3 non-fungible position manager contract
async function deployUniswapV3NonFungiblePositionManager(
  factory,
  weth,
  nftPositionDescriptorAddress
) {
  const [deployer] = await ethers.getSigners();

  const UniswapV3NonFungiblePositionManager = new hre.ethers.ContractFactory(
    artifacts.UniswapV3NonFungiblePositionManager.abi,
    artifacts.UniswapV3NonFungiblePositionManager.bytecode,
    deployer
  );

  const uniswapV3NonFungiblePositionManager =
    await UniswapV3NonFungiblePositionManager.deploy(
      factory,
      weth,
      nftPositionDescriptorAddress
    );

  await uniswapV3NonFungiblePositionManager.deployed();

  // console.log(`Uniswap V3 Non-Fungible Position Manager deployed to ${uniswapV3NonFungiblePositionManager.address}`);

  return uniswapV3NonFungiblePositionManager;
}

async function deployUsdt() {
  const [deployer] = await ethers.getSigners();

  const Usdt = await hre.ethers.getContractFactory("USDT", deployer);

  const usdt = await Usdt.deploy();

  await usdt.deployed();

  // console.log(`USDT deployed to ${usdt.address}`);

  return usdt;
}

module.exports = {
  deployUniswapV3Router,
  deployUniswapV3Factory,
  deployUniswapV3NFTDescriptor,
  deployUniswapV3NonFungiblePositionManager,
  deployUniswapV3NonFungibleTokenPositionDescriptor,
  deployWeth,
  deployUsdt,
};
