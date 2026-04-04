const { ethers } = require('ethers');
const env = require('../config/env');

const contractAbi = [
  'function recordAuction(string winner,string[] users,uint256[] scores,string reason,uint256 timestamp) external returns (bytes32)',
];

const toScaledInteger = (score) => Math.round(Number(score || 0) * 100);

const recordAuction = async ({ winner, reason, scores }) => {
  if (!env.blockchain.enabled) {
    return {
      txHash: null,
      skipped: true,
      message: 'Blockchain config missing. Provide PRIVATE_KEY, POLYGON_RPC_URL, CONTRACT_ADDRESS.',
    };
  }

  try {
    const provider = new ethers.JsonRpcProvider(env.blockchain.rpcUrl, env.blockchain.chainId);
    const wallet = new ethers.Wallet(env.blockchain.privateKey, provider);
    const contract = new ethers.Contract(env.blockchain.contractAddress, contractAbi, wallet);

    const users = Object.keys(scores || {});
    const scoreValues = users.map((user) => toScaledInteger(scores[user]));
    const timestamp = Math.floor(Date.now() / 1000);

    const tx = await contract.recordAuction(winner, users, scoreValues, reason, timestamp);
    const receipt = await tx.wait(1);

    return {
      txHash: receipt && receipt.hash ? receipt.hash : tx.hash,
      skipped: false,
      network: 'polygon-mumbai',
    };
  } catch (error) {
    return {
      txHash: null,
      skipped: true,
      error: error.message,
    };
  }
};

module.exports = {
  recordAuction,
};
