export const handleHeartbeatPing = (socket) => {
  if (socket) socket.emit('heartbeat_pong', { timestamp: Date.now() });
};
