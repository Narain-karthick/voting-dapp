import { connectWallet } from "../common/wallet.js";
import { getContract } from "../common/contract.js";

let contract;

document.getElementById("connect").onclick = async () => {
  await connectWallet();
  contract = getContract();
  loadCandidates();
};

async function loadCandidates() {
  const list = await contract.getCandidates();

  if (!list || list.length === 0) {
    alert("No candidates available");
    return;
  }

  const div = document.getElementById("candidates");
  div.innerHTML = "";

  list.forEach((c) => {
    const btn = document.createElement("button");
    btn.innerText = `Vote ${c.name} (${c.party})`;
    btn.onclick = async () => {
      await contract.castVote(c.id);
      alert("Vote Cast Successfully!");
    };
    div.appendChild(btn);
  });
}

