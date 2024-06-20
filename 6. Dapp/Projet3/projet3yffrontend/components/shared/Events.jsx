import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"

const Events = ({ events }) => {
  return (
    <>
      <h2 className="text-4xl font-extrabold mt-4">Events</h2>
      <Table className="mt-4">
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Type</TableHead>
            <TableHead>Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={crypto.randomUUID()}>
              <TableCell className="font-medium">
                { switch (event) {
                  case 'VoterRegistered':
                <Badge className="bg-lime-400">Voter registered</Badge>
                break;
                case 'WorkflowStatusChange':
                <Badge className="bg-lime-400">Workflow status has changed</Badge>
                break;
                case 'ProposalRegistered':
                <Badge className="bg-lime-400">New proposal added</Badge>
                break;
                case 'Voted':
                <Badge className="bg-lime-400">Has voted</Badge>
                break;

                default:
                break;
                }}
              </TableCell>
              <TableCell>{event.address}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default Events