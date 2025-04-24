import { request, gql } from "graphql-request";
import { config } from "./config";

// Define the structure of a Transfer event based on your subgraph schema
export interface TransferEvent {
  to: string;
  from: string;
  value: string; // Keep as string, convert later if needed
  blockTimestamp: string;
  transactionHash: string;
}

// Define the structure of the GraphQL response
interface SubgraphResponse {
  transfers: TransferEvent[];
}

const GET_DEPOSITS_QUERY = gql`
  query GetDeposits($addresses: [String!]!) {
    transfers(where: { to_in: $addresses }) {
      to
      from
      value
      blockTimestamp
      transactionHash
    }
  }
`;

export async function fetchDeposits(
  addresses: string[]
): Promise<TransferEvent[]> {
  if (addresses.length === 0) {
    console.log("No addresses to fetch deposits for.");
    return [];
  }

  console.log(
    `Fetching deposits for ${addresses.length} addresses from subgraph...`
  );

  try {
    // Ensure addresses are lowercase for consistent matching if needed (subgraphs might be case-sensitive)
    const lowercaseAddresses = addresses.map((addr) => addr.toLowerCase());

    const data = await request<SubgraphResponse>(
      config.subgraphUrl,
      GET_DEPOSITS_QUERY,
      { addresses: lowercaseAddresses } // Use lowercase addresses
    );
    console.log(`Fetched ${data.transfers.length} deposit events.`);
    return data.transfers;
  } catch (error) {
    console.error("Error fetching deposits from subgraph:", error);
    return []; // Return empty array on error
  }
}
