export const maskPiiEmail = (email) => {
  if (!email) return email;
  const [user, domain] = email.split('@');
  return `${user[0]}***@${domain}`;
};
