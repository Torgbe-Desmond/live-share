// src/handlers/userHandlers.js
const { userSocketMap, roomSocketMap } = require("../functions/users");
const {
  broadcastRoomSize,
  cleanupRoomFiles,
  getRoomKey,
} = require("../helpers/roomHelpers");

async function removeUserFromTracking(io, socket) {
  const userId = Object.keys(userSocketMap).find(
    (id) => userSocketMap[id]?.socketId === socket.id
  );
  if (!userId) return;

  const userData = userSocketMap[userId];
  const roomName = userData?.room;

  delete userSocketMap[userId];
  console.log(`User ${userId} removed from tracking (socket: ${socket.id})`);

  if (roomName) {
    broadcastRoomSize(io, roomName);
    // await cleanupRoomFiles(io, roomName);
  }
}

function handleJoinRoom(io, socket, userData) {
  try {
    const { roomName, userId, username } = userData || {};
    if (!roomName || !userId) {
      console.error("Missing roomName or userId in join data");
      return;
    }

    // Store user mapping
    userSocketMap[userId] = { socketId: socket.id, room: roomName };
    const roomKey = getRoomKey(roomName);
    socket.join(roomKey);

    // Notify room
    io.to(roomKey).emit("userJoined", {
      userId,
      username,
      timestamp: new Date().toISOString(),
    });

    broadcastRoomSize(io, roomName);
  } catch (error) {
    console.error("Error in handleUserConnection:", error);
  }
}

function handleJoinRoomOnUntracked(){}

async function handleLeaveRoom(io, socket, { roomName, userId, username }) {
  try {
    if (!roomName || !userId) return;

    const roomKey = getRoomKey(roomName);

    // Remove socket from room
    socket.leave(roomKey);

    // Remove from tracking if this socket matches
    if (userSocketMap[userId]?.socketId === socket.id) {
      delete userSocketMap[userId];
    }

    // Notify remaining users
    io.to(roomKey).emit("userLeft", {
      userId,
      username,
      timestamp: new Date().toISOString(),
    });

    broadcastRoomSize(io, roomName);
    // await cleanupRoomFiles(io, roomName);
  } catch (error) {
    console.error("Error in handleLeaveRoom:", error);
  }
}

module.exports = {
  handleJoinRoom,
  handleLeaveRoom,
  removeUserFromTracking,
};