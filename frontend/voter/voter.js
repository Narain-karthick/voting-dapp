import { connectWallet } from "../common/wallet.js";
import { getContract, getReadContract } from "../common/contract.js";

/* ===============================
   GLOBAL STATE
=============================== */
let contract;
let readContract;
let connectedAccount;
let voterStatus = {
  isRegistered: false,
  hasVoted: false,
  votingActive: false
};

/* ===============================
   PAGE INITIALIZATION
=============================== */
window.addEventListener('DOMContentLoaded', () => {
  console.log("🗳️ Voter Dashboard Initializing...");
  
  // Disable voting initially
  disableAllVoting("Please connect your wallet to begin");
  
  // Set up event listeners
  setupEventListeners();
  
  console.log("✅ Voter Dashboard Initialized");
});

/* ===============================
   EVENT LISTENERS
=============================== */
function setupEventListeners() {
  const connectBtn = document.getElementById('connectWalletBtn');
  if (connectBtn) {
    connectBtn.addEventListener('click', handleWalletConnect);
    console.log("✅ Connect button listener attached");
  } else {
    console.warn("⚠️ Connect wallet button not found");
  }
}

/* ===============================
   WALLET CONNECTION
=============================== */
async function handleWalletConnect() {
  try {
    console.log("🔗 Connecting wallet...");
    
    // Show connecting state
    showToast("Connecting wallet...", "info");
    
    // Connect wallet using existing function
    const account = await connectWallet();
    if (!account) {
      console.error("❌ No account returned from wallet connection");
      showToast("Failed to connect wallet", "error");
      return;
    }
    
    connectedAccount = account;
    console.log("✅ Wallet connected:", account);
    
    // Update UI to show connected wallet
    updateWalletButton(account);
    
    // Initialize contracts
    contract = getContract();
    readContract = getReadContract();
    
    // Verify voter eligibility
    await verifyVoter(account);
    
  } catch (err) {
    console.error("❌ Wallet connection error:", err);
    
    if (err.message?.includes("User rejected")) {
      showToast("Wallet connection rejected", "warning");
    } else if (err.message?.includes("No provider")) {
      showToast("Please install MetaMask to continue", "error");
    } else {
      showToast("Failed to connect wallet: " + err.message, "error");
    }
  }
}

/* ===============================
   UPDATE WALLET BUTTON
=============================== */
function updateWalletButton(account) {
  const btn = document.getElementById('connectWalletBtn');
  if (!btn) {
    console.warn("⚠️ Connect wallet button not found for update");
    return;
  }
  
  const shortAddress = account.slice(0, 6) + "..." + account.slice(-4);
  
  btn.innerHTML = `
    <span class="material-symbols-outlined text-xl">check_circle</span>
    <span>${shortAddress}</span>
  `;
  
  btn.classList.remove('bg-primary', 'hover:bg-primary/90');
  btn.classList.add('bg-green-600', 'hover:bg-green-700');
}

/* ===============================
   VERIFY VOTER ELIGIBILITY
=============================== */
async function verifyVoter(account) {
  try {
    console.log("🔐 Verifying voter eligibility...");
    showToast("Verifying voter status...", "info");
    
    // Check voting status
    const votingActive = await readContract.votingActive();
    voterStatus.votingActive = votingActive;
    
    console.log("📊 Voting active status:", votingActive);
    
    // Check voter registration
    const voterData = await readContract.voters(account);
    voterStatus.isRegistered = voterData.isRegistered || voterData[0];
    voterStatus.hasVoted = voterData.hasVoted || voterData[1];
    
    console.log("📊 Voter status:", voterStatus);
    
    // Update stats display
    updateVotingStatusUI(votingActive);
    updateYourVoteStatusUI(voterStatus.hasVoted);
    
    // Handle different voter states
    if (!votingActive) {
      disableAllVoting("Voting Not Active");
      showToast("🔒 Voting session has not started yet", "warning");
      return;
    }
    
    if (!voterStatus.isRegistered) {
      disableAllVoting("Not Authorized");
      showToast("❌ You are not registered to vote. Contact administrator.", "error");
      return;
    }
    
    if (voterStatus.hasVoted) {
      showToast("✅ You have already voted in this election", "success");
      await loadCandidatesReadOnly(); // Show candidates but disable voting
      disableAllVoting("Already Voted");
      return;
    }
    
    // Voter is eligible!
    console.log("✅ Voter is eligible to vote");
    showToast("✅ You are eligible to vote! Choose your candidate below.", "success");
    await loadCandidates(); // Load candidates with voting enabled
    
  } catch (err) {
    console.error("❌ Voter verification error:", err);
    disableAllVoting("Error");
    showToast("Failed to verify voter status: " + err.message, "error");
  }
}

/* ===============================
   LOAD CANDIDATES (WITH VOTING)
=============================== */
async function loadCandidates() {
  try {
    console.log("📊 Loading candidates for voting...");
    
    const candidates = await readContract.getCandidates();
    console.log("Raw candidates data:", candidates);
    
    if (!candidates || candidates.length === 0) {
      showToast("No candidates registered yet", "warning");
      return;
    }
    
    // Filter out deleted candidates (ID = 0)
    const validCandidates = candidates.filter(c => {
      const id = c[0] || c.id;
      return id && id.toString() !== "0";
    }).map(c => ({
      id: (c[0] || c.id).toString(),
      name: c[1] || c.name,
      party: c[2] || c.party,
      voteCount: (c[4] || c.voteCount || 0).toString()
    }));
    
    console.log("✅ Valid candidates:", validCandidates);
    
    if (validCandidates.length === 0) {
      showToast("No active candidates available", "warning");
      return;
    }
    
    // Update candidate count
    safeSetText('candidatesCount', validCandidates.length);
    
    // Render candidates
    renderCandidates(validCandidates, true); // true = voting enabled
    
  } catch (err) {
    console.error("❌ Error loading candidates:", err);
    showToast("Failed to load candidates: " + err.message, "error");
  }
}

/* ===============================
   LOAD CANDIDATES (READ-ONLY)
=============================== */
async function loadCandidatesReadOnly() {
  try {
    console.log("📊 Loading candidates (read-only mode)...");
    
    const candidates = await readContract.getCandidates();
    
    if (!candidates || candidates.length === 0) {
      showToast("No candidates registered", "warning");
      return;
    }
    
    // Filter and map candidates
    const validCandidates = candidates.filter(c => {
      const id = c[0] || c.id;
      return id && id.toString() !== "0";
    }).map(c => ({
      id: (c[0] || c.id).toString(),
      name: c[1] || c.name,
      party: c[2] || c.party,
      voteCount: (c[4] || c.voteCount || 0).toString()
    }));
    
    console.log("✅ Valid candidates (read-only):", validCandidates);
    
    // Update candidate count
    safeSetText('candidatesCount', validCandidates.length);
    
    // Render candidates without voting buttons
    renderCandidates(validCandidates, false); // false = voting disabled
    
  } catch (err) {
    console.error("❌ Error loading candidates:", err);
  }
}

/* ===============================
   RENDER CANDIDATES
=============================== */
function renderCandidates(candidates, votingEnabled) {
  const container = document.getElementById('candidateList');
  if (!container) {
    console.error("❌ Candidate container (#candidateList) not found");
    return;
  }
  
  // Clear existing dummy cards
  container.innerHTML = '';
  
  // Render each candidate
  candidates.forEach(candidate => {
    const card = createCandidateCard(candidate, votingEnabled);
    container.appendChild(card);
  });
  
  console.log(`✅ Rendered ${candidates.length} candidates (voting ${votingEnabled ? 'enabled' : 'disabled'})`);
}

/* ===============================
   CREATE CANDIDATE CARD
=============================== */
function createCandidateCard(candidate, votingEnabled) {
  const card = document.createElement('div');
  card.className = 'candidate-card glass-panel rounded-2xl p-5 transition-all flex flex-col';
  
  // Get first letter for avatar
  const initial = candidate.name.charAt(0).toUpperCase();
  
  // Generate party color based on party name
  const partyColors = {
    'Progressive': 'blue',
    'Conservative': 'red', 
    'Libertarian': 'yellow',
    'Green': 'green',
    'Independent': 'purple',
    'Unity': 'cyan',
    'Tech': 'indigo',
    'Digital': 'pink'
  };
  
  // Find color based on party keywords
  let partyColor = 'slate';
  for (const [keyword, color] of Object.entries(partyColors)) {
    if (candidate.party.includes(keyword)) {
      partyColor = color;
      break;
    }
  }
  
  card.innerHTML = `
    <!-- Avatar with Initial (NO IMAGE) -->
    <div class="h-48 rounded-xl bg-gradient-to-br from-${partyColor}-500 to-${partyColor}-700 mb-4 flex items-center justify-center">
      <span class="text-8xl font-bold text-white">${initial}</span>
    </div>
    
    <div class="flex-1">
      <!-- Candidate Info -->
      <div class="flex justify-between items-start mb-2">
        <h4 class="text-lg font-bold">${candidate.name}</h4>
        <span class="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
          ID: #${candidate.id}
        </span>
      </div>
      
      <!-- Party -->
      <div class="flex items-center gap-2 mb-4">
        <span class="w-2 h-2 rounded-full bg-${partyColor}-500"></span>
        <span class="text-sm text-slate-300 font-medium">${candidate.party}</span>
      </div>
      
      <!-- Vote Count -->
      <div class="flex items-center justify-between text-sm text-slate-400 mb-4 p-3 bg-slate-900/50 rounded-lg">
        <span>Current Votes:</span>
        <span class="font-bold text-primary">${candidate.voteCount}</span>
      </div>
    </div>
    
    <!-- Vote Button -->
    ${votingEnabled 
      ? `<button 
          onclick="handleVote(${candidate.id}, '${candidate.name}')" 
          class="vote-btn w-full py-3 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-background-dark text-primary font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          id="voteBtn_${candidate.id}">
          <span class="material-symbols-outlined">how_to_vote</span>
          <span>Vote Now</span>
        </button>`
      : `<button 
          class="w-full py-3 bg-slate-800 border border-slate-700 text-slate-500 font-bold rounded-xl cursor-not-allowed"
          disabled>
          Voting Disabled
        </button>`
    }
  `;
  
  return card;
}

/* ===============================
   HANDLE VOTE
=============================== */
async function handleVote(candidateId, candidateName) {
  try {
    console.log(`🗳️ Casting vote for candidate ID: ${candidateId}`);
    
    // Confirm vote
    if (!confirm(`Are you sure you want to vote for ${candidateName}?\n\nCandidate ID: #${candidateId}\n\n⚠️ This action cannot be undone!`)) {
      console.log("❌ Vote cancelled by user");
      return;
    }
    
    // Disable all vote buttons immediately
    disableAllVoteButtons();
    
    // Show loading state on clicked button
    const btn = document.getElementById(`voteBtn_${candidateId}`);
    if (btn) {
      btn.innerHTML = `
        <span class="material-symbols-outlined animate-spin">progress_activity</span>
        <span class="ml-2">Submitting...</span>
      `;
    }
    
    // Show loading toast
    showToast("⏳ Submitting your vote to blockchain...", "info");
    
    // Cast vote on blockchain
    const tx = await contract.castVote(candidateId);
    console.log("📝 Transaction sent:", tx.hash);
    
    const shortHash = tx.hash.substring(0, 10) + "...";
    showToast(`⏳ Vote submitted! TX: ${shortHash}\nWaiting for confirmation...`, "info");
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed:", receipt);
    
    // Update voter status
    voterStatus.hasVoted = true;
    
    // Show success
    showToast("🎉 Your vote has been successfully recorded on the blockchain!", "success");
    
    // Update UI
    updateYourVoteStatusUI(true);
    
    // Reload candidates in read-only mode
    await loadCandidatesReadOnly();
    
    // Keep buttons disabled
    disableAllVoting("Already Voted");
    
  } catch (err) {
    console.error("❌ Voting error:", err);
    
    // Re-enable buttons
    enableAllVoteButtons();
    
    // Handle specific errors
    if (err.message?.includes("user rejected") || err.message?.includes("User denied")) {
      showToast("❌ Transaction was rejected", "warning");
    } else if (err.message?.includes("Already voted") || err.message?.includes("already voted")) {
      showToast("❌ You have already voted in this election", "error");
      voterStatus.hasVoted = true;
      await loadCandidatesReadOnly();
      disableAllVoting("Already Voted");
    } else if (err.message?.includes("Not registered") || err.message?.includes("not registered")) {
      showToast("❌ You are not registered to vote", "error");
      disableAllVoting("Not Authorized");
    } else if (err.message?.includes("not active") || err.message?.includes("Voting is not active")) {
      showToast("❌ Voting session is not currently active", "error");
      disableAllVoting("Voting Inactive");
    } else {
      showToast("❌ Failed to cast vote: " + err.message, "error");
    }
  }
}

// Make handleVote globally available
window.handleVote = handleVote;

/* ===============================
   DISABLE ALL VOTING
=============================== */
function disableAllVoting(message) {
  const allButtons = document.querySelectorAll('.vote-btn');
  allButtons.forEach(btn => {
    btn.disabled = true;
    btn.classList.remove('hover:bg-primary', 'hover:text-background-dark');
    btn.classList.add('cursor-not-allowed', 'opacity-50');
    btn.innerHTML = message || 'Voting Disabled';
  });
}

/* ===============================
   DISABLE ALL VOTE BUTTONS
=============================== */
function disableAllVoteButtons() {
  const allButtons = document.querySelectorAll('.vote-btn');
  allButtons.forEach(btn => {
    btn.disabled = true;
    btn.classList.add('cursor-not-allowed', 'opacity-50');
  });
  console.log("🔒 All vote buttons disabled");
}

/* ===============================
   ENABLE ALL VOTE BUTTONS
=============================== */
function enableAllVoteButtons() {
  const allButtons = document.querySelectorAll('.vote-btn');
  allButtons.forEach(btn => {
    btn.disabled = false;
    btn.classList.remove('cursor-not-allowed', 'opacity-50');
    btn.innerHTML = `
      <span class="material-symbols-outlined">how_to_vote</span>
      <span>Vote Now</span>
    `;
  });
  console.log("🔓 All vote buttons enabled");
}

/* ===============================
   SAFE SET TEXT (NO CRASH)
=============================== */
function safeSetText(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = value;
  } else {
    console.warn(`⚠️ Element #${elementId} not found for text update`);
  }
}

function safeSetHTML(elementId, html) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = html;
  } else {
    console.warn(`⚠️ Element #${elementId} not found for HTML update`);
  }
}

/* ===============================
   UPDATE UI COMPONENTS SAFELY
=============================== */
function updateVotingStatusUI(votingActive) {
  // Update status text
  safeSetText('votingStatusText', votingActive ? 'Live' : 'Inactive');
  
  // Update status badge
  const badge = document.querySelector('.voting-status-badge');
  if (badge) {
    badge.className = votingActive 
      ? 'voting-status-badge text-primary text-sm font-bold mb-1 flex items-center'
      : 'voting-status-badge text-slate-500 text-sm font-bold mb-1 flex items-center';
    
    badge.innerHTML = `
      <span class="w-2 h-2 rounded-full ${votingActive ? 'bg-primary animate-pulse' : 'bg-slate-500'} mr-2"></span>
      ${votingActive ? 'Active Now' : 'Not Active'}
    `;
  }
  
  console.log(`📊 Voting status UI updated: ${votingActive ? 'Active' : 'Inactive'}`);
}

function updateYourVoteStatusUI(hasVoted) {
  // Update vote status text
  safeSetText('yourVoteStatusText', hasVoted ? 'Voted' : 'Not Voted');
  
  // Update color
  const statusElement = document.getElementById('yourVoteStatusText');
  if (statusElement) {
    statusElement.className = hasVoted 
      ? 'text-3xl font-bold text-primary'
      : 'text-3xl font-bold text-slate-500';
  }
  
  console.log(`📊 Your vote status UI updated: ${hasVoted ? 'Voted' : 'Not Voted'}`);
}

/* ===============================
   TOAST NOTIFICATION SYSTEM
=============================== */
function showToast(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `
    glass-panel p-4 rounded-xl shadow-2xl min-w-[300px] max-w-[400px]
    border-l-4 
    ${type === 'success' ? 'border-green-500' : ''}
    ${type === 'error' ? 'border-red-500' : ''}
    ${type === 'warning' ? 'border-yellow-500' : ''}
    ${type === 'info' ? 'border-primary' : ''}
    animate-slide-in
  `;
  
  const icon = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  }[type] || 'info';
  
  const iconColor = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-primary'
  }[type] || 'text-primary';
  
  toast.innerHTML = `
    <div class="flex items-start gap-3">
      <span class="material-symbols-outlined ${iconColor}">${icon}</span>
      <p class="text-sm flex-1">${message}</p>
      <button onclick="this.parentElement.parentElement.remove()" class="text-slate-400 hover:text-white">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 5000);
}

/* ===============================
   ADD ANIMATION STYLES
=============================== */
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-in {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
`;
document.head.appendChild(style);

/* ===============================
   CONSOLE WELCOME MESSAGE
=============================== */
console.log(`
╔════════════════════════════════════════╗
║   🗳️  BLOCKCHAIN VOTING SYSTEM        ║
║   Voter Dashboard - v2.0              ║
║   Production Ready                    ║
╚════════════════════════════════════════╝

📌 Features:
✅ Safe DOM manipulation (no crashes)
✅ All dummy data removed
✅ No candidate images (initials only)
✅ Full blockchain integration
✅ Toast notifications
✅ Error handling

🚀 Ready to vote!
`);