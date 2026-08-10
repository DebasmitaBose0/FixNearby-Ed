export const emitReadReceiptV2 = (socket, messageId) => {
  if (socket) socket.emit('message_read', { messageId, readAt: new Date() });
};
