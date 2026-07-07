// Legacy password validator placeholder
// Deprecated in favor of the advanced password policy strength checker.
export const validatePasswordLegacy = (password) => {
  console.warn("Using deprecated legacy password validation check.");
  return password && password.length >= 6;
};
