import AddVoter from "./AddVoter";
// import Events from "./Events"

import { useState, useEffect } from "react"

import { useAccount, useReadContract } from "wagmi"
import { contractAddress, contractAbi } from "@/constants"



const Projet3Main = () => {

    return (
        <>
            <AddVoter />
        </>
    )
}

export default Projet3Main;