# Uniswap V3 local hardhat testing

This project aims to be a boilerplate for all you need to create complex test cases using hardhat.

Deploys all neccesary contracts, with several addresses with large balances of various different ERC20 tokens.

Boilerplate is loaded with WETH and USDT.

```shell
UniswapV3TestSetup
    Test contract deployment and setup
Deploying UniswapV3 Contracts...
---------------------------------
WETH deployed to 0x54287AaB4D98eA51a3B1FBceE56dAf27E04a56A6
Uniswap V3 Factory deployed to 0xE401FBb0d6828e9f25481efDc9dd18Da9E500983
Uniswap V3 Router deployed to 0xb6aA91E8904d691a10372706e57aE1b390D26353
USDT deployed to 0x6fFa22292b86D678fF6621eEdC9B15e68dC44DcD
---------------------------------

Creating USDT/WETH Pool...
USDT/WETH Pool created at address: 0x3f63B929cd59C8BD1DD622Eeb6Dd97b03cE1C2a7

Contracts Deployed!
---------------------------------

Funding addresses with WETH...
addr1 WETH Balance: 1000.0
addr2 WETH Balance: 1000.0
addr3 WETH Balance: 1000.0

Funding addresses with USDT...
addr1 USDT Balance: 10000000.0
addr2 USDT Balance: 10000000.0
addr3 USDT Balance: 10000000.0
Wallet addresses funded!
```

Try running some of the following tasks:

```shell
yarn hardhat test
GAS_REPORT=true yarn hardhat test
yarn hardhat node
yarn hardhat run scripts/deploySimpleSwap.js
```
