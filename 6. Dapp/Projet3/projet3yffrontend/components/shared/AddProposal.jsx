'use client';
// config
import { useState, useEffect } from "react";
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSendTransaction } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";

// UI
import { useToast } from "../ui/use-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";


const AddProposal = ({ getEvents }) => {
  const { toast } = useToast()
  const { address } = useAccount();
  const [proposal, setProposal] = useState("")
  const { data: hash, isPending, error, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, refetch } =
    useWaitForTransactionReceipt({
      hash,
    })

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
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      setProposal('');
      refetch();
    }
  }, [isConfirmed])




  return (
    <section className=" space-y-2">
      <h2 className="font-bold">Add Proposal</h2>
      <div className="flex space-x-2">
        <Input type="text" placeholder="Votre proposition" onChange={(e) => setProposal(e.target.value)} maxLength={42} className="max-w-80 border-2" />
        <Button onClick={addProposal} variant="outline" className="bg-lime-400" >
          Add Proposal</Button>
      </div>

      {isConfirming && <div>Waiting for confirmation...</div>}
      {isConfirmed && <Alert className="bg-lime-400 max-w-max"><AlertTitle>Transaction confirmed.</AlertTitle><AlertDescription>Hash: {hash}</AlertDescription></Alert>}
    </section>
  )
}

export default AddProposal;