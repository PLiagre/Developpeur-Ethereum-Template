import AddVoter from "./AddVoter";
import AddProposal from "./AddProposal";
import Vote from "./Vote";
// import Events from "./Events"

import { useState, useEffect } from "react"

import { useAccount, useReadContract } from "wagmi"
import { contractAddress, contractAbi } from "@/constants"



const Projet3Main = () => {

    return (
        <>
            <AddVoter />
            <AddProposal/>
            <Vote/>
        </>
    )
}

export default Projet3Main;