import { LangflowClient } from "@datastax/langflow-client";

export const langflowClient = new LangflowClient({
  baseUrl: process.env.LANGFLOW_API_URL,
});
