import {
  getSessionData,
  setSessionData,
  requireSessionData,
} from "../utils/session.js";

/**
 * API routes for the email agents service
 * @param {FastifyInstance} fastify - The Fastify instance
 * @param {Object} options - Plugin options
 */
export default async function apiRoutes(fastify, options) {
  // Example API endpoint
  fastify.get("/api/status", async (request, reply) => {
    return {
      service: "email-agents",
      status: "operational",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    };
  });

  // Session test routes
  fastify.get("/api/session", async (request, reply) => {
    // Get session data using utility function
    const views = getSessionData(request.session, "views", 0);

    // Update session data using utility function
    setSessionData(request.session, "views", views + 1);
    setSessionData(request.session, "lastVisit", new Date().toISOString());

    return {
      message: "Session data retrieved successfully",
      session: {
        views: getSessionData(request.session, "views"),
        lastVisit: getSessionData(request.session, "lastVisit"),
      },
    };
  });

  // Example of a protected route that requires session data
  fastify.get(
    "/api/protected",
    {
      preHandler: requireSessionData(["userId"]),
    },
    async (request, reply) => {
      return {
        message: "You have access to this protected route",
        userId: getSessionData(request.session, "userId"),
      };
    },
  );

  // Example route to set user data (simulating login)
  fastify.post("/api/login", async (request, reply) => {
    const { userId } = request.body || {};

    if (!userId) {
      return reply.code(400).send({ error: "userId is required" });
    }

    // Set user data in session
    setSessionData(request.session, "userId", userId);
    setSessionData(request.session, "loggedInAt", new Date().toISOString());

    return {
      success: true,
      message: "User logged in successfully",
    };
  });

  // Add your API endpoints here
  // Example:
  // fastify.post('/api/emails', { preValidation: [fastify.authenticate] }, async (request, reply) => {
  //   // Handle email creation
  // });
}
