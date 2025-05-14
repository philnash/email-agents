# The Llama Farm - Email Agents Project

Welcome to The Llama Farm, an application demonstrating how to build email-powered agents using Node.js, Fastify, SendGrid, Astra DB, and Langflow. This project allows users to register, log in, and interact with an AI agent via email.

## Features

- User registration and authentication.
- Email-based interaction with an AI agent powered by Langflow.
- Inbound email processing via SendGrid webhooks.
- Secure session management.
- Dashboard for authenticated users.
- Static pages for services like Llama Grooming, Herd Health Check, and Llama Training.

## Prerequisites

Before you begin, ensure you have the following installed and configured:

- [Node.js](https://nodejs.org/) (version specified in `.nvmrc` if present, or latest LTS)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A [SendGrid account](https://sendgrid.com/) with an API key and a verified sender email address.
- An [Astra DB (DataStax Astra)](https://astra.datastax.com/) serverless database.
- A running [Langflow instance](https://langflow.org/) with a deployed flow for email processing.

## Setup

1.  **Clone the repository:**

    ```sh
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Create a Database**

    In the [Astra DB dashboard](https://astra.datastax.com) create a new database. Once the database is running, create a non-vector collection called "users".

3.  **Environment Variables:**
    Copy the example environment file and update it with your credentials:

    ```sh
    cp .env.example .env
    ```

    Open the `.env` file and fill in the following variables:

    - `PORT`: The port the application will run on (default: `3000`).
    - `NODE_ENV`: The environment mode (e.g., `development`, `production`).
    - `COOKIE_SECRET`: A long, random, and secret string used to sign session cookies. Change this for production.
    - `SECURE_COOKIES`: Set to `true` in production to ensure cookies are only sent over HTTPS. `false` for HTTP development.
    - `SENDGRID_API_KEY`: Your API key from SendGrid for sending emails.
    - `LANGFLOW_API_URL`: The base URL of your running Langflow API (e.g., `http://localhost:7860`).
    - `LANGFLOW_API_KEY`: Your API key for authenticating with Langflow (if required by your Langflow setup).
    - `LANGFLOW_FLOW_ID`: The ID of the specific flow in Langflow that will process the emails.
    - `ASTRA_DB_API_ENDPOINT`: The API endpoint for your Astra DB database.
    - `ASTRA_DB_APPLICATION_TOKEN`: The application token for your Astra DB database.
    - `EMAIL_FROM`: The email address the application will send emails from. This **must** be a verified sender in your SendGrid account.

4.  **Install Dependencies:**

    ```sh
    npm install
    ```

    This will install all the Node.js packages defined in [`package.json`](package.json).

5.  **Langflow Setup:**
    Ensure you have Python and uv installed and install Langflow with the following command:

    ```sh
    uv pip install langflow
    ```

    Run Langflow with:

    ```sh
    python -m langflow run
    ```

    Create a flow that will handle incoming email messages and return a response to be emailed back to the user.

    Ensure your Langflow instance is running and accessible at the `LANGFLOW_API_URL` and that the `LANGFLOW_FLOW_ID` corresponds to a deployed flow designed to handle email text input.

## Running the Application

- **Development Mode:**
  This command uses `nodemon` to automatically restart the server on file changes, loads environment variables from `.env`, and pipes logs through `pino-colada` for pretty printing.

  ```sh
  npm run dev
  ```

- **Production Mode:**
  ```sh
  npm start
  ```

The application will be accessible at `http://localhost:PORT` (where `PORT` is the value from your `.env` file, e.g., `http://localhost:3000`).

## Scripts

The [`package.json`](package.json) file contains several useful scripts:

- `npm start`: Starts the application in production mode.
- `npm run dev`: Starts the application in development mode with `nodemon`.
- `npm run check`: Runs linters and format checkers.
- `npm run format`: Formats the code using Prettier.
- `npm run format:check`: Checks code formatting with Prettier.
- `npm run lint`: Lints the code using ESLint.

You can also use the [`src/scripts/clean-db.js`](src/scripts/clean-db.js) script to clear the `users` collection in your Astra DB (useful for testing):

```sh
node --env-file=.env src/scripts/clean-db.js
```

## Key Functionality

- **User Management**: Users can register and log in. User data is stored in Astra DB, managed by the [`User` model](src/models/user.js). Routes are defined in [`src/routes/users.js`](src/routes/users.js) and [`src/routes/auth.js`](src/routes/auth.js).
- **Email Sending**: Emails (activation, welcome, agent replies) are sent using SendGrid, configured in [`src/utils/mailer.js`](src/utils/mailer.js) and [`src/utils/sendgrid.js`](src/utils/sendgrid.js).
- **Inbound Email Processing (Webhook)**: The application listens for inbound emails from SendGrid at the [`/webhook/sendgrid`](src/routes/webhook.js) endpoint.
- **AI Agent Interaction**: Received emails are processed by a Langflow flow ([`src/utils/langflow.js`](src/utils/langflow.js)) to generate a response, which is then emailed back to the user.
- **Dashboard**: A simple dashboard is available for authenticated users at `/dashboard`, served by [`src/routes/dashboard.js`](src/routes/dashboard.js) and rendered using the [`src/views/dashboard.hbs`](src/views/dashboard.hbs) template.
- **Static Pages**: The application serves static informational pages for "Llama Grooming", "Herd Health Check", and "Llama Training", available under the `/about/` path.

## API Endpoints

- `GET /api/status`: Returns the service status. ([`src/routes/api.js`](src/routes/api.js))
- `POST /api/resend-activation`: Allows users to request a new activation email. ([`src/routes/api.js`](src/routes/api.js))
- `POST /webhook/sendgrid`: Endpoint for SendGrid to post inbound email data. ([`src/routes/webhook.js`](src/routes/webhook.js))

## License

This project is licensed under the [MIT License](LICENSE).
