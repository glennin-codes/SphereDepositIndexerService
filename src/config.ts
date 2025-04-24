import dotenv from "dotenv";
dotenv.config();

function getEnvVar(key: string, required = true): string {
  const value = process.env[key];
  if (required && (value === undefined || value === null || value === "")) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || ""; // Return empty string if not required and missing
}

export const config = {
  databaseUrl: getEnvVar("DATABASE_URL"),
  subgraphUrl: getEnvVar("SUBGRAPH_URL"),
  pollIntervalMs: parseInt(getEnvVar("POLL_INTERVAL_MS"), 10),
};
