// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VotingSystem {

    address public owner;
    bool public votingActive;

    uint public votingStart;
    uint public votingEnd;

    uint public totalCandidates;
    uint public totalVoters;
    uint public totalVotes;

    // NEW: Array to store voter addresses
    address[] public voterAddresses;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only admin allowed");
        _;
    }

    modifier votingOpen() {
        require(votingActive, "Voting is not active");
        _;
    }

    modifier voterRegistered() {
        require(voters[msg.sender].isRegistered, "Not registered");
        _;
    }

    modifier notVoted() {
        require(!voters[msg.sender].hasVoted, "Already voted");
        _;
    }

    modifier candidateExists(uint _id) {
        require(candidates[_id].id != 0, "Candidate not found");
        _;
    }

    struct Candidate {
        uint id;
        string name;
        string party;
        string imageUrl;
        uint voteCount;
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
    }

    mapping(uint => Candidate) public candidates;
    mapping(address => Voter) public voters;

    event CandidateAdded(uint id, string name);
    event CandidateRemoved(uint id);
    event VoterAdded(address voter);
    event VoterRemoved(address voter);
    event VotingStarted(uint time);
    event VotingEnded(uint time);
    event VoteCast(address voter, uint candidateId);

    // ================= ADMIN =================

    function addCandidate(
        string memory _name,
        string memory _party,
        string memory _imageUrl
    ) external onlyOwner {
        totalCandidates++;
        candidates[totalCandidates] = Candidate(
            totalCandidates,
            _name,
            _party,
            _imageUrl,
            0
        );
        emit CandidateAdded(totalCandidates, _name);
    }

    function removeCandidate(uint _id) external onlyOwner candidateExists(_id) {
        delete candidates[_id];
        emit CandidateRemoved(_id);
    }

    // UPDATED: Now stores address in array
    function addVoter(address _voter) external onlyOwner {
        require(!voters[_voter].isRegistered, "Voter already registered");
        voters[_voter].isRegistered = true;
        voterAddresses.push(_voter); // NEW: Store address in array
        totalVoters++;
        emit VoterAdded(_voter);
    }

    // UPDATED: Removes from array too
    function removeVoter(address _voter) external onlyOwner {
        require(voters[_voter].isRegistered, "Voter not registered");
        delete voters[_voter];
        
        // NEW: Remove from array
        for (uint i = 0; i < voterAddresses.length; i++) {
            if (voterAddresses[i] == _voter) {
                voterAddresses[i] = voterAddresses[voterAddresses.length - 1];
                voterAddresses.pop();
                break;
            }
        }
        
        totalVoters--;
        emit VoterRemoved(_voter);
    }

    function startVoting() external onlyOwner {
        votingActive = true;
        votingStart = block.timestamp;
        emit VotingStarted(votingStart);
    }

    function endVoting() external onlyOwner {
        votingActive = false;
        votingEnd = block.timestamp;
        emit VotingEnded(votingEnd);
    }

    // ================= VOTER =================

    function castVote(uint _candidateId)
        external
        votingOpen
        voterRegistered
        notVoted
        candidateExists(_candidateId)
    {
        candidates[_candidateId].voteCount++;
        voters[msg.sender].hasVoted = true;
        totalVotes++;
        emit VoteCast(msg.sender, _candidateId);
    }

    // ================= VIEW =================

    function checkEligibility(address _voter) external view returns (bool) {
        return voters[_voter].isRegistered && !voters[_voter].hasVoted;
    }

    function getCandidates() external view returns (Candidate[] memory) {
        Candidate[] memory list = new Candidate[](totalCandidates);
        uint index;
        for (uint i = 1; i <= totalCandidates; i++) {
            if (candidates[i].id != 0) {
                list[index++] = candidates[i];
            }
        }
        return list;
    }

    // NEW: Function to get all voter addresses
    function getVoters() external view returns (address[] memory) {
        return voterAddresses;
    }

    // NEW: Function to get voter details
    function getVoterDetails(address _voter) external view returns (bool isRegistered, bool hasVoted) {
        return (voters[_voter].isRegistered, voters[_voter].hasVoted);
    }
}
