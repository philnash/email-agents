import { sendEmail } from "../utils/mailer.js";
import { langflowClient } from "../utils/langflow.js";
import parseHeaders from "parse-headers";
import EmailReplyParser from "email-reply-parser";

const emailReplyParser = new EmailReplyParser();

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
      const parsedText = emailReplyParser.read(payload.text.value);
      const text = parsedText.getVisibleText();
      const subject = payload.subject.value;

      const input = `Message from: ${from}.\n\n${text}`;

      const headers = parseHeaders(payload.headers.value);
      const messageId = headers["message-id"];
      const references = (headers["references"] ?? "").split(" ");

      const flow = langflowClient.flow(process.env.LANGFLOW_FLOW_ID);
      const flowResponse = await flow.run(input, {
        session_id: from,
      });
      const emailResponseText = flowResponse.chatOutputText();
      // send a reply
      const reply = {
        to: from,
        from: to,
        subject: subject.startsWith("Re:") ? subject : `Re: ${subject}`,
        partialName: "response-email",
        layoutName: "email-layout",
        data: { response: emailResponseText },
        headers: {
          "In-Reply-To": messageId,
          References: [messageId, ...references].join(" "),
        },
      };

      try {
        await sendEmail(reply);
      } catch (error) {
        fastify.log.error({
          message: "Error sending email",
          error: error.message,
        });

        // Return an error response
        return reply.code(500).send({ error: "Failed to send email" });
      }

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
