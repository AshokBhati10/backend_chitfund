const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');
const env = require('../config/env');

const compileContract = () => {
  const contractPath = path.join(__dirname, '..', 'contracts', 'ChitAuctionRecorder.sol');
  const source = fs.readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'ChitAuctionRecorder.sol': {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode'],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = output.errors || [];
  const fatalErrors = errors.filter((error) => error.severity === 'error');

  if (fatalErrors.length > 0) {
    throw new Error(fatalErrors.map((error) => error.formattedMessage).join('\n'));
  }

  const contractData = output.contracts['ChitAuctionRecorder.sol'].ChitAuctionRecorder;
  return {
    abi: contractData.abi,
    bytecode: contractData.evm.bytecode.object,
  };
};

const main = async () => {
  if (!env.blockchain.privateKey || !env.blockchain.rpcUrl) {
    throw new Error('Missing PRIVATE_KEY or POLYGON_RPC_URL in environment');
  }

  const { abi, bytecode } = compileContract();
  const provider = new ethers.JsonRpcProvider(env.blockchain.rpcUrl, env.blockchain.chainId);
  const wallet = new ethers.Wallet(env.blockchain.privateKey, provider);

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const deployTx = contract.deploymentTransaction();
  const address = await contract.getAddress();

  console.log(
    JSON.stringify(
      {
        network: 'polygon-mumbai',
        contractAddress: address,
        deployTxHash: deployTx ? deployTx.hash : null,
      },
      null,
      2
    )
  );
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
