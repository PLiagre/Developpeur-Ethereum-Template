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


// function
const TallyVote = ({ children }) => {
  const { toast } = useToast()
  const { address } = useAccount();
  const [tallyVote, setTallyVote] = useState("")
  const { data: hash, isPending, error, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, refetch } =
    useWaitForTransactionReceipt({
      hash,
    })

  const tallyVoteConst = async () => {
    try {
      await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'tallyVotes',
        args: [],
      });
      setTallyVote('');
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      setTallyVote('');
      refetch();
    }
  }, [isConfirmed])

  return (
    <section className=" space-y-2">
      <h2 className="font-bold">Tally Vote</h2>
      <div className="flex space-x-2">
        <Button onClick={tallyVoteConst} variant="outline" className="bg-lime-400" >
          Tally Votes</Button>
      </div>
      <Informations hash={hash} isConfirming={isConfirming} isConfirmed={isConfirmed} error={error} />
    </section>
  )
}

export default TallyVote;