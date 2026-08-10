export const monitorDbPoolState = (connection) => {
  return { readyState: connection ? 1 : 0 };
};
