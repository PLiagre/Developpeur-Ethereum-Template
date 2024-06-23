import AddVoter from "./AddVoter";
import AddProposal from "./AddProposal";
import Vote from "./Vote";
import TallyVote from "./TallyVote";
import GetWinningProposal from "./GetWinningProposal"
import { Button } from "../ui/button";
// import Events from "./Events"

import { useState, useEffect } from "react"

import { useAccount, useReadContract } from "wagmi"
import { contractAddress, contractAbi } from "@/constants"
import WorkflowStatus from "./WorkflowStatus";



const Projet3Main = () => {

    const [darkMode, setDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        if (!darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    useEffect(() => {
        const storedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(storedDarkMode);
        if (storedDarkMode) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    

    return (
        <div className={`space-y-5 ${darkMode ? 'dark' : ''}`}>
            <Button onClick={toggleDarkMode} className="p-2 border rounded">
                Dark or Light Mode ?
            </Button>
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