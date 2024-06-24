'use client';
// config
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";
import Informations from "./Information";

// UI
import { useToast } from "../ui/use-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const AddProposal = () => {
  const { toast } = useToast();
  const { address } = useAccount();
  const [proposal, setProposal] = useState("");
  const [proposals, setProposals] = useState([]);
  const [proposalCount, setProposalCount] = useState(0);
  const [pendingProposal, setPendingProposal] = useState(null);

  const { data: hash, isPending, error, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, refetch } =
    useWaitForTransactionReceipt({ hash });

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
        setPendingProposal(proposal);
        setProposal('');
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (isConfirmed && pendingProposal) {
      setProposals([...proposals, { description: pendingProposal }]);
      setProposalCount(prevCount => prevCount + 1);
      setPendingProposal(null);
      refetch();
    }
  }, [isConfirmed, pendingProposal, proposals, refetch]);

  return (
    <section className="space-y-2">
      <h2 className="font-bold">Add Proposal</h2>
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Votre proposition"
          value={proposal}
          onChange={(e) => setProposal(e.target.value)}
          maxLength={42}
          className="max-w-80 border-2"
        />
        <Button onClick={addProposal} variant="outline" className="bg-lime-400">
          Add Proposal
        </Button>
      </div>
      <Informations hash={hash} isConfirming={isConfirming} isConfirmed={isConfirmed} error={error} />
      <div>
      <h3 className="font-bold text-xl text-gray-600">Proposals</h3>
      <ul className="mt-2 space-y-2">
          {proposals.map((proposal, index) => (
            <li className="p-4 bg-white rounded-lg shadow-sm border border-gray-200" key={index}>{proposal.description}</li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default AddProposal;
