// src/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const {
  handleJoinRoom,
  handleLeaveRoom,
  removeUserFromTracking,
} = require("./handlers/userHandlers");

const {
  sendMessageToRoom,
  sendPersonalMessage,
} = require("./handlers/messageHandlers");
const { setGlobalSocket } = require("./functions/users");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://live-share-frontend.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

// Add this BEFORE io.on("connection", ...)
io.use((socket, next) => {
  const query = socket.handshake.query;

  // Optional: early validation
  if (!query.storedUserId || !query.storedUsername) {
    console.warn("Missing required identity in query");
    // You can still let it connect or reject it:
    // return next(new Error("missing_identity"));
  }

  next();
});

// Then your normal connection handler
io.on("connection", (socket) => {
  console.log(
    `New connection: ${socket.id} | UserID from query: ${socket.handshake.query.storedUserId || "unknown"}`,
  );

  const userInfo = {
    storedUserId: socket.handshake.query.storedUserId || undefined, // will be ignored if undefined
    storedRoomName: socket.handshake.query.storedRoomName || undefined,
    storedUsername: socket.handshake.query.storedUsername || undefined,
  };

  handleJoinRoom(io, socket, userInfo);
  
  socket.on("joinRoom", (data) => handleJoinRoom(io, socket, data));
  socket.on("leaveRoom", (data) => handleLeaveRoom(io, socket, data));

  socket.on("disconnect", () => removeUserFromTracking(io, socket));
});

// ── Export ────────────────────────────────────
module.exports = { io, app, server };
