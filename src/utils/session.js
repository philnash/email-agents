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
 * Create a session middleware that ensures certain fields exist
 * @param {Array} requiredFields - Array of fields that should exist in the session
 * @returns {Function} Middleware function to use in routes
 */
export function requireSessionData(requiredFields = []) {
  return async (request, reply) => {
    if (!request.session) {
      reply.code(500).send({ error: "Session unavailable" });
      return;
    }

    const missing = requiredFields.filter(
      (field) => !(field in request.session),
    );
    if (missing.length > 0) {
      reply.code(401).send({
        error: "Authentication required",
        missingFields: missing,
      });
      return;
    }
  };
}
