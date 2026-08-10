export const renderUserPresenceDotV2 = (isOnline) => {
  return <span className={`presence-dot ${isOnline ? 'online' : 'offline'}`} />;
};
