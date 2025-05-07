import { mail } from "../utils/sendgrid.js";
import { langflowClient } from "../utils/langflow.js";
import parseHeaders from "parse-headers";
import EmailReplyParser from "email-reply-parser";

const emailReplyParser = new EmailReplyParser();

function extractReference(headers) {
  const messageId = headers["message-id"];
  const inReplyTo = headers["in-reply-to"];
  const references = headers["references"].split(" ");

  // return either the first reference or in-reply-to or messageId
  if (references && references.length > 0) {
    return references[0];
  } else if (inReplyTo) {
    return inReplyTo;
  }
  return messageId;
}

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

      const headers = parseHeaders(payload.headers.value);
      const referenceId = extractReference(headers);

      // Log the extracted parameters
      console.log({
        message: "Received SendGrid webhook",
        to,
        from,
        subject,
        text,
        referenceId,
      });

      const flow = langflowClient.flow(process.env.LANGFLOW_FLOW_ID);
      const flowResponse = await flow.run(text, {
        session_id: from,
      });
      const emailResponseText = flowResponse.chatOutputText();
      // send a reply
      const reply = {
        to: from,
        from: to,
        subject: `Re: ${subject}`,
        text: emailResponseText,
      };
      try {
        await mail.send(reply);
      } catch (error) {
        fastify.log.error({
          message: "Error processing SendGrid webhook",
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
