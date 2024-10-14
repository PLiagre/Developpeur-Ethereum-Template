// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    WorkflowStatus public currentStatus;
    uint public winningProposalId;
    Proposal[] public proposals;
    mapping(address => Voter) public voters;
    uint public constant MAX_PROPOSALS = 100;

    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted(address voter, uint proposalId);

    modifier onlyRegisteredVoter() {
        require(voters[msg.sender].isRegistered, "You're not registered to vote");
        _;
    }

    modifier inVotingSession() {
        require(currentStatus == WorkflowStatus.VotingSessionStarted, "Voting session is not started yet");
        _;
    }

    constructor() Ownable(msg.sender) {
        currentStatus = WorkflowStatus.RegisteringVoters;
    }

    // Enregistrer un électeur
    function registerVoter(address _voterAddress) external onlyOwner {
        require(currentStatus == WorkflowStatus.RegisteringVoters, "Voter registration is not allowed at this stage");
        require(!voters[_voterAddress].isRegistered, "Voter is already registered");

        voters[_voterAddress].isRegistered = true;

        emit VoterRegistered(_voterAddress);
    }

    // Démarrer l'enregistrement des propositions
    function startProposalsRegistration() external onlyOwner {
        require(currentStatus == WorkflowStatus.RegisteringVoters, "Voter registration phase must be completed");
        changeWorkflowStatus(WorkflowStatus.ProposalsRegistrationStarted);
    }

    // Enregistrer une proposition
    function registerProposal(string calldata _description) external onlyRegisteredVoter {
        require(currentStatus == WorkflowStatus.ProposalsRegistrationStarted, "Proposals registration is not allowed at this stage");
        require(proposals.length < MAX_PROPOSALS, "Maximum number of proposals reach");
        require(bytes(_description).length > 0, "Proposal description cannot be empty");

        for (uint i = 0; i < proposals.length; i++) {
            require(keccak256(bytes(proposals[i].description)) != keccak256(bytes(_description)), "Proposal already exists");
        }

        proposals.push(Proposal({
            description: _description,
            voteCount: 0
        }));

        emit ProposalRegistered(proposals.length - 1);
    }

    // Clore la session d'enregistrement
    function endProposalsRegistration() external onlyOwner {
        require(currentStatus == WorkflowStatus.ProposalsRegistrationStarted, "Proposals registration is not active.");
        changeWorkflowStatus(WorkflowStatus.ProposalsRegistrationEnded);
    }

    // Démarrer la session de vote
    function startVotingSession() external onlyOwner {
        require(currentStatus == WorkflowStatus.ProposalsRegistrationEnded, "Proposals registration must be ended.");
        changeWorkflowStatus(WorkflowStatus.VotingSessionStarted);
    }

    // Fonction de vote
    function vote(uint _proposalId) external onlyRegisteredVoter inVotingSession {
        Voter storage sender = voters[msg.sender];
        require(!sender.hasVoted, "You have already voted.");
        require(_proposalId < proposals.length, "Invalid proposal ID.");

        sender.hasVoted = true;
        sender.votedProposalId = _proposalId;

        proposals[_proposalId].voteCount++;

        emit Voted(msg.sender, _proposalId);
    }

    // Clore la session de vote
    function endVotingSession() external onlyOwner {
        require(currentStatus == WorkflowStatus.VotingSessionStarted, "Voting session must be started.");
        changeWorkflowStatus(WorkflowStatus.VotingSessionEnded);
    }

   // Comptabilisation des votes
    function countVotes() external onlyOwner {
        require(currentStatus == WorkflowStatus.VotingSessionEnded, "Voting session must be ended");

        uint winningVoteCount = 0;
        uint winningId = 0;
        bool hasSameVoteCount = false;

        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningId = i;
                hasSameVoteCount = false;
            } else if (proposals[i].voteCount == winningVoteCount && winningVoteCount != 0) {
                hasSameVoteCount = true;
            }
        }

        require(winningVoteCount > 0, "No votes have been cast");
        if (!hasSameVoteCount) {
            winningProposalId = winningId;
        } else {
            winningProposalId = winningId; // Choix du premier en cas d'égalité ?
        }

        changeWorkflowStatus(WorkflowStatus.VotesTallied);
    }


    // Obtenir les détails du winner
    function getWinner() external view returns (string memory winnerDescription, uint voteCount) {
        require(currentStatus == WorkflowStatus.VotesTallied, "Votes have not been tallied yet.");
        Proposal storage winningProposal = proposals[winningProposalId];
        return (winningProposal.description, winningProposal.voteCount);
    }

    // Changer le statut du vote
    function changeWorkflowStatus(WorkflowStatus _newStatus) private {
        emit WorkflowStatusChange(currentStatus, _newStatus);
        currentStatus = _newStatus;
    }

    // Obtenir les détails d'un vote
    function getVoter(address _voter) external view returns (bool isRegistered, bool hasVoted, uint votedProposalId) {
        Voter storage voter = voters[_voter];
        return (voter.isRegistered, voter.hasVoted, voter.votedProposalId);
    }

    // Obtenir les détails d'une proposition
    function getProposal(uint _proposalId) external view returns (string memory description, uint voteCount) {
        require(_proposalId < proposals.length, "Proposal ID does not exist.");
        Proposal storage proposal = proposals[_proposalId];
        return (proposal.description, proposal.voteCount);
    }

    // Obtenir le détail de toute les propositions
    function getAllProposals() external view returns (string[] memory descriptions, uint[] memory proposalId) {
        uint proposalCount = proposals.length;
        descriptions = new string[](proposalCount);
        proposalId = new uint[](proposalCount);

        for (uint i = 0; i < proposalCount; i++) {
            descriptions[i] = proposals[i].description;
            proposalId[i] = i;
        }
    }
}
