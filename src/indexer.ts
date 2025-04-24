import { setInterval } from "timers/promises";
import { config } from "./config";
import { fetchUserAddressesFromDB, closeDbPool } from "./db";
import { fetchDeposits, TransferEvent } from "./subgraph";

// --- State ---
// Keep track of processed transaction hashes to avoid duplicates during overlap or re-runs
// In a production scenario, this might be better handled by querying the last processed block
// from your database or using the subgraph's block number.
let processedTxHashes = new Set<string>();

async function processNewDeposits(deposits: TransferEvent[]): Promise<void> {
  const newUniqueDeposits = deposits.filter(
    (deposit) => !processedTxHashes.has(deposit.transactionHash)
  );

  if (newUniqueDeposits.length === 0) {
    // console.log('No new deposits found in this batch.');
    return;
  }

  console.log(`Processing ${newUniqueDeposits.length} new deposit events...`);

  for (const transfer of newUniqueDeposits) {
    // 1. Save the event to the database (Implement this)
    // Example: await saveTransferEvent(transfer);
    console.log(
      `  Deposit found: To: ${transfer.to}, ` +
        `Value: ${transfer.value}, Tx: ${transfer.transactionHash}`
    );

    // 2. Send bot notifications (Implement this)
    // Example: await sendNotification(transfer);

    // 3. Check for reward intentions and trigger rewards (Implement this)
    // Example: await checkAndTriggerReward(transfer);

    // Add hash to processed set AFTER successful processing
    // (or handle potential failures gracefully)
    processedTxHashes.add(transfer.transactionHash);
  }

  // Optional: Prune the processedTxHashes set periodically if it grows too large
  // This simple in-memory set will reset if the service restarts.
}

async function pollDeposits() {
  console.log(
    `Starting deposit polling every ${config.pollIntervalMs / 1000} seconds.`
  );

  // Use an async iterator for cleaner interval handling
  for await (const _startTime of setInterval(config.pollIntervalMs)) {
    console.log(
      `\n--- Polling cycle started at ${new Date().toISOString()} ---`
    );
    try {
      // Step 1: Get the list of addresses to monitor from the DB
      const userAddresses = await fetchUserAddressesFromDB();

      if (userAddresses.length > 0) {
        // Step 2: Fetch new deposit events from the subgraph for these addresses
        const newDeposits = await fetchDeposits(userAddresses);

        // Step 3: Process the fetched deposits
        await processNewDeposits(newDeposits);
      } else {
        console.log("No user addresses found in DB to monitor.");
      }
    } catch (error) {
      // Catch errors during the polling cycle to prevent the loop from stopping
      console.error("Error during polling cycle:", error);
    }
    console.log(
      `--- Polling cycle finished at ${new Date().toISOString()} ---`
    );
  }
}

// --- Main Execution ---

async function main() {
  console.log("Indexer service starting...");

  // Start the polling process
  pollDeposits().catch((error) => {
    console.error("Unhandled error during polling:", error);
    // Consider exiting or implementing a restart mechanism
    process.exit(1);
  });
}

// Graceful shutdown handling
async function shutdown(signal: string) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  // Add any cleanup tasks here, e.g., closing DB pool
  try {
    await closeDbPool();
  } catch (error) {
    console.error("Error closing DB pool during shutdown:", error);
  }
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

main();
