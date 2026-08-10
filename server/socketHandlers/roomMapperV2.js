export const mapSocketToRoomV2 = (socket, roomId) => {
  if (socket) socket.join(roomId);
};
