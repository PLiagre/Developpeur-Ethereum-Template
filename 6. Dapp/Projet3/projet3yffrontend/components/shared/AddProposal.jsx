import { useEffect, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";
import { useToast } from "../ui/use-toast";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Informations from "./Information";

const AddProposal = () => {
  const { toast } = useToast();
  const [proposal, setProposal] = useState("");
  const [proposals, setProposals] = useState([]);
  const [pendingProposal, setPendingProposal] = useState(null);
  const [proposalCount, setProposalCount] = useState(0);

  const { data: hash, isPending, error, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, refetch } =
    useWaitForTransactionReceipt({ hash });

  // Charger les propositions sauvegardées lors du chargement initial
  useEffect(() => {
    const savedProposals = JSON.parse(localStorage.getItem("proposals") || "[]");
    setProposals(savedProposals);
    setProposalCount(savedProposals.length);
  }, []);

  // Enregistrer les nouvelles propositions dans localStorage lorsque la transaction est confirmée
  useEffect(() => {
    if (isConfirmed && pendingProposal) {
      const updatedProposals = [...proposals, { description: pendingProposal }];
      localStorage.setItem("proposals", JSON.stringify(updatedProposals));
      setProposals(updatedProposals);
      setProposalCount(prevCount => prevCount + 1);
      setPendingProposal(null);
      refetch();
    }
  }, [isConfirmed, pendingProposal, proposals, refetch]);

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

  return (
    <section className="space-y-4 p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="font-bold text-2xl mb-4 text-gray-700">Add Proposal</h2>
      <div className="flex space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Votre proposition"
          value={proposal}
          onChange={(e) => setProposal(e.target.value)}
          maxLength={42}
          className="flex-1 border-2 border-gray-300 p-2 rounded-lg"
        />
        <Button onClick={addProposal} variant="outline" className="bg-lime-400 text-white rounded-lg p-2">
          Add Proposal
        </Button>
      </div>
      <Informations hash={hash} isConfirming={isConfirming} isConfirmed={isConfirmed} error={error} />
      <div className="mt-6">
        <h3 className="font-bold text-xl text-gray-600">Proposals</h3>
        <ul className="mt-2 space-y-2">
          {proposals.map((proposal, index) => (
            <li key={index} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              {proposal.description}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default AddProposal;
