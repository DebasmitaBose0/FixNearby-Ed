export const getSecureCookieConfigV2 = () => {
  return { httpOnly: true, sameSite: 'strict', secure: true };
};
