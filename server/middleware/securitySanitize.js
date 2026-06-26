/**
 * securitySanitize.js
 *
 * Middleware that strips MongoDB operator characters from incoming request data
 * to prevent NoSQL injection attacks.
 *
 * The attack vector: an attacker sends a body like:
 *   { "email": { "$gt": "" }, "password": { "$gt": "" } }
 * Without sanitization, Mongoose passes these operator objects straight to
 * the query engine, which evaluates "$gt: ''" as "greater-than empty string" —
 * effectively bypassing authentication.
 *
 * This middleware walks req.body, req.query, and req.params recursively and
 * removes any key that starts with "$" or contains ".".  String values are
 * additionally stripped of literal angle brackets to reduce reflected XSS
 * surface on API error messages that echo back user input.
 */

/**
 * Recursively remove MongoDB operator keys and sanitize string values.
 *
 * @param {unknown} data
 * @returns {unknown} Sanitized clone of the input.
 */
function deepSanitize(data) {
  if (typeof data === 'string') {
    // Strip angle brackets (XSS surface reduction) — keep $ in string values
    // because legitimate text can contain $ signs (prices, currency, etc.).
    return data.replace(/[<>]/g, '');
  }

  if (Array.isArray(data)) {
    return data.map(deepSanitize);
  }

  if (data !== null && typeof data === 'object') {
    const cleaned = {};
    for (const key of Object.keys(data)) {
      // Drop keys that start with "$" (MongoDB operators) or contain "."
      // (dot-notation path traversal).
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }
      cleaned[key] = deepSanitize(data[key]);
    }
    return cleaned;
  }

  return data;
}

/**
 * Express middleware: sanitize all incoming request vectors.
 */
export const sanitizeInput = (req, res, next) => {
  req.body   = deepSanitize(req.body);
  req.query  = deepSanitize(req.query);
  req.params = deepSanitize(req.params);
  next();
};

export const sanitizeRequests = (req, res, next) => {
  req.body   = deepSanitize(req.body);
  req.query  = deepSanitize(req.query);
  req.params = deepSanitize(req.params);
  next();
};
