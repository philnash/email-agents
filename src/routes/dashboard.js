import { getSessionData, setSessionData } from "../utils/session.js";

export default async function dashboardRoutes(server) {
  server.get("/dashboard", async (request, reply) => {
    const userId = getSessionData(request.session, "userId");
    if (!userId) {
      setSessionData(request.session, "redirectUrl", request.url);
      return reply.redirect("/login");
    }

    return reply.view("dashboard.hbs", { title: "Dashboard" });
  });
}
