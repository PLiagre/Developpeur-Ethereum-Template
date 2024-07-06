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


// function 
const GetWinningProposal = ({ children }) => {
  const { toast } = useToast()
  const [winningProposalID, setWinningProposalID] = useState("")
  const [proposalsArray, setProposalsArray] = useState([])
  const { data: winningProposal } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'winningProposalID',
  })
  console.log(winningProposalID);
  const getWinningProposal = async () => {
    if (winningProposal) {
      await setWinningProposalID(winningProposal)
    }
  }

  return (
    <section className=" space-y-2">
      <h2 className="font-bold">get Result</h2>
      <div className="flex space-x-2">
        <Button onClick={getWinningProposal} variant="outline" className="bg-lime-400" >
          get Winning Proposal ID</Button>
        <div className="flex items-center space-x-2">
          {winningProposalID ? <p>Winning proposal is number {winningProposal.toString()}</p> : <p>Waiting for tally votes</p>}</div>
      </div>
    </section>

  )
}

export default GetWinningProposal;