const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const env = require('../config/env.cjs');

const artifactPath = path.join(
  __dirname,
  '..',
  'artifacts',
  'contracts',
  'AuctionStorage.sol',
  'AuctionStorage.json'
);

const getContractAbi = () => {
  if (!fs.existsSync(artifactPath)) {
    throw new Error('AuctionStorage artifact not found. Run: npx hardhat compile');
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  if (!artifact.abi) {
    throw new Error('Invalid AuctionStorage artifact: ABI missing');
  }

  return artifact.abi;
};

const validateBlockchainConfig = () => {
  if (!env.blockchain.privateKey) {
    throw new Error('Missing SEPOLIA_PRIVATE_KEY in .env');
  }
  if (!env.blockchain.rpcUrl) {
    throw new Error('Missing SEPOLIA_RPC_URL in .env');
  }
  if (!env.blockchain.contractAddress) {
    throw new Error('Missing CONTRACT_ADDRESS in .env');
  }
};

const recordAuction = async ({ winner, reason, scores }) => {
  validateBlockchainConfig();

  const provider = new ethers.JsonRpcProvider(env.blockchain.rpcUrl, env.blockchain.chainId);
  const wallet = new ethers.Wallet(env.blockchain.privateKey, provider);
  const abi = getContractAbi();
  const contract = new ethers.Contract(env.blockchain.contractAddress, abi, wallet);

  const scoresPayload = typeof scores === 'string' ? scores : JSON.stringify(scores || {});

  const tx = await contract.storeAuction(winner, reason, scoresPayload);
  const receipt = await tx.wait();

  return {
    txHash: receipt && receipt.hash ? receipt.hash : tx.hash,
    network: 'sepolia',
  };
};

module.exports = {
  recordAuction,
};
