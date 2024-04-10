const hre = require("hardhat");

async function deploySimpleSwap() {
  const uniswapV3Router = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

  const SingleSwap = await hre.ethers.getContractFactory("SingleSwap");

  const singleSwap = await SingleSwap.deploy(uniswapV3Router);

  await singleSwap.deployed();

  console.log(`SingleSwap deployed to ${singleSwap.address}`);

  return singleSwap.target;
}

deploySimpleSwap().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
