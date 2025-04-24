import { Pool } from "pg";
import { config } from "./config";

const pool = new Pool({
  connectionString: config.databaseUrl,
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
  // Optional: attempt to reconnect or terminate the process
  // process.exit(-1);
});

export async function fetchUserAddressesFromDB(): Promise<string[]> {
  console.log("Fetching user addresses from database...");
  let client;
  try {
    client = await pool.connect();
    // Query distinct, non-null wallet addresses from sphere_accounts table
    const result = await client.query(
      "SELECT DISTINCT wallet_address FROM sphere_accounts WHERE wallet_address IS NOT NULL AND wallet_address != ''"
    );
    const addresses = result.rows.map((row) => row.wallet_address);
    console.log(`Found ${addresses.length} unique addresses.`);
    return addresses;
  } catch (error) {
    console.error("Error fetching user addresses from database:", error);
    return []; // Return empty array on error to prevent crash
  } finally {
    client?.release(); // Release the client back to the pool
  }
}

// Optional: Function to gracefully close the pool on shutdown
export async function closeDbPool() {
  console.log("Closing database connection pool...");
  await pool.end();
  console.log("Database pool closed.");
}
