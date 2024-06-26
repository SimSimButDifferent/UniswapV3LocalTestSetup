async function fundTestAddresses(weth, usdt) {
  await fundWeth(weth);
  await fundUsdt(usdt);
}

async function fundWeth(weth) {
  const [deployer, addr1, addr2, addr3] = await ethers.getSigners();

  const wethD = await deployer.sendTransaction({
    to: weth.address,
    value: ethers.utils.parseEther("300000"),
  });

  const wethA1 = await addr1.sendTransaction({
    to: weth.address,
    value: ethers.utils.parseEther("1000"),
  });

  const wethA2 = await addr2.sendTransaction({
    to: weth.address,
    value: ethers.utils.parseEther("1000"),
  });

  const wethA3 = await addr3.sendTransaction({
    to: weth.address,
    value: ethers.utils.parseEther("1000"),
  });

  return wethD, wethA1, wethA2, wethA3;
}

async function fundUsdt(usdt) {
  const [deployer, addr1, addr2, addr3] = await ethers.getSigners();

  const usdtD = await usdt.mint(
    deployer.address,
    ethers.utils.parseUnits("1000000000", 6)
  );

  const usdtA1 = await usdt.mint(
    addr1.address,
    ethers.utils.parseUnits("10000000", 6)
  );
  const usdtA2 = await usdt.mint(
    addr2.address,
    ethers.utils.parseUnits("10000000", 6)
  );
  const usdtA3 = await usdt.mint(
    addr3.address,
    ethers.utils.parseUnits("10000000", 6)
  );

  return usdtD, usdtA1, usdtA2, usdtA3;
}

module.exports = { fundTestAddresses };
