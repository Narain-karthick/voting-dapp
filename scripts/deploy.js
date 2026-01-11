const hre = require("hardhat");

async function main() {
  const Voting = await hre.ethers.getContractFactory("VotingSystem");
  const voting = await Voting.deploy();

  await voting.waitForDeployment();

  console.log("VotingSystem deployed to:", await voting.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
