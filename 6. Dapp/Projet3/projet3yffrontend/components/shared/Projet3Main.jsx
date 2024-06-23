import AddVoter from "./AddVoter";
import AddProposal from "./AddProposal";
import Vote from "./Vote";
import TallyVote from "./TallyVote";
import GetWinningProposal from "./GetWinningProposal"
// import Events from "./Events"

import { useState, useEffect } from "react"

import { useAccount, useReadContract } from "wagmi"
import { contractAddress, contractAbi } from "@/constants"
import WorkflowStatus from "./WorkflowStatus";



const Projet3Main = () => {

    return (
        <div className="space-y-5">
            <WorkflowStatus />
            <AddVoter />
            <AddProposal />
            <Vote />
            <TallyVote />
            <GetWinningProposal />
        </div>
    )
}

export default Projet3Main;