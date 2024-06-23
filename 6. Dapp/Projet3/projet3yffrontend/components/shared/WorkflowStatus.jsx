'use client';
// config
import { useState, useEffect } from "react";
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSendTransaction } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";

// UI
import { useToast } from "../ui/use-toast";

import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { readContract } from "viem/actions";

const WorkflowStatus = () => {
  const { toast } = useToast()
  const [workflowStatus, setWorkflowStatus] = useState(null)
  const [badgeStatus, setBadgeStatus] = useState('')
  const { data: status, refetch } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'workflowStatus',
  });
  const { data: hash, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  useEffect(() => {
    updateBadgeStatus();
  }, [])

  useEffect(() => {
    if (isConfirmed) {
      updateBadgeStatus();
      refetch();
    }
  }, [isConfirmed, refetch]);

  useEffect(() => {
    if (status) {
      setWorkflowStatus(status);
      updateBadgeStatus();
    }
  }, [status]);



  const changeWorkflowStatus = async (workflowName) => {
    try {
      await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: workflowName,
      })
    } catch (error) {
      console.error(error);
    }
  }


  const updateBadgeStatus = () => {
    switch (status) {
      case 1:
        setBadgeStatus("ProposalsRegistrationStarted")
        break;
      case 2:
        setBadgeStatus("ProposalsRegistrationEnded")
        break;
      case 3:
        setBadgeStatus("VotingSessionStarted")
        break;
      case 4:
        setBadgeStatus("VotingSessionEnded")
        break;
      // case 5:
      //   setBadgeStatus("VotesTallied")
      //   break;
      default:
        setBadgeStatus("RegisteringVoters")
        break;
    }
  }



  return (
    <section className="space-y-2">
      <div className="flex space-x-2">
        <h2 className="font-bold">Set Workflow status</h2>
        <Badge variant="outlined" className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ">
          <div className="w-2 h-2 ring-1 ring-lime-500 rounded-full bg-lime-400 mr-2"></div>{badgeStatus}</Badge>
      </div>
      <div className="space-x-2">
        <Button variant="outline" className="bg-lime-400" onClick={() => changeWorkflowStatus('startProposalsRegistering')}>Start proposal session</Button>
        <Button variant="outline" className="bg-lime-400" onClick={() => changeWorkflowStatus('endProposalsRegistering')}>End proposal session</Button>
        <Button variant="outline" className="bg-lime-400" onClick={() => changeWorkflowStatus('startVotingSession')}>Start voting session</Button>
        <Button variant="outline" className="bg-lime-400" onClick={() => changeWorkflowStatus('endVotingSession')}>End voting session</Button>
        <Button variant="outline" className="bg-lime-800" onClick={() => changeWorkflowStatus('test')}>Tailly vote</Button>
      </div>
    </section >
  )
}

export default WorkflowStatus