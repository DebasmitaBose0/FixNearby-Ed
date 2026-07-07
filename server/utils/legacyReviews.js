// Legacy reviews helper placeholder
// Deprecated in favor of the Review Response Controller and schema extension.
export const processReviewResponseLegacy = (reviewId, responseText) => {
  console.warn("Using deprecated review response helper.");
  return { reviewId, responseText, processed: false };
};
