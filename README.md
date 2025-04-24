# Sphere Deposit Indexer Service

This service monitors deposit (Transfer) events to user-associated wallet addresses on the Polygon network using a specific The Graph subgraph. It is designed to be run as a separate background process alongside a main dApp.

## Functionality

1.  **Fetches User Addresses:** Periodically connects to a configured PostgreSQL database to retrieve a list of distinct `wallet_address` values from the `sphere_accounts` table.
2.  **Polls Subgraph:** Queries The Graph subgraph endpoint every configured interval (e.g., 30 seconds) for `Transfer` events where the `to` address matches any of the fetched user addresses.
3.  **Processes Deposits:** Identifies new deposit events (avoiding duplicates within a single run using transaction hashes) and logs them.
    - **(Placeholder)** Contains placeholder logic for saving events to the database.
    - **(Placeholder)** Contains placeholder logic for sending notifications (e.g., via bot).
    - **(Placeholder)** Contains placeholder logic for checking deposit intentions and triggering rewards.

## Prerequisites

- Node.js (v18 or later recommended)
- npm (or yarn)
- Access to a PostgreSQL database populated by the main dApp (containing the `sphere_accounts` table).
- Access to the internet to reach the subgraph endpoint.

## Setup

1.  **Clone the repository (if applicable):**

    ```bash
    git clone <repository-url>
    cd sphere-indexer-service
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

## Configuration

Configuration is managed via environment variables loaded from a `.env` file in the project root.

1.  **Create a `.env` file:** Copy the example or create a new one:

    ```bash
    cp .env.example .env
    ```

    _(If `.env.example` doesn't exist, create `.env` manually)_

2.  **Edit `.env`:** Fill in the required values:
    - `DATABASE_URL`: The connection string for your PostgreSQL database.
    - _Example:_ `postgresql://user:password@host:port/database?schema=public`
    - `SUBGRAPH_URL`: The URL of The Graph subgraph query endpoint.
    - _Default:_ `https://api.studio.thegraph.com/query/110071/sphere/v0.0.1`
    - `POLL_INTERVAL_MS`: The frequency (in milliseconds) at which to poll the subgraph.
    - _Default:_ `30000` (30 seconds)

## Running the Service

- **Development Mode:** Uses `tsx` for hot-reloading.

  ```bash
  npm run dev
  ```

- **Production Mode:** Compiles TypeScript to JavaScript first, then runs the compiled code.

  ```bash
  # 1. Build the project
  npm run build

  # 2. Start the service
  npm start
  ```

  Consider using a process manager like `pm2` for running in production environments to handle restarts and monitoring.

## Implementation Details

- `src/config.ts`: Loads and validates environment variables.
- `src/db.ts`: Handles PostgreSQL database connection and querying for user addresses.
- `src/subgraph.ts`: Handles querying The Graph subgraph for deposit events.
- `src/indexer.ts`: The main entry point, orchestrating the polling loop and calling processing logic.
  - The `processNewDeposits` function currently logs events and contains placeholders for actual database saving, notifications, and reward logic.

## Database Schema Dependency

This service specifically relies on the existence of a table named `sphere_accounts` with a column named `wallet_address` (type `String` or `TEXT`) in the configured PostgreSQL database.

## TODO / Next Steps

- Implement the actual database saving logic within `processNewDeposits` in `src/indexer.ts`.
- Implement the notification logic (e.g., calling a bot API).
- Implement the logic to check the database for deposit intentions and trigger rewards.
- Enhance error handling and resilience (e.g., retry mechanisms for DB/subgraph calls).
- Consider a more robust method for tracking processed events than the in-memory `processedTxHashes` set, especially for handling service restarts (e.g., storing the last processed block number or timestamp in the database).
- Add proper logging (e.g., using a library like Winston or Pino).
- Set up monitoring and alerting.
