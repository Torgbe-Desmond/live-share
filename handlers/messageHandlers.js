// src/handlers/messageHandlers.js
const { roomSocketMap } = require("../functions/users");
const { getRoomKey } = require("../helpers/roomHelpers");

function sendMessageToRoom(
  io,
  { content, senderId, roomName, username, replyTo, files, createdAt },
) {

  if (!roomName) return;

  // Track uploaded files
  if (files) {
    if (!Array.isArray(roomSocketMap[roomName])) roomSocketMap[roomName] = [];
    roomSocketMap[roomName].push(...files);
  } 

  const roomKey = getRoomKey(roomName);
  io.to(roomKey).emit("receiveMessage", {
    content,
    roomName,
    username,
    senderId,
    replyTo,
    files,
    createdAt,
  });
}

module.exports = {
  sendMessageToRoom,
};
