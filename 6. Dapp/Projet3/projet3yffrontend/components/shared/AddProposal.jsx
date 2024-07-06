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
    <section className="space-y-2">
      <h2 className="font-bold">Add Proposal</h2>
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Votre proposition"
          value={proposal}
          onChange={(e) => setProposal(e.target.value)}
          className="max-w-80 border-2"
        />
        <Button onClick={addProposal} variant="outline" className="bg-lime-400">
          Add Proposal
        </Button>
      </div>
      <Informations hash={hash} isConfirming={isConfirming} isConfirmed={isConfirmed} error={error} />
      <div className="mt-6">
        <h3 className="font-bold">Proposals</h3>
        <ul className="mt-2 space-y-2 border-2 p-2 max-w-max">
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
