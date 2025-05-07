import User from "../models/user.js";

export default async function authRoutes(server) {
  // Registration page route
  server.get("/users/new", async (request, reply) => {
    return reply.view("register.hbs", { title: "Register" });
  });

  // Registration form submission route
  server.post("/users", async (request, reply) => {
    const { firstName, lastName, email, password } = request.body;
    try {
      await User.create({ firstName, lastName, email, password });
      // Redirect to login page or dashboard after successful registration
      // For now, redirecting to home page
      return reply.redirect("/");
    } catch (error) {
      server.log.error(error);
      // Render registration page with error message and pre-filled data
      return reply.view("register.hbs", {
        title: "Register",
        error: error.message,
        formData: { firstName, lastName, email }, // Pass submitted data back to the form
      });
    }
  });
}
