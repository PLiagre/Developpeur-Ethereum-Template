'use client';
// config
import { useState, useEffect } from "react";
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSendTransaction } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";
import { hardhatClient, publicClient } from "@/utils/client";
import { parseAbiItem } from "viem";
import Event from "./Events";

// UI
import { useToast } from "../ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";


// function
const WorkflowStatus = () => {
  const { toast } = useToast()
  const [workflowStatus, setWorkflowStatus] = useState(null)
  const [badgeStatus, setBadgeStatus] = useState('')
  const [events, setEvents] = useState([])
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

  // get workflowStatus for first time rendering
  useEffect(() => {
    updateBadgeStatus();
    getEvents();

  }, [])

  // update status displayed in badge when status change
  useEffect(() => {
    if (status || isConfirmed) {
      updateBadgeStatus();
      refetch();
      getEvents();
    }
  }, [status, isConfirmed, refetch]);

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

  // add right workflowStatus in badge depending of current status state
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
      default:
        setBadgeStatus("RegisteringVoters")
        break;
    }
  }

  const getEvents = async () => {
    const workflowStatusChangedLog = await publicClient.getLogs({
      address: contractAddress,
      event: parseAbiItem('event WorkflowStatusChange(uint8 previousStatus, uint8 newStatus)'),
      fromBlock: 0n,
    })
    setEvents(workflowStatusChangedLog.map(
      log => ({
        oldValue: log.args.previousStatus.toString(),
        newValue: log.args.newStatus.toString()
      })
    ))
  }
  console.log(events);

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
      </div>
      <h3 className="font-bold">Events</h3>
      <div className="flex flex-col w-full">
        {events.length > 0 && events.map((event) => {
          return (
            <Event event={event} type={"WorkflowStatusChanged"} key={crypto.randomUUID()} />
          )
        })}
      </div>
    </section >
  )
}

export default WorkflowStatus