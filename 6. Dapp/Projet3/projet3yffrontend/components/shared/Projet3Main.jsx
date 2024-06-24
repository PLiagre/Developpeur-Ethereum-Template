import { useState, useEffect } from "react"
import { parseAbiItem } from "viem";
import { useAccount, useReadContract } from "wagmi"
import { contractAddress, contractAbi } from "@/constants"
import { publicClient } from "@/utils/client";

// components
import WorkflowStatus from "./WorkflowStatus";
import AddVoter from "./AddVoter";
import AddProposal from "./AddProposal";
import Vote from "./Vote";
import TallyVote from "./TallyVote";
import GetWinningProposal from "./GetWinningProposal"
import Event from "./Events";

// UI
import { Button } from "../ui/button";




const Projet3Main = () => {
    const [events, setEvents] = useState([])
    const [darkMode, setDarkMode] = useState(false);
    const { address } = useAccount()

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

    const getEvents = async () => {
        const workflowStatusChange = await publicClient.getLogs({
            address: contractAddress,
            event: parseAbiItem('event WorkflowStatusChange(uint8 previousStatus, uint8 newStatus)'),
            fromBlock: 0n,
        })
        const voterRegisteredEvents = await publicClient.getLogs({
            address: contractAddress,
            event: parseAbiItem('event VoterRegistered(address voterAddress)'),
            fromBlock: 0n,
        })
        const proposalRegisteredEvents = await publicClient.getLogs({
            address: contractAddress,
            event: parseAbiItem('event ProposalRegistered(uint proposalId)'),
            fromBlock: 0n,
        })
        const votedEvents = await publicClient.getLogs({
            address: contractAddress,
            event: parseAbiItem('event Voted(address voter, uint proposalId)'),
            fromBlock: 0n,
        })

        const combinedEvents = workflowStatusChange.map((event) => ({
            eventName: event.eventName,
            oldValue: event.args.previousStatus,
            newValue: event.args.newStatus,
            blockNumber: Number(event.blockNumber)
        })).concat(
            voterRegisteredEvents.map((event) => ({
                eventName: event.eventName,
                newValue: `Voter added ${event.args.voterAddress}`,
                blockNumber: Number(event.blockNumber)
            })),
            proposalRegisteredEvents.map((event) => ({
                eventName: event.eventName,
                newValue: `Proposal added ${Number(event.args.proposalId)}`,
                blockNumber: Number(event.blockNumber)
            })),
            votedEvents.map((event) => ({
                eventName: event.eventName,
                newValue: `Voter ${event.args.voter} vote for proposal ID ${Number(event.args.proposalId)}`,
                blockNumber: Number(event.blockNumber)
            }))
        )

        combinedEvents.sort(function (a, b) {
            return b.blockNumber - a.blockNumber;
        });

        setEvents(combinedEvents)
        console.log(combinedEvents);
    }

    useEffect(() => {
        const getAllEvents = async () => {
            if (address !== undefined) {
                await getEvents();
            }
            if (events.length > events.length) {
                await getEvents();

            }
        }
        getAllEvents();
    }, [address])


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
            <section>
                <h3 className="font-bold">Events</h3>
                <div className="flex flex-col w-full">
                    {events.length > 0 && events.map((event) => {
                        return (
                            <Event event={event} key={crypto.randomUUID()} />
                        )
                    })}
                </div>
            </section>
        </div>
    )
}

export default Projet3Main;