require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: process.env.ALCHEMY_API_URL,
      accounts: [process.env.META_MASK_ACCOUNTS],
    },
  },
};