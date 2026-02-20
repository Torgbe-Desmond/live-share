const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { userSocketMap, getUserSocket } = require("./functions/users");

const app = express();
const server = http.createServer(app);

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

function getRoomNameWithSuffix(roomName) {
  return `${roomName}@room`;
}

function updateRoomSize(roomName) {
  const roomKey = getRoomNameWithSuffix(roomName);
  const room = io.sockets.adapter.rooms.get(roomKey);
  const size = room ? room.size : 0;

  // io.to(roomKey).emit("roomSizeCount", { size });
  // Optional: also emit list of users if frontend needs names
  // io.to(roomKey).emit("onlineUsers", { users: [...], count: size });
}

function removeUserFromTracking(socket) {
  const userId = Object.keys(userSocketMap).find(
    (id) => userSocketMap[id] === socket.id,
  );
  if (userId) {
    delete userSocketMap[userId];
    console.log(`User ${userId} removed from tracking (socket: ${socket.id})`);
  }
}

// ────────────────────────────────────────────────
// Connection / Join logic
// ────────────────────────────────────────────────

const handleUserConnection = (socket, userData) => {
  try {
    const { roomName, userId , username} = userData || {};
    if (!roomName || !userId) {
      console.error("Missing roomName or userId in join data");
      return;
    }

    userSocketMap[userId] = socket.id;

    const roomKey = getRoomNameWithSuffix(roomName);
    socket.join(roomKey);


     io.to(roomKey).emit("userJoined", {
      userId,
      username,
    });

  } catch (error) {
    console.error("Error in handleUserConnection:", error);
  }
};

const sendMessageToRoom = ({ content, senderId, roomName, username,replyTo }) => {
  const roomKey = getRoomNameWithSuffix(roomName);
  io.to(roomKey).emit("receiveMessage", {
    content,
    roomName,
    username,
    senderId,
    replyTo,
    timestamp: new Date().toISOString(), // optional but useful
  });
};

const handleLeaveRoom = (socket, { roomName, userId, username }) => {
  try {
    if (!roomName || !userId) return;

    const roomKey = getRoomNameWithSuffix(roomName);

    // 1. Remove from Socket.IO room
    socket.leave(roomKey);

    // 2. Remove from your user tracking
    if (userSocketMap[userId] === socket.id) {
      delete userSocketMap[userId];
    }


    // 3. Notify remaining users (optional but recommended)
    io.to(roomKey).emit("userLeft", {
      userId,
      username,
    });

    // 4. Update count for everyone left in the room
    updateRoomSize(roomName);
  } catch (error) {
    console.error("Error in handleLeaveRoom:", error);
  }
};

// ────────────────────────────────────────────────
// Socket event setup
// ────────────────────────────────────────────────

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("joinRoom", (data) => {
    handleUserConnection(socket, data);
  });

  socket.on("sendMessage", (data) => {
    sendMessageToRoom(data);
  });

  // ─── NEW: leaveRoom handler ─────────────────────
  socket.on("leaveRoom", (data) => {
    handleLeaveRoom(socket, data);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);

    // Clean up tracking when user closes tab / refreshes
    removeUserFromTracking(socket);

    // If user was in a room → update size
    // (you may need to track which room(s) each user is in)
    // For now we skip auto-update on disconnect → you can improve later
  });
});

// Export
module.exports = {
  io,
  app,
  server,
};
