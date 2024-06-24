'use client';
// config
import { useState, useEffect } from "react";
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSendTransaction } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";
import Informations from "./Information";

// UI
import { useToast } from "../ui/use-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";


const AddProposal = ({ getEvents }) => {
  const { toast } = useToast()
  const { address } = useAccount();
  const [proposal, setProposal] = useState("")
  const [proposals, setProposals] = useState([]);
  const [proposalCount, setProposalCount] = useState(0);

  const { data: hash, isPending, error, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, refetch } =
    useWaitForTransactionReceipt({
      hash,
    })
    
    const { data: countData } = useReadContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'getOneProposal',
      args: [proposalCount], // Utilisation du compteur local comme index
    });
  
    const fetchProposals = async () => {
      let proposalsArray = [];
      console.log("fetch 1" + proposalCount);
      for (let i = 0; i < proposalCount; i++) {
        try {
          const proposal = await readContract('getOneProposal', [i]);
          console.log(`Fetched proposal with id ${i}:`, proposal);
          proposalsArray.push(proposal);
        } catch (error) {
          console.error(`Error fetching proposal with id ${i}:`, error);
        }
      }
      setProposals(proposalsArray);
    };

  const addProposal = async () => {
    if (proposal === "") {
      toast({
        title: "Error",
        description: "You cannot propose nothing",
        className: 'bg-red-600'
      });
    } else {
      try {
        await writeContract({
          address: contractAddress,
          abi: contractAbi,
          functionName: 'addProposal',
          args: [proposal],
        });
        setProposal('');
        setProposalCount(prevCount => prevCount + 1); // Incrémente le compteur local
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      setProposal('');
      fetchProposals();
      refetch();
    }
  }, [isConfirmed, refetch])




  return (
    <section className=" space-y-2">
      <h2 className="font-bold">Add Proposal</h2>
      <div className="flex space-x-2">
        <Input type="text" placeholder="Votre proposition" onChange={(e) => setProposal(e.target.value)} maxLength={42} className="max-w-80 border-2" />
        <Button onClick={addProposal} variant="outline" className="bg-lime-400" >
          Add Proposal</Button>
      </div>
      <Informations hash={hash} isConfirming={isConfirming} isConfirmed={isConfirmed} error={error} />
      <div>
        <h3 className="font-bold">Proposals</h3>
        <ul>
        {proposals.map((proposal, index) => {
          console.log(`Rendering proposal with id ${index}:`, proposal);  // Ajout du console.log ici
          return <li key={index}>{proposal.description}</li>;
        })}
        Prop : 
        {proposals.map((proposal, index) => (
            <li key={index}>{proposal.description}</li>
          ))}
      </ul>
      </div>
    </section>
  )
}

export default AddProposal;