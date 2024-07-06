# Voting DApp

Florian IMBERT
Yanis DACI

## Security

Loop moved from tallyVote function to setVote function to prevent dos attack

```
        if (proposalsArray[_id].voteCount > maxVoteCount) {
            winningProposalID = _id;
            maxVoteCount = proposalsArray[_id].voteCount;
        }
```

## How to start

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```
