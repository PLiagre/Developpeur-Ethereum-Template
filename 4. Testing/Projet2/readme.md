Projet 2 - explications :

J'ai divisé les tests en plusieurs parties : la whitelist, la gestions des proposals,
le process de vote, le tallyVotes et le workflow pour une meilleure lisibilité.

I- Gestion de la whitelist
On teste que si une adrese n'est pas dans la whitelist, alors le message d'erreur
"You're not a voter" est renvoyé.
On teste que seul l'owner peut ajoute une adresse dans la whitelist,
sinon onlyOwner renvoie un message d'erreur.
On teste que le owner peut bien intégrer une adresse dans la whitelist.
Le isRegistered du voteur associé à l'adresse passera à true.
Si on essaie avec une adresse qui n'est pas dans la whitelist, alors le
message "You're not a voter" est renvoyé.
On doit émettre l'événement VoterRegistered après avoir enregistré un voter dans la whitelist

II-Gestion des proposals

On récupère la liste des proposals.
On vérifie qu'en 0, on a "GENESIS".
On vérifie qu'en 1, on a "Proposal 1".
On vérifie qu'on revert si on appelle l'indice 2 car il n'a pas été alimenté.
Après un ajout de proposal, l'event ProposalRegistered doit être émis.

III - Gestion du process de vote

On vérifie qu'on comptabilise bien le vote si l'adresse du voteur est dans la whitelist.
On empêche le voteur de voter s'il n'est pas dans la whitelist.
On doit mettre à jour les valeurs hasVoted et votedProposalId du voteur après un vote.
On doit émettre l'événement Voted après avoir voté
On revert si la proposal n'existe pas.

IV - Gestion du tallyVotes

On revert si ça n'est pas le owner qui exécute la fonction.
On revert si le statut du workflow n'est pas à VotingSessionEnded au moment
de lancer la fonction.
On vérifie le bon fonctionnement de tallyVotes en cas d'égalité.
On vérifie le bon fonctionnement de tallyVotes en cas de vainqueur.
On vérifie la gestion si plusieurs électeurs votant pour différentes propositions
On vérifie la bonne gestion tallyVotes correctement avec un grand nombre de propositions.

V - Gestion des statuts du workflow

On vérifie la cohérence de toutes les étapes du workflow.
--Pour enregistrer les proposals
D'abord, on doit commencer avec le statut start proposal registration
Ensuite, on doit finir avec le statut end proposal registration
-- Pour voter
On doit commencer avec le statut start voting session
On doit finir avec le statut end voting session
-- Pour compter les voix et désigner le vainqueur
On doit passer au statut tally votes
-- On doit vérifier qu'il n'aie aucune incochérence dans l'enchaînement des statuts du workflow
On doit revert si au moment de lancer startProposalsRegistering, on n'est pas dans le statut RegisteringVoters
On doit revert si au moment de lancer  endProposalsRegistering, on n'est pas dans le statut ProposalsRegistrationStarted
On doit revert si au moment de lancer startVotingSession, on n'est pas dans le statut ProposalsRegistrationEnded
On doit revert si au moment de lancer endVotingSession, on n'est pas dans le statut VotingSessionStarted
On doit revert si au moment de lancer tallyVotes, on n'est pas dans le statut VotingSessionEnded





Voici le Coverage :

-------------|----------|----------|----------|----------|----------------|
File         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-------------|----------|----------|----------|----------|----------------|
 contracts/  |      100 |    72.92 |      100 |      100 |                |
  Voting.sol |      100 |    72.92 |      100 |      100 |                |
-------------|----------|----------|----------|----------|----------------|
All files    |      100 |    72.92 |      100 |      100 |                |
-------------|----------|----------|----------|----------|----------------|