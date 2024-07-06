// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;
import "@openzeppelin/contracts/access/Ownable.sol";
contract VotingPlus is Ownable {

    //Votants
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedProposalId;
    }

    //Whitelist
    mapping (address => Voter) whitelistVoters;

    //Propositions
    struct Proposal {
        string description;
        uint256 voteCount;
    }

    //Proposals
    Proposal[] public proposals;

    //Status
    enum WorkflowStatus {
        RegisteringVoters,  
        ProposalsRegistrationStarted, 
        ProposalsRegistrationEnded, 
        VotingSessionStarted,  
        VotingSessionEnded,   
        VotesTallied          
    }

    WorkflowStatus public workflowStatus; 
    
    //Evénements
    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint256 proposalId);
    event Voted (address voter, uint256 proposalId);

    //Gagnant
    uint256 private winningProposalId;

    //On intialise l'administrateur des votants au déploiement du contrat
    constructor() Ownable(msg.sender) {
            //Le workflowStatus est déjà initialisé à sa première valeur RegisteringVoters
    }

    modifier onlyRegisteredVotersCanVote() {
        require(whitelistVoters[msg.sender].isRegistered,"Vous n etes pas autorise a voter");
        _;
    }

    modifier workflowStateInProcess(WorkflowStatus statusInProcess) {
        require(workflowStatus == statusInProcess,"Le process ne peut pas etre relance dans cet etat");
        _;
    }
    
    //Seul l'admin peut ajouter un votant à la whitelist
    function registerVoterInWhitelist(address voter) external onlyOwner {
        require(whitelistVoters[voter].isRegistered == false, "Le votant est deja enregistre");
        whitelistVoters[voter].isRegistered = true;
        emit VoterRegistered(voter);
    }

    //Commencer le process d'enregistrement des propositions
    function startProposalsRegistration() external onlyOwner workflowStateInProcess(WorkflowStatus.RegisteringVoters){
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }
    
    //Enregistrer une proposition (qui ne peut pas être modifiée) et intialise son score
    function registerProposals(string calldata _description) external onlyRegisteredVotersCanVote workflowStateInProcess(WorkflowStatus.ProposalsRegistrationStarted) {
        proposals.push(Proposal({ description: _description, voteCount: 0 }));
        emit ProposalRegistered(proposals.length - 1);
    }

    //Terminer le process d'enregistrement des propositions
    function endProposalsRegistration() external onlyOwner workflowStateInProcess(WorkflowStatus.ProposalsRegistrationStarted) {
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange( WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    //Commencer le process de vote
    function startVoting() external onlyOwner workflowStateInProcess(WorkflowStatus.ProposalsRegistrationEnded) {
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotingSessionStarted);
    }

    //Voter
    function vote(uint256 idProposal) external onlyRegisteredVotersCanVote {
        Voter storage voter = whitelistVoters[msg.sender];
        require(voter.hasVoted == false , "Vous avez deja vote !");
        require(idProposal < proposals.length, "La proposition n existe pas !");
        voter.hasVoted = true;
        emit Voted (msg.sender, idProposal);
        emit VoterRegistered(msg.sender);
        voter.votedProposalId = idProposal;
    }

    //Terminer le process de vote   
    function endVoting() external onlyOwner workflowStateInProcess(WorkflowStatus.VotingSessionStarted) {
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange( WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    //Compter les votes
    function countVotes() external onlyOwner workflowStateInProcess(WorkflowStatus.VotingSessionEnded)  {
        uint256 winningVoteCount = 0;
        for (uint256 i=0;i<proposals.length;i++) {
            if(proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposalId = i;
            }
        }
        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }

    //Retourne le gagnant
    function getWinner() external view returns (uint256) {
        require(workflowStatus == WorkflowStatus.VotesTallied, "Les votes n ont pas encore ete comptabilises");
        return winningProposalId;
    }


    //Retourne le classement des propositions par votes
    function getProposalsRanking() external view returns (Proposal[] memory) {        
        require(proposals.length > 0, "Personne n a vote");
        Proposal[] memory ranking = new Proposal[](proposals.length);
        for (uint256 i=0; i<=proposals.length; i++) 
        {
            ranking[i] = proposals[i];
            
        }
        // Tri par sélection en ordre décroissant : du gagnant au perdant
        for (uint256 i = 0; i < ranking.length; i++) {
            uint256 maxIdx = i;
            for (uint256 j = i + 1; j < ranking.length; j++) {
                if (ranking[j].voteCount > ranking[maxIdx].voteCount) {
                    maxIdx = j;
                }
            }
            // On alimente la liste finale
            if (maxIdx != i) {
                Proposal memory temp = ranking[i];
                ranking[i] = ranking[maxIdx];
                ranking[maxIdx] = temp;
            }
        }
        return ranking;
    }

}