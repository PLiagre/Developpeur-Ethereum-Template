/* 
createPublicClient: A function used to create a client that can interact with the blockchain without requiring a user account or private key. This is often used to read data from a smart contract or retrieve events.

http: A function that specifies the transport mode for communication with the blockchain, in this case, via HTTP requests.

hardhat: An object representing the Hardhat chain, used for developing and testing smart contracts locally before deploying them on a public chain.
*/
import { createPublicClient, http } from 'viem'
import { hardhat, sepolia } from 'viem/chains'

/*
The createPublicClient function is called with a configuration object that specifies two properties:

chain: The blockchain that the client should interact with, here specified as sepolia, indicating that the client is intended to communicate with the Sepolia blockchain.

transport: The transport mode used to send and receive data from the blockchain, specified here as http(), indicating that HTTP requests will be used.
*/

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.RPC)
})

export const hardhatClient = createPublicClient({
  chain: hardhat,
  transport: http()
})
