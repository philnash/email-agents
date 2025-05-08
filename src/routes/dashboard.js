import { ensureAuthenticated } from "../utils/session.js";

export default async function dashboardRoutes(server) {
  server.get(
    "/dashboard",
    {
      preHandler: [ensureAuthenticated], // Use as preHandler
    },
    async (request, reply) => {
      // If ensureAuthenticated passes, this handler will be executed
      return reply.view("dashboard.hbs", { title: "Dashboard" });
    }
  );

  // Route for Llama Grooming page
  server.get("/about/llama-grooming", async (request, reply) => {
    return reply.view("about/llama-grooming.hbs", { title: "Llama Grooming" });
  });

  // Route for Herd Health Check page
  server.get("/about/herd-health-check", async (request, reply) => {
    return reply.view("about/herd-health-check.hbs", {
      title: "Herd Health Check",
    });
  });

  // Route for Llama Training page
  server.get("/about/llama-training", async (request, reply) => {
    return reply.view("about/llama-training.hbs", { title: "Llama Training" });
  });
}
