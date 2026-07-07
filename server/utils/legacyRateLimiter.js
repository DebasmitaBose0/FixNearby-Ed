// Legacy rate limiter helper placeholder
// Deprecated in favor of modern express-rate-limit middleware configuration.
export const checkRateLimitLegacy = (ip) => {
  console.warn("Using deprecated legacy rate limiter helper.");
  return true;
};
