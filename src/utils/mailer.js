import Handlebars from "handlebars";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { stripHtml } from "string-strip-html";
import { mail } from "./sendgrid.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viewsPath = path.join(__dirname, "..", "views");
const partialsPath = path.join(viewsPath, "partials");
const layoutsPath = path.join(viewsPath, "layouts");

const compiledTemplates = {
  partials: {},
  layouts: {},
};

/**
 * Loads and compiles all Handlebars templates from the partials and layouts directories.
 */
async function loadAndCompileTemplates() {
  try {
    // Compile partials
    const partialFiles = await fs.readdir(partialsPath);
    for (const file of partialFiles) {
      if (file.endsWith(".hbs")) {
        const partialName = file.replace(".hbs", "");
        const partialFilePath = path.join(partialsPath, file);
        const templateContent = await fs.readFile(partialFilePath, "utf-8");
        compiledTemplates.partials[partialName] =
          Handlebars.compile(templateContent);
      }
    }

    // Compile layouts
    const layoutFiles = await fs.readdir(layoutsPath);
    for (const file of layoutFiles) {
      if (file.endsWith(".hbs")) {
        const layoutName = file.replace(".hbs", "");
        const layoutFilePath = path.join(layoutsPath, file);
        const templateContent = await fs.readFile(layoutFilePath, "utf-8");
        compiledTemplates.layouts[layoutName] =
          Handlebars.compile(templateContent);
      }
    }
  } catch (error) {
    console.error("Error loading or compiling templates:", error);
    throw new Error(`Failed to load and compile templates: ${error.message}`);
  }
}

// Load and compile templates when the module is initialized.
(async () => {
  await loadAndCompileTemplates();
})();

/**
 * Sends an email using a specified Handlebars layout and partial.
 * Templates are expected to be pre-compiled and cached.
 *
 * @param {object} options - Email options.
 * @param {string} options.to - Recipient's email address.
 * @param {string} options.from - Sender's email address (must be a verified sender in SendGrid).
 * @param {string} options.subject - Subject of the email.
 * @param {string} options.partialName - Name of the Handlebars partial file (e.g., 'welcome-email').
 * @param {string} options.layoutName - Name of the Handlebars layout file (e.g., 'email-layout').
 * @param {object} options.data - Data to be passed to the partial and layout templates.
 * @returns {Promise<void>} - A promise that resolves when the email is sent.
 * @throws {Error} - Throws an error if template files are not found or email sending fails.
 */
export async function sendEmail({
  to,
  from,
  subject,
  partialName,
  layoutName,
  data,
  headers = {},
}) {
  try {
    const compiledPartial = compiledTemplates.partials[partialName];
    const compiledLayout = compiledTemplates.layouts[layoutName];

    if (!compiledPartial) {
      throw new Error(
        `Partial template "${partialName}" not found or not compiled.`
      );
    }
    if (!compiledLayout) {
      throw new Error(
        `Layout template "${layoutName}" not found or not compiled.`
      );
    }

    // Render the partial content first
    const partialHtml = compiledPartial(data);

    // Render the full email using the layout, injecting the partial's HTML
    const htmlEmail = compiledLayout({
      ...data,
      subject,
      body: partialHtml,
      year: new Date().getFullYear(),
    });

    // Generate plain text version
    const textEmail = stripHtml(partialHtml, {
      dumpLinkHrefsNearby: { enabled: true },
    }).result;

    const msg = {
      to,
      from,
      subject,
      html: htmlEmail,
      text: textEmail,
      headers,
    };

    // Send the email
    await mail.send(msg);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
