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

  // Add your API endpoints here
  // Example:
  // fastify.post('/api/emails', { preValidation: [fastify.authenticate] }, async (request, reply) => {
  //   // Handle email creation
  // });
}
