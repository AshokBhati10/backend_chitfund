require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

const normalizePrivateKey = (key) => {
  if (!key) return '';
  return key.startsWith('0x') ? key : `0x${key}`;
};

const privateKey = normalizePrivateKey(process.env.SEPOLIA_PRIVATE_KEY || '');

module.exports = {
  solidity: '0.8.20',
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || '',
      accounts: privateKey ? [privateKey] : [],
      chainId: 11155111,
    },
  },
};