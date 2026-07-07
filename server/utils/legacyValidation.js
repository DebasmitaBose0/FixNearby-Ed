// Legacy validation helper placeholder
// Deprecated in favor of the structured Joi/Zod or customized request validation middleware.
export const validatePayloadLegacy = (data) => {
  console.warn("Using deprecated legacy payload validation helper.");
  return { error: null, value: data };
};
