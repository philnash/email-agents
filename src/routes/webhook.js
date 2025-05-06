// filepath: /Users/philnash/Developer/workshops/email-agents/src/routes/webhook.js

/**
 * Webhook routes for receiving and processing SendGrid events
 * @param {FastifyInstance} fastify - The Fastify instance
 * @param {Object} options - Plugin options
 */
export default async function webhookRoutes(fastify, options) {
  // SendGrid webhook endpoint
  fastify.post("/webhook/sendgrid", async (request, reply) => {
    try {
      const payload = request.body;

      const to = payload.to.value;
      const from = payload.from.value;
      const text = payload.text.value;
      const subject = payload.subject.value;

      // Log the extracted parameters
      console.log({
        message: "Received SendGrid webhook",
        to,
        from,
        subject,
        text,
      });

      // Return a successful response to SendGrid
      return { success: true };
    } catch (error) {
      fastify.log.error({
        message: "Error processing SendGrid webhook",
        error: error.message,
      });

      // Return an error response
      return reply.code(500).send({ error: "Failed to process webhook" });
    }
  });
}
