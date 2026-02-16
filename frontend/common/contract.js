import { CONTRACT_ADDRESS } from "./constants.js";

/* ================= COMPLETE ABI WITH NEW VOTER FUNCTIONS ================= */
export const abi = [
  // Read-only state variables
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingActive",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingStart",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingEnd",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalCandidates",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalVoters",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalVotes",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  // Mappings
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "candidates",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "party", "type": "string" },
      { "internalType": "string", "name": "imageUrl", "type": "string" },
      { "internalType": "uint256", "name": "voteCount", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "voters",
    "outputs": [
      { "internalType": "bool", "name": "isRegistered", "type": "bool" },
      { "internalType": "bool", "name": "hasVoted", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // View functions
  {
    "inputs": [{ "internalType": "address", "name": "_voter", "type": "address" }],
    "name": "checkEligibility",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCandidates",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "party", "type": "string" },
          { "internalType": "string", "name": "imageUrl", "type": "string" },
          { "internalType": "uint256", "name": "voteCount", "type": "uint256" }
        ],
        "internalType": "struct VotingSystem.Candidate[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // NEW: Voter array and getter functions
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "voterAddresses",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVoters",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_voter", "type": "address" }],
    "name": "getVoterDetails",
    "outputs": [
      { "internalType": "bool", "name": "isRegistered", "type": "bool" },
      { "internalType": "bool", "name": "hasVoted", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Admin write functions
  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_party", "type": "string" },
      { "internalType": "string", "name": "_imageUrl", "type": "string" }
    ],
    "name": "addCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }],
    "name": "removeCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_voter", "type": "address" }],
    "name": "addVoter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_voter", "type": "address" }],
    "name": "removeVoter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "startVoting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "endVoting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Voter write function
  {
    "inputs": [{ "internalType": "uint256", "name": "_candidateId", "type": "uint256" }],
    "name": "castVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" }
    ],
    "name": "CandidateAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "CandidateRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "address", "name": "voter", "type": "address" }
    ],
    "name": "VoterAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "address", "name": "voter", "type": "address" }
    ],
    "name": "VoterRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "time", "type": "uint256" }
    ],
    "name": "VotingStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "time", "type": "uint256" }
    ],
    "name": "VotingEnded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "address", "name": "voter", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "candidateId", "type": "uint256" }
    ],
    "name": "VoteCast",
    "type": "event"
  }
];

/* ================= CONTRACT HELPERS ================= */

// For ADMIN & VOTER TRANSACTIONS
export function getContract() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
}

// For READ-ONLY (OWNER CHECK)
export function getReadContract() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  return new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
}