// src/helpers/roomHelpers.js
const { roomSocketMap, userSocketMap } = require("../functions/users");
const FileService = require("../services/file.service");
const fileService = new FileService();

function getRoomKey(roomName) {
  return `${roomName}@room`;
}

function getRoomSize(io, roomName) {
  const roomKey = getRoomKey(roomName);
  const room = io.sockets.adapter.rooms.get(roomKey);
  return room ? room.size : 0;
}

function getUserRoomStatus(io, userId, roomName) {
  if (!userSocketMap[userId]) {
    return {
      currentlyInRoom: false,
      wasPreviouslyInRoom: false,
    };
  }

  const entry = userSocketMap[userId];
  const socketId = entry.socketId;
  const socket = io.sockets.sockets.get(socketId);

  const roomKey = getRoomKey(roomName);

  const currentlyInRoom = socket && socket.rooms.has(roomKey);

  // If you store last known room when they join/leave
  const wasPreviouslyInRoom = entry.room === roomName;

  return {
    currentlyInRoom,
    wasPreviouslyInRoom,
    disconnectedFromRoom: wasPreviouslyInRoom && !currentlyInRoom,
  };
}

function broadcastRoomSize(io, roomName) {
  if (!roomName) return;
  const size = getRoomSize(io, roomName);
  const roomKey = getRoomKey(roomName);
  io.to(roomKey).emit("roomSizeCount", { size });
  console.log(`Room ${roomName} size updated: ${size} users`);
}

async function cleanupRoomFiles(io, roomName) {
  if (!roomName) return;
  const size = getRoomSize(io, roomName);
  if (size > 0) return; // Only clean when empty

  if (!roomSocketMap[roomName] && roomSocketMap[roomName]?.fileCount === 0) {
    delete roomSocketMap[roomName];
    return;
  }

  console.log(`Room ${roomName} is empty → cleaning up ${fileCount} files`);

  if (fileCount > 0) {
    await fileService.deleteAsync(roomName);
    console.log(`Deleted all files in room: ${roomName}`);
  }

  delete roomSocketMap[roomName];
}

module.exports = {
  getRoomKey,
  getRoomSize,
  broadcastRoomSize,
  cleanupRoomFiles,
  getUserRoomStatus,
};
