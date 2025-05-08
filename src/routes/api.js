import User from "../models/user.js"; // Import User model
import { sendEmail } from "../utils/mailer.js"; // Import sendEmail utility

/**
 * API routes for the email agents service
 * @param {FastifyInstance} fastify - The Fastify instance
 * @param {Object} options - Plugin options
 */
export default async function apiRoutes(fastify, options) {
  // Example API endpoint
  fastify.get("/api/status", async (request, reply) => {
    return {
      service: "the-llama-farm",
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

  fastify.post("/api/resend-activation", async (request, reply) => {
    const { email } = request.body;

    if (!email) {
      return reply.code(400).send({ error: "Email is required" });
    }

    try {
      const user = await User.findByEmail(email); // This already fetches the user with their activationToken

      if (!user) {
        return reply.code(404).send({ error: "User not found" });
      }

      if (user.isActive) {
        return reply
          .code(200)
          .send({ message: "Account is already activated." });
      }

      // User exists and is not active, check for existing token and resend email
      if (!user.activationToken) {
        // This case should ideally not happen if user is not active, as token is set on creation
        // and only cleared on activation. But as a safeguard:
        fastify.log.warn(
          `User ${email} is not active but has no activation token. Cannot resend activation email.`
        );
        return reply.code(400).send({
          error:
            "Cannot resend activation email. No activation token found for this inactive user. Please contact support.",
        });
      }

      const activationUrl = `${request.protocol}://${request.hostname}/activate/${user.activationToken}`;
      await sendEmail({
        to: user.email,
        from: process.env.EMAIL_FROM,
        subject: "Activate Your Account",
        partialName: "activation-email",
        layoutName: "email-layout",
        data: {
          name: user.firstName,
          activationUrl,
        },
      });

      fastify.log.info(
        `Resent activation email to ${user.email} using existing token.`
      );
      return reply.send({
        message: "Activation email has been resent. Please check your inbox.",
      });
    } catch (error) {
      fastify.log.error(
        `Error resending activation email for ${email}: ${error.message}`
      );
      return reply.code(500).send({
        error: "An error occurred while trying to resend the activation email.",
      });
    }
  });
}
