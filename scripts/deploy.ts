// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Voting contract...");

  const VoteSystem = await ethers.getContractFactory("Voting");
  const voteSystem = await VoteSystem.deploy();
  await voteSystem.waitForDeployment();

  console.log("Voting deployed to:", await voteSystem.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });