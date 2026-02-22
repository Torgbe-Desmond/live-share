// src/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const {
  handleUserConnection,
  handleLeaveRoom,
  removeUserFromTracking,
} = require("./handlers/userHandlers");

const { sendMessageToRoom } = require("./handlers/messageHandlers");

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

// ── Socket events ─────────────────────────────
io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on("joinRoom", (data) => handleUserConnection(io, socket, data));
  socket.on("sendMessage", (data) => sendMessageToRoom(io, data));
  socket.on("leaveRoom", (data) => handleLeaveRoom(io, socket, data));
  socket.on("disconnect", () => removeUserFromTracking(io, socket));
});

// ── Export ────────────────────────────────────
module.exports = { io, app, server };