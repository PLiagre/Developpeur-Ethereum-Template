const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect, BigNumber } = require("chai");   
const { ethers } = require("hardhat");

describe.only("Voting", function () {

  async function deployVoting() {

    const [owner, addr1, addr2] = await ethers.getSigners();

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();

    return { voting , owner, addr1, addr2 };
  }
  describe("Déploiement", function () {
    describe("Gestion des voteurs", function () {
    it("Revert si l'adresse n'est pas dans la whitelist", async function () {
        const { voting, owner, addr1 } = await loadFixture(deployVoting);
        expect(voting.getVoter(addr1)).to.be.revertedWith ("You're not a voter");
    });
    it("Seul l'owner peut ajouter une adresse dans la whitelist", async function () {
      const { voting, owner, addr1 } = await loadFixture(deployVoting);
      expect(voting.connect(addr1).addVoter(addr1.address)).to.be.revertedWith("Only owner can call this function");

     });
     it("Doit émettre l'événement VoterRegistered après avoir enregistré un voter dans la whitelist", async function () {
      const { voting, owner, addr1, addr2 } = await loadFixture(deployVoting);
      
      await expect(voting.connect(owner).addVoter(addr1.address))
      .to.emit(voting, "VoterRegistered")
      .withArgs(addr1.address);
     });
    it("Récupère l'adresse si elle est dans la whitelist", async function () {
      const { voting, owner, addr1, addr2 } = await loadFixture(deployVoting);
      
      // Ajouter addr1 à la liste blanche en tant que propriétaire
      await voting.connect(owner).addVoter(addr1.address);

      // Vérification de l'état du voteur après l'ajout
      const voter1 = await voting.connect(addr1).getVoter(addr1.address);
  
      // Vérifier que l'adresse est dans la liste blanche
      expect(voter1.isRegistered).to.be.true;
  
      // Vérifiez qu'addr2 n'est pas dans la whitelist et que le message du modifier est directement renvoyé
      expect(voting.getVoter(addr2.address)).to.be.revertedWith("You're not a voter");
    });
  });
  describe("Gestion des Proposals", function () {
    it("Récupère la proposal si elle figure dans la liste des proposals", async function () {
      const { voting, owner, addr1, addr2 } = await loadFixture(deployVoting);

      // Enregistrer addr1 comme voteur
      await voting.connect(owner).addVoter(addr1.address);

      // Commencer l'enregistrement des propositions
      await voting.connect(owner).startProposalsRegistering();

      // Ajouter une proposition en utilisant addr1
      await voting.connect(addr1).addProposal("Proposal 1");
      
      //Vérifiez que le tableau des propositions est initialisé à "GENESIS"
      const prop0 = await voting.connect(addr1).getOneProposal(0);
      expect(prop0.description).to.equal("GENESIS");

      // Vérifiez que la proposition 1 est bien dans le tableau des propositions
      const prop1 = await voting.connect(addr1).getOneProposal(1);
      expect(prop1.description).to.equal("Proposal 1");
      
      // Vérifiez que la proposal 2 n'est pas dans le tableau des proposals
      const prop2 = "Proposal 2";
      expect(prop2).to.not.equal(prop1);

      // Vérifiez qu'il n'y a pas de proposition à l'indice 2 (ou que le message d'erreur est renvoyé)
      await expect(voting.connect(addr1).getOneProposal(2)).to.be.reverted;
      
    });
    it("Après un ajout de proposal, l'event ProposalRegistered doit être émis", async function () {
      const { voting, owner, addr1, addr2 } = await loadFixture(deployVoting);

      // Enregistrer addr1 comme voteur
      await voting.connect(owner).addVoter(addr1.address);

      // Commencer l'enregistrement des propositions
      await voting.connect(owner).startProposalsRegistering();

      // En ajoutant une proposition, on émet l'événement ProposalRegistered
      await expect(voting.connect(addr1).addProposal("Proposal 1"))
      .to.emit(voting, "ProposalRegistered")
      .withArgs(1);
      
    });
  });
     //Process de vote
    describe("Gestion du vote", function () {
      it("Empêche le voter si le voteur n'est pas dans la whitelist", async function () {
        const { voting, owner, addr1, addr2 } = await loadFixture(deployVoting);
      
        // Enregistrer addr1 comme voteur
        await voting.connect(owner).addVoter(addr1.address);
      
        // Démarrer la session d'enregistrement des propositions
        await voting.connect(owner).startProposalsRegistering();
      
        // Ajouter une proposition par addr1
        await voting.connect(addr1).addProposal("Proposal 1");
      
        // Terminer la session d'enregistrement des propositions
        await voting.connect(owner).endProposalsRegistering();
      
        // Démarrer la session de vote
        await voting.connect(owner).startVotingSession();
      
        // Revert car addr2 n'est pas dans la whitelist
        await expect(voting.connect(addr2).setVote(1)).to.be.reverted;
      });
     it("Comptabilise le vote si un voteur dans la whitelist vote pour une proposition", async function () {
      const { voting, owner, addr1 } = await loadFixture(deployVoting);
    
      // Enregistrer addr1 comme voteur
      await voting.connect(owner).addVoter(addr1.address);
    
      // Démarrer la session d'enregistrement des propositions
      await voting.connect(owner).startProposalsRegistering();
    
      // Ajouter une proposition par addr1
      await voting.connect(addr1).addProposal("Proposal 1");
    
      // Terminer la session d'enregistrement des propositions
      await voting.connect(owner).endProposalsRegistering();
    
      // Démarrer la session de vote
      await voting.connect(owner).startVotingSession();
    
      // addr1 vote pour la proposition Proposal 1
      await voting.connect(addr1).setVote(1);
    
      // Vérifier le comptage des votes pour la proposition 1
      const prop0 = await voting.connect(addr1).getOneProposal(1);
      expect(prop0.voteCount).to.equal(1);
      
    });
    it("Doit mettre à jour les valeurs hasVoted et votedProposalId du voteur", async function () {
      const { voting, owner, addr1 } = await loadFixture(deployVoting);
      
      // Enregistrer addr1 comme voteur
      await voting.connect(owner).addVoter(addr1.address);
      
      // Démarrer la session d'enregistrement des propositions
      await voting.connect(owner).startProposalsRegistering();
      
      // Ajouter une proposition par addr1
      await voting.connect(addr1).addProposal("Proposal 1");
      
      // Terminer la session d'enregistrement des propositions
      await voting.connect(owner).endProposalsRegistering();
      
      // Démarrer la session de vote
      await voting.connect(owner).startVotingSession();
      
      // addr1 vote pour la proposition Proposal 1
      await voting.connect(addr1).setVote(1);
      
      // Vérifiez que l'électeur a bien voté
      const voter1 = await voting.connect(addr1).getVoter(addr1.address);
      expect(voter1.hasVoted).to.be.true;
      expect(voter1.votedProposalId).to.equal(1);
    });
    
    it("Doit émettre l'événement Voted après avoir voté", async function () {
      const { voting, owner, addr1 } = await loadFixture(deployVoting);
      
      // Enregistrer addr1 comme voteur
      await voting.connect(owner).addVoter(addr1.address);
      
      // Démarrer la session d'enregistrement des propositions
      await voting.connect(owner).startProposalsRegistering();
      
      // Ajouter une proposition par addr1
      await voting.connect(addr1).addProposal("Proposal 1");
      
      // Terminer la session d'enregistrement des propositions
      await voting.connect(owner).endProposalsRegistering();
      
      // Démarrer la session de vote
      await voting.connect(owner).startVotingSession();
      
      // Vérifiez que l'événement est émis lorsque addr1 vote
      await expect(voting.connect(addr1).setVote(1))
        .to.emit(voting, "Voted")
        .withArgs(addr1.address, 1);
    });
    
  it("Revert si la proposition n'existe pas", async function () {
    const { voting, owner, addr1, addr2 } = await loadFixture(deployVoting);
    
      // Enregistrer addr1 comme voteur
      await voting.connect(owner).addVoter(addr1.address);
    
      // Démarrer la session d'enregistrement des propositions
      await voting.connect(owner).startProposalsRegistering();
    
      // Ajouter une proposition par addr1
      await voting.connect(addr1).addProposal("Proposal 1");
    
      // Terminer la session d'enregistrement des propositions
      await voting.connect(owner).endProposalsRegistering();
    
      // Démarrer la session de vote
      await voting.connect(owner).startVotingSession();
    
      // Revert car addr2 n'est pas dans la whitelist
      await expect(voting.connect(addr2).setVote(2)).to.be.reverted;
  });
});
  describe("Gestion du tallyVotes", function () {
    it("Revert si ça n'est pas le owner qui exécute cette fonction", async function () {
      const { voting, addr1 } = await loadFixture(deployVoting);
      await expect(voting.connect(addr1).tallyVotes()).to.be.reverted;
    });
    it("Revert si le statut du workflow n'est pas à VotingSessionEnded", async function () {
      const { voting, owner } = await loadFixture(deployVoting);
      await expect(voting.connect(owner).tallyVotes()).to.be.revertedWith("Current status is not voting session ended");
    });
    it("Doit exécuter tallyVotes correctement en cas d'égalité et modifier le statut du workflow", async function () {
      const { voting, owner, addr1, addr2 } = await loadFixture(deployVoting);

      //On ajoute 2 voteurs à la Whitelist
      await voting.connect(owner).addVoter(addr1.address);
      await voting.connect(owner).addVoter(addr2.address);

      //On ajoute 2 propositions à la liste des Proposals
      await voting.connect(owner).startProposalsRegistering();
      await voting.connect(addr1).addProposal("Prop A");
      await voting.connect(addr1).addProposal("Prop B");
      await voting.connect(owner).endProposalsRegistering();

      //Lancement du process de vote
      await voting.connect(owner).startVotingSession();
      await voting.connect(addr1).setVote(0); // Vote pour Prop A
      await voting.connect(addr2).setVote(1); // Vote pour Prop B
      await voting.connect(owner).endVotingSession();
      
      // On lance tallyVotes
      await voting.connect(owner).tallyVotes();

      // On vérifie le winningProposalID
      const winningProposalID = await voting.winningProposalID();
      expect(winningProposalID).to.equal(0); // Les 2 proposals sont à égalité donc le winningProposalID renvoie 0

      // Vérifie le statut du workflow
      const workflowStatus = await voting.workflowStatus();
      expect(workflowStatus).to.equal(5); // Le workflowStatut doit être à "VotesTallied"
    });

    it("Doit exécuter tallyVotes s'il y a un vainqueur et modifier le statut du workflow", async function () {
      const { voting, owner, addr1, addr2 } = await loadFixture(deployVoting);

      //On ajoute 2 voteurs à la Whitelist
      await voting.connect(owner).addVoter(addr1.address);
      await voting.connect(owner).addVoter(addr2.address);

      //On ajoute 2 propositions à la liste des Proposals
      await voting.connect(owner).startProposalsRegistering();
      await voting.connect(addr1).addProposal("Prop A");
      await voting.connect(addr1).addProposal("Prop B");
      await voting.connect(owner).endProposalsRegistering();

      //Lancement du process de vote
      await voting.connect(owner).startVotingSession();
      await voting.connect(addr1).setVote(1); // Vote pour Prop B
      await voting.connect(addr2).setVote(1); // Vote pour Prop B
      await voting.connect(owner).endVotingSession();
      
      // On lance tallyVotes
      await voting.connect(owner).tallyVotes();

      // On vérifie le winningProposalID
      const winningProposalID = await voting.winningProposalID();
      expect(winningProposalID).to.equal(1); // Prop B gagne donc le winningProposalID renvoie 0

      // Vérifie le statut du workflow
      const workflowStatus = await voting.workflowStatus();
      expect(workflowStatus).to.equal(5); // Le workflowStatut doit être à "VotesTallied"
    });

    it("Doit gérer correctement plusieurs électeurs votant pour différentes propositions", async function () {
      const { voting, owner, addr1, addr2 } = await loadFixture(deployVoting);
      
      // Enregistrer addr1 et addr2 comme voteurs
      await voting.connect(owner).addVoter(addr1.address);
      await voting.connect(owner).addVoter(addr2.address);
      
      // Démarrer la session d'enregistrement des propositions
      await voting.connect(owner).startProposalsRegistering();
      
      // Ajouter des propositions par addr1
      await voting.connect(addr1).addProposal("Proposal 1");
      await voting.connect(addr1).addProposal("Proposal 2");
      
      // Terminer la session d'enregistrement des propositions
      await voting.connect(owner).endProposalsRegistering();
      
      // Démarrer la session de vote
      await voting.connect(owner).startVotingSession();
      
      // addr1 vote pour la proposition Proposal 1
      await voting.connect(addr1).setVote(1);
      
      // addr2 vote pour la proposition Proposal 2
      await voting.connect(addr2).setVote(2);
      
      // Terminer la session de vote
      await voting.connect(owner).endVotingSession();
      
      // Tally votes
      await voting.connect(owner).tallyVotes();
      
      // Vérifiez les résultats des votes
      const prop1 = await voting.connect(addr1).getOneProposal(1);
      const prop2 = await voting.connect(addr2).getOneProposal(2);
      
      expect(prop1.voteCount).to.equal(1);
      expect(prop2.voteCount).to.equal(1);
    });  
    
    it("Doit exécuter tallyVotes correctement avec un grand nombre de propositions", async function () {
      const { voting, owner, addr1 } = await loadFixture(deployVoting);
      
      // Enregistrer addr1 comme voteur
      await voting.connect(owner).addVoter(addr1.address);
      
      // Démarrer la session d'enregistrement des propositions
      await voting.connect(owner).startProposalsRegistering();
      
      // Ajouter un grand nombre de propositions
      const numProposals = 100;
      for (let i = 0; i < numProposals; i++) {
        await voting.connect(addr1).addProposal(`Proposal ${i}`);
      }
      
      // Terminer la session d'enregistrement des propositions
      await voting.connect(owner).endProposalsRegistering();
      
      // Démarrer la session de vote
      await voting.connect(owner).startVotingSession();
      
      // addr1 vote pour la dernière proposition
      await voting.connect(addr1).setVote(numProposals);
      
      // Terminer la session de vote
      await voting.connect(owner).endVotingSession();
      
      // Tally votes
      await voting.connect(owner).tallyVotes();
      
      // Vérifiez que la dernière proposition a le plus grand nombre de votes
      const winningProposalID = await voting.winningProposalID();
      expect(winningProposalID).to.equal(numProposals);
    });
    
  });

    describe("Gestion des workflows", function () {
    it("Doit commencer avec le statut start proposal registration", async function () {
      const { voting, owner } = await loadFixture(deployVoting);
  
      await expect(voting.connect(owner).startProposalsRegistering())
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(0, 1); // RegisteringVoters to ProposalsRegistrationStarted
  
      const status = await voting.workflowStatus();
      expect(status).to.equal(1); // ProposalsRegistrationStarted
    });
  
    it("Doit finir avec le statut end proposal registration", async function () {
      const { voting, owner } = await loadFixture(deployVoting);
  
      await voting.connect(owner).startProposalsRegistering();
  
      await expect(voting.connect(owner).endProposalsRegistering())
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(1, 2); // ProposalsRegistrationStarted to ProposalsRegistrationEnded
  
      const status = await voting.workflowStatus();
      expect(status).to.equal(2); // ProposalsRegistrationEnded
    });
  
    it("Doit commencer avec le statut start voting session", async function () {
      const { voting, owner } = await loadFixture(deployVoting);
  
      await voting.connect(owner).startProposalsRegistering();
      await voting.connect(owner).endProposalsRegistering();
  
      await expect(voting.connect(owner).startVotingSession())
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(2, 3); // ProposalsRegistrationEnded à VotingSessionStarted
  
      const status = await voting.workflowStatus();
      expect(status).to.equal(3); // VotingSessionStarted
    });
  
    it("Doit finir avec le statut end voting session", async function () {
      const { voting, owner } = await loadFixture(deployVoting);
  
      await voting.connect(owner).startProposalsRegistering();
      await voting.connect(owner).endProposalsRegistering();
      await voting.connect(owner).startVotingSession();
  
      await expect(voting.connect(owner).endVotingSession())
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(3, 4); // VotingSessionStarted à VotingSessionEnded
  
      const status = await voting.workflowStatus();
      expect(status).to.equal(4); // VotingSessionEnded
    });
  
    it("Doit passer au statut tally votes", async function () {
      const { voting, owner } = await loadFixture(deployVoting);
  
      await voting.connect(owner).startProposalsRegistering();
      await voting.connect(owner).endProposalsRegistering();
      await voting.connect(owner).startVotingSession();
      await voting.connect(owner).endVotingSession();
  
      await expect(voting.connect(owner).tallyVotes())
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(4, 5); // VotingSessionEnded à VotesTallied
  
      const status = await voting.workflowStatus();
      expect(status).to.equal(5); // VotesTallied
    });
  
    it("Doit revert si au moment de lancer startProposalsRegistering, on n'est pas dans le statut RegisteringVoters", async function () {
      const { voting, owner } = await loadFixture(deployVoting);
  
      await voting.connect(owner).startProposalsRegistering();
      await expect(voting.connect(owner).startProposalsRegistering()).to.be.revertedWith("Registering proposals cant be started now");
    });
  
    it("Doit revert si au moment de lancer  endProposalsRegistering, on n'est pas dans le statut ProposalsRegistrationStarted", async function () {
      const { voting, owner } = await loadFixture(deployVoting);
  
      await expect(voting.connect(owner).endProposalsRegistering()).to.be.revertedWith("Registering proposals havent started yet");
    });
  
    it("Doit revert si au moment de lancer startVotingSession, on n'est pas dans le statut ProposalsRegistrationEnded", async function () {
      const { voting, owner } = await loadFixture(deployVoting);
  
      await expect(voting.connect(owner).startVotingSession()).to.be.revertedWith("Registering proposals phase is not finished");
    });
  
    it("Doit revert si au moment de lancer endVotingSession, on n'est pas dans le statut VotingSessionStarted", async function () {
      const { voting, owner } = await loadFixture(deployVoting);
  
      await expect(voting.connect(owner).endVotingSession()).to.be.revertedWith("Voting session havent started yet");
    });
  
    it("Doit revert si au moment de lancer tallyVotes, on n'est pas dans le statut VotingSessionEnded", async function () {
      const { voting, owner } = await loadFixture(deployVoting);
  
      await expect(voting.connect(owner).tallyVotes()).to.be.revertedWith("Current status is not voting session ended");
    });
  });
  });
      


});