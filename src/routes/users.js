import User from "../models/user.js";
import { sendEmail } from "../utils/mailer.js";

export default async function userRoutes(server) {
  // Registration page route
  server.get("/users/new", async (request, reply) => {
    return reply.view("register.hbs", { title: "Register" });
  });

  // Registration form submission route
  server.post("/users", async (request, reply) => {
    const { firstName, lastName, email, password } = request.body;
    try {
      // User.create now returns the user object which includes the activationToken
      const newUser = await User.create({
        firstName,
        lastName,
        email,
        password,
      });

      // Send activation email
      const activationUrl = `${request.protocol}://${request.hostname}${request.port === "80" ? "" : ":" + request.port}/activate/${newUser.activationToken}`;
      await sendEmail({
        to: newUser.email,
        from: process.env.EMAIL_FROM,
        subject: "Activate Your Account",
        partialName: "activation-email",
        layoutName: "email-layout",
        data: {
          name: newUser.firstName,
          activationUrl,
        },
      });
      server.log.info(`Activation email sent to ${newUser.email}`);

      // Send welcome email
      await sendEmail({
        to: newUser.email,
        from: process.env.EMAIL_FROM,
        subject: "Welcome to The Llama Farm!",
        partialName: "welcome-email",
        layoutName: "email-layout",
        data: {
          firstName: newUser.firstName,
        },
      });
      server.log.info(`Welcome email sent to ${newUser.email}`);

      // Redirect to login page with a message
      return reply.view("login.hbs", {
        title: "Login",
        message:
          "Registration successful! Please check your email to activate your account.",
      });
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
