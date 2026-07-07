// Legacy favorites manager placeholder
// Deprecated in favor of Decoupled Favorite Service handling Mongoose interactions.
export const saveFavoriteLegacy = (userId, workerId) => {
  console.warn("Using deprecated legacy save favorite handler.");
  return { userId, workerId, saved: true };
};
