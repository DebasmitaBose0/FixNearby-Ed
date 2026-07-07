// Legacy health checker placeholder
// Deprecated in favor of the automated database diagnostics and healthcheck router.
export const checkHealthLegacy = () => {
  console.warn("Using deprecated legacy health check function.");
  return { status: "OK", database: "connected" };
};
