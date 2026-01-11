import { connectWallet } from "../common/wallet.js";
import { getContract, getReadContract } from "../common/contract.js";

let contract;
let adminVerified = false;

/* =======================
   DISABLE ADMIN ACTIONS
======================= */
function disableAdminActions() {
  document.querySelectorAll("button").forEach(btn => {
    if (btn.id !== "connect") {
      btn.disabled = true;
      btn.style.opacity = "0.5";
      btn.style.cursor = "not-allowed";
    }
  });
}

/* =======================
   ENABLE ADMIN ACTIONS
======================= */
function enableAdminActions() {
  document.querySelectorAll("button").forEach(btn => {
    btn.disabled = false;
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
  });
}

/* Disable everything on page load */
disableAdminActions();

/* =======================
   CONNECT WALLET + VERIFY
======================= */
document.getElementById("connect").addEventListener("click", async () => {
  try {
    const account = await connectWallet();
    if (!account) return;

    const readContract = getReadContract();
    const owner = await readContract.owner();

    if (account.toLowerCase() !== owner.toLowerCase()) {
      alert("❌ You are not the Admin (contract owner)");
      disableAdminActions();
      adminVerified = false;
      return;
    }

    // ADMIN VERIFIED
    contract = getContract();
    adminVerified = true;
    enableAdminActions();

    alert("✅ Admin wallet verified:\n" + account);

  } catch (err) {
    console.error(err);
    alert("Error connecting wallet");
  }
});

/* =======================
   ADD CANDIDATE
======================= */
document.getElementById("addCandidate").addEventListener("click", async () => {
  if (!adminVerified) {
    alert("Admin not verified");
    return;
  }

  const name = cname.value;
  const party = cparty.value;
  const img = cimg.value;

  if (!name || !party || !img) {
    alert("Fill all candidate fields");
    return;
  }

  await contract.addCandidate(name, party, img);
  alert("Candidate added successfully");
});

/* =======================
   ADD VOTER
======================= */
document.getElementById("addVoter").addEventListener("click", async () => {
  if (!adminVerified) {
    alert("Admin not verified");
    return;
  }

  const voter = voterAddress.value;
  if (!voter) {
    alert("Enter voter address");
    return;
  }

  await contract.addVoter(voter);
  alert("Voter added successfully");
});

/* =======================
   START VOTING
======================= */
document.getElementById("startVoting").addEventListener("click", async () => {
  if (!adminVerified) {
    alert("Admin not verified");
    return;
  }

  await contract.startVoting();
  alert("Voting started");
});

/* =======================
   END VOTING
======================= */
document.getElementById("endVoting").addEventListener("click", async () => {
  if (!adminVerified) {
    alert("Admin not verified");
    return;
  }

  await contract.endVoting();
  alert("Voting ended");
});
