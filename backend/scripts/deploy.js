const hre = require('hardhat');

async function main() {
  console.log('Deploying AuctionStorage to Sepolia...');

  const AuctionStorage = await hre.ethers.getContractFactory('AuctionStorage');
  const contract = await AuctionStorage.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log(`AuctionStorage deployed to: ${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});