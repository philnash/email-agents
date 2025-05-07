import Fastify from "fastify";
import pino from "pino";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import cookie from "@fastify/cookie";
import session from "@fastify/session";
import view from "@fastify/view";
import fastifyStatic from "@fastify/static";
import multipart from "@fastify/multipart";
import formbody from "@fastify/formbody"; // Add this line
import Handlebars from "handlebars";
import apiRoutes from "./routes/api.js";
import webhookRoutes from "./routes/webhook.js";
import userRoutes from "./routes/users.js"; // Import the new user routes
import path from "path";
import { createWriteStream } from "fs";
import { stdout } from "process";
import { fileURLToPath } from "url";

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logStream = createWriteStream(
  path.join(__dirname, "..", "logs", "app.log"),
  {
    flags: "a",
  }
);

// Create Fastify instance
const server = Fastify({
  logger: {
    level: "info",
    logger: pino({ level: "info" }, pino.multistream([stdout, logStream])),
  },
  trustProxy: process.env.NODE_ENV === "production", // Trust proxy headers if in production
});

// Register security plugins
async function registerPlugins() {
  // Add security headers
  await server.register(helmet, {
    // Customize CSP as needed for your application
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Handlebars templates
        imgSrc: ["'self'"],
      },
    },
  });

  // Configure CORS
  await server.register(cors, {
    origin: process.env.NODE_ENV !== "production", // Allow during development
    credentials: true,
  });

  // Add rate limiting to prevent abuse
  await server.register(rateLimit, {
    max: 100, // Maximum 100 requests
    timeWindow: "1 minute", // Per minute
  });

  // Register cookie support
  await server.register(cookie);

  // Register session support with cookies
  await server.register(session, {
    cookieName: "sessionId",
    secret:
      process.env.COOKIE_SECRET ||
      "a-secret-with-minimum-length-of-32-characters",
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 86400000, // 24 hours in milliseconds
    },
    saveUninitialized: false,
    rolling: true, // Keep session alive when interacting with server
  });

  // Register static file support
  await server.register(fastifyStatic, {
    root: path.join(__dirname, "public"),
    prefix: "/public/", // optional: default '/'
  });

  // Register multipart plugin
  await server.register(multipart, { attachFieldsToBody: true });

  // Register formbody plugin
  await server.register(formbody); // Add this line

  // Register view engine
  await server.register(view, {
    engine: {
      handlebars: Handlebars,
    },
    root: path.join(__dirname, "views"),
    layout: "layouts/layout",
    options: {
      partials: {
        // Define any partials here if needed
      },
    },
  });
}

// Define routes
function registerRoutes() {
  // Register our API routes
  server.register(apiRoutes);

  // Register our webhook routes
  server.register(webhookRoutes);

  // Register our user routes
  server.register(userRoutes); // Register new user routes

  // Health check route
  server.get("/health", async (request, reply) => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Root route
  server.get("/", async (request, reply) => {
    return reply.view("index.hbs", {
      title: "Email Agents",
      message: "Welcome to the Email Agents application",
    });
  });

  // Use this as a router middleware for your protected routes
  server.addHook("onRequest", async (request, reply) => {
    // Example authentication check (implement your own auth logic)
    // if (!authenticated) {
    //   reply.code(401).send({ error: 'Unauthorized' });
    // }
  });
}

// Start server
async function start() {
  try {
    await registerPlugins();
    registerRoutes();

    const port = process.env.PORT || 3000;
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`Server listening on ${server.server.address().port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await server.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down server...");
  await server.close();
  process.exit(0);
});

start();
