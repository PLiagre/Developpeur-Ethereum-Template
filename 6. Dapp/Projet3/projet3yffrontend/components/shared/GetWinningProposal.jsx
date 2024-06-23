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

const GetWinningProposal = ({children}) => {

    const { toast } = useToast()
    const { address } = useAccount();
    const [winningProposalID, setWinningProposalID] = useState("")
    const { data: hash, isPending: getIsPending, error, writeContract } = useWriteContract();
    const { isLoading: isConfirming, isPending: setIsPending, isSuccess: isConfirmed, refetch } =
      useWaitForTransactionReceipt({
        hash,
      })

      const getWinningProposal = async () => {
          try {
            await writeContract({
              address: contractAddress,
              abi: contractAbi,
              functionName: 'winningProposalID',
              args: [],
            });
            setWinningProposalID('');
          } catch (error) {
            console.error(error);
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
        <h2 className="font-bold">get Result</h2>
        <div className="flex space-x-2">
          <Button onClick={getWinningProposal} variant="outline" className="bg-lime-400" >
          get Winning Proposal ID</Button>
        <div>The winner is : {winningProposalID}</div>
        </div>
  
        {isConfirming && <div>Waiting for confirmation...</div>}
        {isConfirmed && <Alert className="bg-lime-400 max-w-max"><AlertTitle>Transaction confirmed.</AlertTitle><AlertDescription>Hash: {hash}</AlertDescription></Alert>}
      </section>

    )
}

export default GetWinningProposal;