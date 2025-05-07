import { DataAPIClient } from "@datastax/astra-db-ts";

let db;
export const collections = {
  users: null,
};

// Initialize the Astra DB database and collection
export const init = () => {
  if (db) {
    return;
  }

  // Check for required environment variables
  const endpoint = process.env.ASTRA_DB_API_ENDPOINT;
  const applicationToken = process.env.ASTRA_DB_APPLICATION_TOKEN;

  if (!endpoint || !applicationToken) {
    throw new Error(
      "Astra DB configuration is missing. Please set ASTRA_DB_ENDPOINT and ASTRA_DB_APPLICATION_TOKEN environment variables."
    );
  }

  // Create and return the Astra DB client
  const client = new DataAPIClient(applicationToken);
  db = client.db(endpoint);
  collections.users = db.collection("users");
};

init();
