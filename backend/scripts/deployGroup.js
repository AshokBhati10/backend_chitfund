const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const initialMembers = [deployer.address];

  console.log('Deploying AIChitFundGroup to Sepolia...');
  console.log(`Deployer: ${deployer.address}`);

  const Group = await hre.ethers.getContractFactory('AIChitFundGroup');
  const contract = await Group.deploy(initialMembers);

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log(`AIChitFundGroup deployed to: ${contractAddress}`);
  console.log(`Initial member count: ${initialMembers.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
