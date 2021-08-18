import "@nomiclabs/hardhat-waffle"

export default {
  solidity: {
    version: '0.8.0',
    settings: {
      optimizer: { enabled: false },
      evmVersion: 'istanbul',
    },
  }
};
