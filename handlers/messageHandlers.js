// src/handlers/messageHandlers.js
const { roomSocketMap, userSocketMap } = require("../functions/users");
const {
  createConversation,
  getConversationMembers,
  cleanupConversationFiles,
  getSocketKey,
  incrementFileCount,
} = require("../helpers/conversationHelpers");
const { getRoomKey } = require("../helpers/roomHelpers");
const {
  RoomResponseObject,
  PersonalMessageResponseObject,
} = require("../models");
const uuid = require("uuid").v4;

function sendMessageToRoom(io, payload) {
  if (!payload.roomName) return;

  const roomName = payload.roomName;
  // Track uploaded files
  if (payload.files.length > 0) {
    if (!roomSocketMap[roomName]) {
      roomSocketMap[roomName] = { fileCount: 0 };
    }
    roomSocketMap[roomName].fileCount++;
  }

  const roomKey = getRoomKey(payload?.roomName);
  io.to(roomKey).emit("receiveMessage", payload);
}

async function sendPersonalMessage(io, data) {
  let currentConversationId = data.conversationId
    ? data.conversationId
    : uuid();

  createConversation(currentConversationId, from, to);

  const membersInfo = getConversationMembers(currentConversationId);
  if (!membersInfo.list.includes(to) || !membersInfo.list.includes(from)) {
    await cleanupConversationFiles(currentConversationId);
    return;
  }

  if (data.files.length > 0) incrementFileCount(currentConversationId);

  const recipientId = getSocketKey(to);
  io.to(recipientId).emit("receivePersonalMessage", data);
}

module.exports = {
  sendMessageToRoom,
  sendPersonalMessage,
};
