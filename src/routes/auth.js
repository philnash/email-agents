import User from "../models/user.js";

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
      return reply.redirect("/");
    } catch (error) {
      server.log.error(error);
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
}
