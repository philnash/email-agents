import User from "../models/user.js";
import { sendEmail } from "../utils/mailer.js"; // Updated import

export default async function userRoutes(server) {
  // Registration page route
  server.get("/users/new", async (request, reply) => {
    return reply.view("register.hbs", { title: "Register" });
  });

  // Registration form submission route
  server.post("/users", async (request, reply) => {
    const { firstName, lastName, email, password } = request.body;
    try {
      await User.create({ firstName, lastName, email, password });

      await sendEmail({
        to: email,
        from: process.env.EMAIL_FROM,
        subject: "Welcome to Our Service!",
        partialName: "welcome-email",
        layoutName: "email-layout",
        data: { firstName },
      });

      server.log.info(`Welcome email sent to ${email}`);
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
