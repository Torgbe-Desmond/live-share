const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const {
  userSocketMap,
  // getUserSocket,   // if not used, you can remove it
  roomSocketMap,
} = require("./functions/users");

const app = express();
const server = http.createServer(app);
const FileService = require("./services/file.service");
const fileService = new FileService();

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://live-share-frontend.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────

function getRoomKey(roomName) {
  return `${roomName}@room`;
}

function getRoomSize(roomName) {
  const roomKey = getRoomKey(roomName);
  const room = io.sockets.adapter.rooms.get(roomKey);
  return room ? room.size : 0;
}

function broadcastRoomSize(roomName) {
  if (!roomName) return;
  const size = getRoomSize(roomName);
  const roomKey = getRoomKey(roomName);
  io.to(roomKey).emit("roomSizeCount", { size });
  console.log(`Room ${roomName} size updated: ${size} users`);
}

async function cleanupRoomFiles(roomName) {
  if (!roomName) return;

  const size = getRoomSize(roomName);
  if (size > 0) return; // only clean when truly empty

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
      console.error(
        `Failed to delete file ${file?.publicId || "unknown"}:`,
        err,
      );
    }
  }

  delete roomSocketMap[roomName];
}

async function removeUserFromTracking(socket) {
  const userId = Object.keys(userSocketMap).find(
    (id) => userSocketMap[id]?.socketId === socket.id,
  );

  if (!userId) return;

  const userData = userSocketMap[userId];
  const roomName = userData?.room;

  delete userSocketMap[userId];
  console.log(`User ${userId} removed from tracking (socket: ${socket.id})`);

  if (roomName) {
    broadcastRoomSize(roomName);
    await cleanupRoomFiles(roomName);
    
  }
}

// ────────────────────────────────────────────────
// Connection / Join logic
// ────────────────────────────────────────────────

function handleUserConnection(socket, userData) {
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

    // Notify room (including the joining user)
    io.to(roomKey).emit("userJoined", {
      userId,
      username,
      timestamp: new Date().toISOString(),
    });

    // Update and broadcast current room size
    broadcastRoomSize(roomName);
  } catch (error) {
    console.error("Error in handleUserConnection:", error);
  }
}

function sendMessageToRoom({
  content,
  senderId,
  roomName,
  username,
  replyTo,
  file,
}) {
  if (!roomName) return;

  // Store file reference if present
  if (file) {
    if (!Array.isArray(roomSocketMap[roomName])) {
      roomSocketMap[roomName] = [];
    }
    roomSocketMap[roomName].push(file);
  }

  const roomKey = getRoomKey(roomName);
  io.to(roomKey).emit("receiveMessage", {
    content,
    roomName,
    username,
    senderId,
    replyTo,
    file,
    timestamp: new Date().toISOString(),
  });
}

async function handleLeaveRoom(socket, { roomName, userId, username }) {
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

    // Update size and check for cleanup
    broadcastRoomSize(roomName);
    await cleanupRoomFiles(roomName);
  } catch (error) {
    console.error("Error in handleLeaveRoom:", error);
  }
}

// ────────────────────────────────────────────────
// Socket event setup
// ────────────────────────────────────────────────

io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on("joinRoom", (data) => {
    handleUserConnection(socket, data);
  });

  socket.on("sendMessage", (data) => {
    console.log("message", data);
    sendMessageToRoom(data);
  });

  socket.on("leaveRoom", (data) => {
    handleLeaveRoom(socket, data);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
    removeUserFromTracking(socket);
  });
});

// Export
module.exports = {
  io,
  app,
  server,
  sendMessageToRoom,
};
