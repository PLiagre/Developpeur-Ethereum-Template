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
const Vote = ({getEvents}) => {
    const { toast } = useToast()
    const { address } = useAccount();
    const [vote, setVote] = useState("")
    const { data: hash, isPending, error, writeContract } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed, refetch } =
      useWaitForTransactionReceipt({
        hash,
      })

      const voteConst = async () => {
        if (vote === "") {
          toast({
            title: "Error",
            description: "Please write the chosen id proposal",
            className: 'bg-red-600'
          });
        } else {
          try {
            await writeContract({
              address: contractAddress,
              abi: contractAbi,
              functionName: 'setVote',
              args: [vote],
            });
            setVote('');
          } catch (error) {
            console.error(error);
          }
        }
      };
      useEffect(() => {
        if (isConfirmed) {
            setVote('');
          refetch();
        }
      }, [isConfirmed])
    
    return ( 
    <section className=" space-y-2">
      <h2 className="font-bold">Vote</h2>
      <div className="flex space-x-2">
        <Input type="text" placeholder="Votre vote" onChange={(e) => setVote(e.target.value)} maxLength={42} className="max-w-80 border-2" />
        <Button onClick={voteConst} variant="outline" className="bg-lime-400" >
          Vote</Button>
      </div>
      {isConfirming && <div>Waiting for confirmation...</div>}
      {isConfirmed && <Alert className="bg-lime-400 max-w-max"><AlertTitle>Transaction confirmed.</AlertTitle><AlertDescription>Hash: {hash}</AlertDescription></Alert>}
    </section>
    )
}

export default Vote;