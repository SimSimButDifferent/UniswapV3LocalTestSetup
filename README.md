# Uniswap V3 local hardhat testing

This project aims to be a boilerplate for all you need to start creating complex UniswapV3 Swap test cases using hardhat.

Deploys all neccesary contracts, with several addresses with large balances of various different ERC20 tokens.

Boilerplate is loaded with WETH and USDT.

```shell
UniswapV3TestSetup

    Test contract deployment and setup

WETH deployed to 0x54287AaB4D98eA51a3B1FBceE56dAf27E04a56A6
Uniswap V3 Factory deployed to 0xE401FBb0d6828e9f25481efDc9dd18Da9E500983
Uniswap V3 Router deployed to 0xb6aA91E8904d691a10372706e57aE1b390D26353
Uniswap V3 NFT Descriptor deployed to 0x6fFa22292b86D678fF6621eEdC9B15e68dC44DcD
Uniswap V3 Non-Fungible Token Position Descriptor deployed to 0x11632F9766Ee9d9317F95562a6bD529652ead78f
Uniswap V3 Non-Fungible Position Manager deployed to 0x4f1F87d512650f32bf9949C4c5Ef37a3cc891C6D
USDT deployed to 0x6fFa22292b86D678fF6621eEdC9B15e68dC44DcD
USDT/WETH Pool created at address: 0x3f63B929cd59C8BD1DD622Eeb6Dd97b03cE1C2a7

      ✔ should have deployed all contracts

Addresses succesfully funded with WETH!
addr1 WETH Balance: 1000.0
addr2 WETH Balance: 1000.0
addr3 WETH Balance: 1000.0

Addresses succesfully funded with USDT!
addr1 USDT Balance: 10000000.0
addr2 USDT Balance: 10000000.0
addr3 USDT Balance: 10000000.0

      ✔ Should have funded addresses with USDT and WETH
```

Try running some of the following tasks:

```shell
yarn hardhat test
GAS_REPORT=true yarn hardhat test
yarn hardhat node
yarn hardhat run scripts/deploySimpleSwap.js
```
