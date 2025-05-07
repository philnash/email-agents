/**
 * Session utility functions
 * Helper functions for session management
 */

/**
 * Set session data safely
 * @param {Object} session - Fastify session object
 * @param {String} key - Key to set
 * @param {*} value - Value to store
 */
export function setSessionData(session, key, value) {
  if (session) {
    session[key] = value;
  }
}

/**
 * Get session data safely
 * @param {Object} session - Fastify session object
 * @param {String} key - Key to retrieve
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} The session value or default value
 */
export function getSessionData(session, key, defaultValue = null) {
  if (session && key in session) {
    return session[key];
  }
  return defaultValue;
}

/**
 * Clear specific session data
 * @param {Object} session - Fastify session object
 * @param {String} key - Key to clear
 */
export function clearSessionData(session, key) {
  if (session && key in session) {
    delete session[key];
  }
}

/**
 * Ensures that a user is authenticated by checking for userId in the session.
 * If the user is not authenticated, it sets a redirect URL and redirects to /login.
 * This function is designed to be used as a Fastify preHandler.
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 */
export async function ensureAuthenticated(request, reply) {
  const userId = getSessionData(request.session, "userId");
  if (!userId) {
    setSessionData(request.session, "redirectUrl", request.url);
    await reply.redirect("/login");
    return reply; // Indicate that the reply has been sent and processing should stop
  }
  // If authenticated, the function completes, and Fastify proceeds.
}
