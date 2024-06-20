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

const AddVoter = ({ getEvents }) => {
  const { toast } = useToast()
  const { address } = useAccount();
  const [voterAddress, setVoterAddress] = useState("")
  const { data: hash, isPending, error, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, refetch } =
    useWaitForTransactionReceipt({
      hash,
    })

  const addVoter = async () => {
    if (voterAddress === "") {
      toast({
        title: "Error",
        description: "Please add a valid address",
        className: 'bg-red-600'
      });
    } else if (voterAddress.length !== 42) {
      toast({
        title: "Error",
        description: "Address should have 42 characters",
        className: 'bg-red-600'
      });
    } else {
      try {
        await writeContract({
          address: contractAddress,
          abi: contractAbi,
          functionName: 'addVoter',
          args: [voterAddress],
        });
        setVoterAddress('');
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      setVoterAddress('');
      refetch();
    }
  }, [isConfirmed])

  return (
    <section className=" space-y-2">
      <h2 className="font-bold">Add Voter</h2>
      <div className="flex space-x-2">
        <Input type="text" placeholder="Votre adresse" onChange={(e) => setVoterAddress(e.target.value)} maxLength={42} className="max-w-80 border-2" />
        <Button onClick={addVoter} variant="outline" className="bg-lime-400" >
          Add voter</Button>
      </div>
      {isConfirming && <div>Waiting for confirmation...</div>}
      {isConfirmed && <Alert className="bg-lime-400 max-w-max"><AlertTitle>Transaction confirmed.</AlertTitle><AlertDescription>Hash: {hash}</AlertDescription></Alert>}
    </section>

  )
}

export default AddVoter