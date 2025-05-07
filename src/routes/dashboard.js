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
}
