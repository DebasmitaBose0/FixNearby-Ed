export const getSecurityHeadersV2 = () => {
  return { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY' };
};
