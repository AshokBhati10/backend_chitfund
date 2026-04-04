const { ethers } = require('ethers');
const dotenv = require('dotenv');

dotenv.config();

const normalizePrivateKey = (value) => {
  if (!value) return '';
  return value.startsWith('0x') ? value : `0x${value}`;
};

const main = async () => {
  const rpcUrl = process.env.SEPOLIA_RPC_URL || '';
  const privateKey = normalizePrivateKey(process.env.SEPOLIA_PRIVATE_KEY || '');
  const contractAddress = process.env.CONTRACT_ADDRESS || '';
  const amountEth = process.argv[2] || '0.001';

  if (!rpcUrl) {
    throw new Error('Missing SEPOLIA_RPC_URL in .env');
  }
  if (!privateKey) {
    throw new Error('Missing SEPOLIA_PRIVATE_KEY in .env');
  }
  if (!contractAddress) {
    throw new Error('Missing CONTRACT_ADDRESS in .env');
  }

  if (!ethers.isAddress(contractAddress)) {
    throw new Error('CONTRACT_ADDRESS is not a valid Ethereum address');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const network = await provider.getNetwork();
  if (network.chainId !== 11155111n) {
    throw new Error(`Connected to wrong network (chainId=${network.chainId}). Expected Sepolia (11155111).`);
  }

  const value = ethers.parseEther(amountEth);
  let tx;

  try {
    // Preferred path for contracts with receive() / payable fallback.
    tx = await wallet.sendTransaction({
      to: contractAddress,
      value,
    });
  } catch (directError) {
    const directMessage = String(
      directError && directError.message ? directError.message : directError
    );

    console.warn('Direct ETH transfer failed. Trying payable function investNormal()...');

    try {
      // Fallback for contracts that accept ETH only through payable methods (e.g., AIChitFundGroup).
      const contract = new ethers.Contract(
        contractAddress,
        ['function investNormal() external payable'],
        wallet
      );
      tx = await contract.investNormal({ value });
    } catch (functionError) {
      const functionMessage = String(
        functionError && functionError.message ? functionError.message : functionError
      );
      throw new Error(
        [
          'Contract did not accept funding.',
          `Direct transfer error: ${directMessage}`,
          `investNormal() error: ${functionMessage}`,
          'Use a contract with receive()/payable fallback OR set CONTRACT_ADDRESS to a contract with a payable invest function.',
        ].join('\n')
      );
    }
  }

  console.log(`txHash: ${tx.hash}`);
  const receipt = await tx.wait();

  if (!receipt || Number(receipt.status) !== 1) {
    throw new Error('Transaction was not confirmed successfully');
  }

  console.log(`Confirmed in block: ${receipt.blockNumber}`);
  console.log(`Success: Sent ${amountEth} ETH to ${contractAddress}`);
};

main().catch((error) => {
  const message = String(error && error.message ? error.message : error);

  if (
    message.toLowerCase().includes('execution reverted') ||
    message.toLowerCase().includes('call_exception') ||
    message.toLowerCase().includes('missing revert data')
  ) {
    console.error('Transaction reverted: target contract is not accepting direct ETH transfer.');
    console.error('Ensure the contract has a payable receive/fallback OR use a payable function call.');
  }

  console.error(message);
  process.exit(1);
});
