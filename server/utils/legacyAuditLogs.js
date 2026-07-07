// Legacy audit logs helper placeholder
// Deprecated in favor of structured express audit log middleware.
export const logActivityLegacy = (action, details) => {
  console.warn("Using deprecated legacy activity logger.");
  return { action, details, timestamp: new Date() };
};
