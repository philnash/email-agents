import User from "../models/user.js";
import { getSessionData, clearSessionData } from "../utils/session.js";

export default async function authRoutes(server) {
  // Login page route
  server.get("/login", async (request, reply) => {
    return reply.view("login.hbs", { title: "Login" });
  });

  // Login form submission route
  server.post("/login", async (request, reply) => {
    const { email, password } = request.body;
    try {
      const authenticatedUser = await User.authenticate(email, password);
      if (!authenticatedUser) {
        return reply.view("login.hbs", {
          title: "Login",
          error: "Invalid email or password",
          formData: { email },
        });
      }
      // User.authenticate updates lastLoggedIn and returns user object (with _id, without password)
      request.session.set("userId", authenticatedUser._id); // Use authenticatedUser._id
      const redirectUrl = getSessionData(request.session, "redirectUrl");
      if (redirectUrl) {
        clearSessionData(request.session, "redirectUrl");
        return reply.redirect(redirectUrl);
      }
      return reply.redirect("/");
    } catch (error) {
      server.log.error(error);
      // Check if the error is due to inactive account
      if (error.message.includes("not activated")) {
        return reply.view("login.hbs", {
          title: "Login",
          error: error.message, // Display the specific error message
          formData: { email },
        });
      }
      return reply.view("login.hbs", {
        title: "Login",
        error: "An error occurred. Please try again.",
        formData: { email },
      });
    }
  });

  // Logout route
  server.get("/logout", async (request, reply) => {
    request.session.destroy();
    return reply.redirect("/");
  });

  // Account activation route
  server.get("/activate/:token", async (request, reply) => {
    const { token } = request.params;
    try {
      const activated = await User.activate(token);
      if (activated) {
        return reply.view("login.hbs", {
          title: "Login",
          message: "Account activated successfully! You can now log in.",
        });
      }
      return reply.view("login.hbs", {
        title: "Login",
        error: "Invalid or expired activation token.",
      });
    } catch (error) {
      server.log.error(error);
      return reply.view("login.hbs", {
        title: "Login",
        error: "An error occurred during activation. Please try again.",
      });
    }
  });
}
