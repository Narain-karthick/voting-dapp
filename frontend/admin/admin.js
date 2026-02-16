import { connectWallet } from "../common/wallet.js";
import { getContract, getReadContract } from "../common/contract.js";

let contract;
let adminVerified = false;

/* =======================
   DISABLE ADMIN ACTIONS
======================= */
function disableAdminActions() {
  // Disable all admin buttons except connect wallet
  const adminButtons = [
    'openCandidateBtn',
    'openVoterBtn',
    'addCandidateBtn',
    'addVoterBtn', 
    'startVotingBtn',
    'endVotingBtn'
  ];
  
  adminButtons.forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) {
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
  const adminButtons = [
    'openCandidateBtn',
    'openVoterBtn',
    'addCandidateBtn',
    'addVoterBtn',
    'startVotingBtn', 
    'endVotingBtn'
  ];
  
  adminButtons.forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    }
  });
}

/* Disable everything on page load */
disableAdminActions();

/* =======================
   CONNECT WALLET + VERIFY
======================= */
document.getElementById("connectWalletBtn").addEventListener("click", async () => {
  try {
    const account = await connectWallet();
    if (!account) return;

    const readContract = getReadContract();
    const owner = await readContract.owner();

    if (account.toLowerCase() !== owner.toLowerCase()) {
      alert("❌ You are not the Admin (contract owner)");
      disableAdminActions();
      adminVerified = false;
      
      // Update button text
      document.getElementById("connectWalletBtn").innerHTML = `
        <span class="material-icons-round text-lg">account_balance_wallet</span>
        Not Admin
      `;
      return;
    }

    // ADMIN VERIFIED
    contract = getContract();
    adminVerified = true;
    enableAdminActions();

    // Update button to show connected
    const shortAddress = account.slice(0, 6) + "..." + account.slice(-4);
    document.getElementById("connectWalletBtn").innerHTML = `
      <span class="material-icons-round text-lg">check_circle</span>
      ${shortAddress}
    `;

    alert("✅ Admin wallet verified:\n" + account);

    // Load existing data
    await loadCandidates();
    await loadVoters();
    await loadStats();

  } catch (err) {
    console.error(err);
    alert("Error connecting wallet: " + err.message);
  }
});

/* =======================
   ADD CANDIDATE
======================= */
document.getElementById("addCandidateBtn").addEventListener("click", async () => {
  if (!adminVerified) {
    alert("❌ Please connect admin wallet first");
    return;
  }

  const name = document.getElementById("candidateName").value;
  const party = document.getElementById("candidateParty").value;
  const imageUrl = document.getElementById("candidateImage")?.value || "https://via.placeholder.com/150";

  if (!name || !party) {
    alert("⚠️ Please fill in candidate name and party");
    return;
  }

  try {
    // Show loading state
    const btn = document.getElementById("addCandidateBtn");
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span class="material-symbols-outlined text-lg animate-spin">progress_activity</span> Adding...';
    btn.disabled = true;

    const tx = await contract.addCandidate(name, party, imageUrl);
    await tx.wait();

    alert("✅ Candidate added successfully!");
    
    // Clear form
    document.getElementById("candidateName").value = "";
    document.getElementById("candidateParty").value = "";
    if (document.getElementById("candidateImage")) {
      document.getElementById("candidateImage").value = "";
    }

    // Reload candidates list
    await loadCandidates();

    // Restore button
    btn.innerHTML = originalHTML;
    btn.disabled = false;

  } catch (err) {
    console.error(err);
    alert("❌ Error adding candidate: " + err.message);
    
    // Restore button
    const btn = document.getElementById("addCandidateBtn");
    btn.innerHTML = '<span class="material-symbols-outlined text-lg">add</span> ADD CANDIDATE';
    btn.disabled = false;
  }
});

/* =======================
   ADD VOTER
======================= */
document.getElementById("addVoterBtn").addEventListener("click", async () => {
  if (!adminVerified) {
    alert("❌ Please connect admin wallet first");
    return;
  }

  const voterAddress = document.getElementById("voterAddress").value;
  
  if (!voterAddress) {
    alert("⚠️ Please enter voter wallet address");
    return;
  }

  // Basic validation for Ethereum address
  if (!voterAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    alert("⚠️ Invalid Ethereum address format");
    return;
  }

  try {
    // Show loading state
    const btn = document.getElementById("addVoterBtn");
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span class="material-icons text-lg animate-spin">progress_activity</span> Adding...';
    btn.disabled = true;

    const tx = await contract.addVoter(voterAddress);
    await tx.wait();

    alert("✅ Voter added successfully!");
    
    // Clear input
    document.getElementById("voterAddress").value = "";

    // Reload voters list
    await loadVoters();

    // Restore button
    btn.innerHTML = originalHTML;
    btn.disabled = false;

  } catch (err) {
    console.error(err);
    alert("❌ Error adding voter: " + err.message);
    
    // Restore button
    const btn = document.getElementById("addVoterBtn");
    btn.innerHTML = '<span class="material-icons text-lg">add</span> ADD VOTER';
    btn.disabled = false;
  }
});

/* =======================
   START VOTING
======================= */
document.getElementById("startVotingBtn").addEventListener("click", async () => {
  if (!adminVerified) {
    alert("❌ Please connect admin wallet first");
    return;
  }

  if (!confirm("⚠️ Are you sure you want to START the voting session?")) {
    return;
  }

  try {
    // Show loading state
    const btn = document.getElementById("startVotingBtn");
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span class="material-icons-round text-lg animate-spin">progress_activity</span> Starting...';
    btn.disabled = true;

    const tx = await contract.startVoting();
    await tx.wait();

    alert("✅ Voting session started successfully!");

    // Update stats
    await loadStats();

    // Restore button
    btn.innerHTML = originalHTML;
    btn.disabled = false;

  } catch (err) {
    console.error(err);
    alert("❌ Error starting voting: " + err.message);
    
    // Restore button
    const btn = document.getElementById("startVotingBtn");
    btn.innerHTML = '<span class="material-icons-round text-lg">play_arrow</span> Start Voting Session';
    btn.disabled = false;
  }
});

/* =======================
   END VOTING
======================= */
document.getElementById("endVotingBtn").addEventListener("click", async () => {
  if (!adminVerified) {
    alert("❌ Please connect admin wallet first");
    return;
  }

  if (!confirm("⚠️ Are you sure you want to END the voting session? This action cannot be undone!")) {
    return;
  }

  try {
    // Show loading state
    const btn = document.getElementById("endVotingBtn");
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span class="material-icons-round text-lg animate-spin">progress_activity</span> Ending...';
    btn.disabled = true;

    const tx = await contract.endVoting();
    await tx.wait();

    alert("✅ Voting session ended successfully!");

    // Update stats
    await loadStats();

    // Restore button
    btn.innerHTML = originalHTML;
    btn.disabled = false;

  } catch (err) {
    console.error(err);
    alert("❌ Error ending voting: " + err.message);
    
    // Restore button
    const btn = document.getElementById("endVotingBtn");
    btn.innerHTML = '<span class="material-icons-round text-lg">stop</span> End Voting Session';
    btn.disabled = false;
  }
});

/* =======================
   LOAD CANDIDATES FROM BLOCKCHAIN
======================= */
async function loadCandidates() {
  try {
    const readContract = getReadContract();
    const candidates = await readContract.getCandidates();
    
    console.log("Raw candidates from blockchain:", candidates);
    console.log("Candidate count:", candidates.length);
    
    const candidatesList = document.getElementById("candidatesList");
    if (!candidatesList) return;

    // Filter out deleted candidates and extract data
    const validCandidates = candidates.filter(candidate => {
      // Candidate is an array: [id, name, party, imageUrl, voteCount]
      const id = candidate[0];
      // Check if ID is not 0 (deleted candidates have ID 0)
      return id && id.toString() !== "0";
    }).map(candidate => {
      // Extract data from array indices
      return {
        id: candidate[0].toString(),
        name: candidate[1],
        party: candidate[2],
        imageUrl: candidate[3] || "https://via.placeholder.com/150",
        voteCount: candidate[4].toString()
      };
    });

    console.log("Valid candidates after filtering:", validCandidates);

    // Update candidate count with valid candidates only
    const candidateCountEl = document.getElementById("candidateCount");
    if (candidateCountEl) {
      candidateCountEl.textContent = validCandidates.length.toString();
    }

    if (validCandidates.length === 0) {
      candidatesList.innerHTML = `
        <div class="text-center py-8 text-slate-500">
          No candidates added yet
        </div>
      `;
      return;
    }

    // Generate HTML for valid candidates
    candidatesList.innerHTML = validCandidates.map(candidate => {
      console.log(`Displaying candidate - ID: ${candidate.id}, Name: ${candidate.name}, Party: ${candidate.party}`);
      
      return `
        <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-border-dark group hover:border-primary/50 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-border-dark group-hover:border-primary/30 transition-colors flex-shrink-0">
              <img alt="${candidate.name}" class="w-full h-full object-cover" src="${candidate.imageUrl}" onerror="this.src='https://via.placeholder.com/150'"/>
            </div>
            <div class="flex flex-col min-w-0">
              <span class="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">${candidate.name}</span>
              <span class="text-xs text-primary font-medium">${candidate.party}</span>
            </div>
          </div>
          <button onclick="handleRemoveCandidate(${candidate.id})" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0">
            <span class="material-symbols-outlined text-xl">delete</span>
          </button>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error("Error loading candidates:", err);
    console.error("Error details:", err.message);
    const candidatesList = document.getElementById("candidatesList");
    if (candidatesList) {
      candidatesList.innerHTML = `
        <div class="text-center py-8 text-red-500">
          Error loading candidates: ${err.message}
        </div>
      `;
    }
  }
}

/* =======================
   REMOVE CANDIDATE
======================= */
async function handleRemoveCandidate(candidateId) {
  console.log("=== Remove Candidate Debug ===");
  console.log("Admin verified:", adminVerified);
  console.log("Contract instance:", contract);
  console.log("Candidate ID to remove:", candidateId);
  
  if (!adminVerified) {
    alert("❌ Please connect admin wallet first");
    return;
  }

  if (!confirm("⚠️ Are you sure you want to remove this candidate?")) {
    return;
  }

  try {
    // Ensure we have a contract instance
    if (!contract) {
      console.log("Contract not found, getting new instance...");
      contract = getContract();
    }
    
    console.log("Contract functions available:", Object.keys(contract.functions || contract));
    
    // Check if removeCandidate function exists
    if (!contract.removeCandidate) {
      throw new Error("removeCandidate function not found in contract. Please check your contract ABI includes this function.");
    }
    
    console.log("Calling removeCandidate with ID:", candidateId);
    const tx = await contract.removeCandidate(candidateId);
    console.log("Transaction sent:", tx.hash);
    
    // Show loading alert
    alert("⏳ Transaction submitted! Hash: " + tx.hash.substring(0, 10) + "...\nWaiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);
    
    alert("✅ Candidate removed successfully!");
    await loadCandidates();
    await loadStats();
  } catch (err) {
    console.error("=== Remove Candidate Error ===");
    console.error("Full error:", err);
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error reason:", err.reason);
    console.error("Error code:", err.code);
    
    let errorMessage = "Transaction failed";
    
    if (err.message) {
      if (err.message.includes("user rejected")) {
        errorMessage = "Transaction was rejected";
      } else if (err.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas";
      } else if (err.message.includes("not found")) {
        errorMessage = "Function not found in contract. Check contract ABI.";
      } else {
        errorMessage = err.message;
      }
    }
    
    alert("❌ Error removing candidate: " + errorMessage);
  }
}

// Make the function available globally
window.handleRemoveCandidate = handleRemoveCandidate;

/* =======================
   LOAD VOTERS FROM BLOCKCHAIN (UPDATED WITH DISPLAY)
======================= */
async function loadVoters() {
  try {
    const readContract = getReadContract();
    
    // Check if getVoters function exists
    if (typeof readContract.getVoters !== 'function') {
      console.warn("⚠️ getVoters() not found. Using count only. Deploy updated contract to see voter list.");
      const totalVoters = await readContract.totalVoters();
      updateVoterCount(totalVoters);
      return;
    }
    
    // Get all voter addresses
    const voterAddresses = await readContract.getVoters();
    console.log("✅ Loaded voter addresses:", voterAddresses);
    
    const votersList = document.getElementById("votersList");
    if (!votersList) return;
    
    // Update count
    updateVoterCount(voterAddresses.length);
    
    if (voterAddresses.length === 0) {
      votersList.innerHTML = `
        <div class="text-center py-12 text-slate-400">
          <span class="material-icons text-5xl mb-4">how_to_reg</span>
          <p class="text-sm">No voters registered yet</p>
          <p class="text-xs mt-2 text-slate-500">Add voter addresses using the form</p>
        </div>
      `;
      return;
    }
    
    // Load voter details
    const voterDetails = await Promise.all(
      voterAddresses.map(async (address) => {
        const details = await readContract.getVoterDetails(address);
        return {
          address,
          isRegistered: details.isRegistered || details[0],
          hasVoted: details.hasVoted || details[1]
        };
      })
    );
    
    console.log("✅ Voter details:", voterDetails);
    
    // Display voters
    votersList.innerHTML = voterDetails.map(voter => {
      const shortAddress = voter.address.slice(0, 6) + "..." + voter.address.slice(-4);
      const status = voter.hasVoted ? "Voted" : "Verified";
      const statusColor = voter.hasVoted ? "text-blue-500" : "text-primary";
      const dotColor = voter.hasVoted ? "bg-blue-500" : "bg-primary";
      
      return `
        <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-border-dark group hover:border-primary/50 transition-colors">
          <div class="flex flex-col">
            <span class="font-mono text-sm text-slate-700 dark:text-slate-300">${shortAddress}</span>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="w-2 h-2 rounded-full ${dotColor}"></span>
              <span class="text-[10px] ${statusColor} uppercase font-bold tracking-tighter">${status}</span>
            </div>
          </div>
          <button onclick="handleRemoveVoter('${voter.address}')" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
            <span class="material-icons text-xl">delete_outline</span>
          </button>
        </div>
      `;
    }).join('');
    
  } catch (err) {
    console.error("❌ Error loading voters:", err);
    const votersList = document.getElementById("votersList");
    if (votersList) {
      votersList.innerHTML = `
        <div class="text-center py-12 text-slate-400">
          <span class="material-icons text-5xl mb-4 text-red-500">error_outline</span>
          <p class="text-sm text-red-500">Error loading voters</p>
          <p class="text-xs mt-2 text-slate-500">Check console for details</p>
        </div>
      `;
    }
  }
}

// Helper function
function updateVoterCount(count) {
  const voterCountEl = document.getElementById("voterCount");
  if (voterCountEl) voterCountEl.textContent = count.toString();
  
  const voterCountDisplayEl = document.getElementById("voterCountDisplay");
  if (voterCountDisplayEl) voterCountDisplayEl.textContent = count.toString();
  
  console.log("Voters updated:", count.toString());
}

/* =======================
   REMOVE VOTER
======================= */
async function handleRemoveVoter(voterAddress) {
  if (!adminVerified) {
    alert("❌ Please connect admin wallet first");
    return;
  }

  const shortAddr = voterAddress.slice(0,6) + "..." + voterAddress.slice(-4);
  if (!confirm(`⚠️ Are you sure you want to remove voter ${shortAddr}?`)) {
    return;
  }

  try {
    if (!contract) contract = getContract();
    
    console.log("Removing voter:", voterAddress);
    const tx = await contract.removeVoter(voterAddress);
    console.log("Transaction sent:", tx.hash);
    
    alert("⏳ Transaction submitted! Waiting for confirmation...");
    
    await tx.wait();
    console.log("✅ Transaction confirmed");
    
    alert("✅ Voter removed successfully!");
    
    await loadVoters();
    await loadStats();
  } catch (err) {
    console.error("❌ Error removing voter:", err);
    alert("❌ Error removing voter: " + (err.message || "Transaction failed"));
  }
}

// Make globally available
window.handleRemoveVoter = handleRemoveVoter;

/* =======================
   LOAD STATS FROM BLOCKCHAIN
======================= */
async function loadStats() {
  try {
    const readContract = getReadContract();
    
    // Get actual valid candidates (not just the counter)
    const allCandidates = await readContract.getCandidates();
    // Filter out deleted candidates (ID = 0)
    const validCandidates = allCandidates.filter(c => c[0] && c[0].toString() !== "0");
    const actualCandidateCount = validCandidates.length;
    
    const totalVoters = await readContract.totalVoters();
    const totalVotes = await readContract.totalVotes();
    const votingActive = await readContract.votingActive();

    // Update stats cards with ACTUAL counts
    const candidateCountEl = document.getElementById("totalCandidates");
    if (candidateCountEl) candidateCountEl.textContent = actualCandidateCount.toString();

    const voterCountEl = document.getElementById("totalVoters");
    if (voterCountEl) voterCountEl.textContent = totalVoters.toString();

    const voteCountEl = document.getElementById("totalVotes");
    if (voteCountEl) voteCountEl.textContent = totalVotes.toString();

    // Update election status
    const statusEl = document.getElementById("electionStatus");
    if (statusEl) {
      statusEl.textContent = votingActive ? "Live Phase" : "Not Started";
      statusEl.className = votingActive ? 
        "text-3xl font-bold text-primary" : 
        "text-3xl font-bold text-slate-400";
    }

    console.log("Stats updated:", {
      candidates: actualCandidateCount.toString() + " (valid out of " + allCandidates.length + " total)",
      voters: totalVoters.toString(),
      votes: totalVotes.toString(),
      active: votingActive
    });

  } catch (err) {
    console.error("Error loading stats:", err);
  }
}

// Export functions for use in HTML
window.openCandidatePopup = function() {
  document.getElementById("candidatePopup").classList.remove("hidden");
  document.getElementById("candidatePopup").classList.add("flex");
};

window.closeCandidatePopup = function() {
  document.getElementById("candidatePopup").classList.add("hidden");
  document.getElementById("candidatePopup").classList.remove("flex");
};

window.openVoterPopup = function() {
  document.getElementById("voterPopup").classList.remove("hidden");
  document.getElementById("voterPopup").classList.add("flex");
};

window.closeVoterPopup = function() {
  document.getElementById("voterPopup").classList.add("hidden");
  document.getElementById("voterPopup").classList.remove("flex");
};