const { expect } = require("chai");

describe("VotingSystem", function () {
  let contract, owner, voter;

  beforeEach(async () => {
    [owner, voter] = await ethers.getSigners();
    const Voting = await ethers.getContractFactory("VotingSystem");
    contract = await Voting.deploy();
    await contract.deployed();
  });

  it("Owner can add candidate", async () => {
    await contract.addCandidate("A", "Party", "img");
    const c = await contract.candidates(1);
    expect(c.name).to.equal("A");
  });

  it("Voter can vote", async () => {
    await contract.addCandidate("A", "Party", "img");
    await contract.addVoter(voter.address);
    await contract.startVoting();
    await contract.connect(voter).castVote(1);
    const c = await contract.candidates(1);
    expect(c.voteCount).to.equal(1);
  });
});
