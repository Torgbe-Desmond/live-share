// src/helpers/roomHelpers.js
const { roomSocketMap } = require("../functions/users");
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

  const files = roomSocketMap[roomName];
  if (!Array.isArray(files) || files.length === 0) {
    delete roomSocketMap[roomName];
    return;
  }

  console.log(`Room ${roomName} is empty → cleaning up ${files.length} files`);

  for (const file of files) {
    try {
      if (file?.publicId) {
        await fileService.deleteAsync(roomName);
        console.log(`Deleted all files in room: ${roomName}`);
      }
    } catch (err) {
      console.error(`Failed to delete file ${file?.publicId || "unknown"}:`, err);
    }
  }

  delete roomSocketMap[roomName];
}

module.exports = {
  getRoomKey,
  getRoomSize,
  broadcastRoomSize,
  cleanupRoomFiles,
};