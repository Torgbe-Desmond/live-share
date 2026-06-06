// src/server.ts
import express from "express";
import http from "http";
import { Server } from "socket.io";

import {
  handleJoinRoom,
  handleLeaveRoom,
  removeUserFromTracking,
} from "./handlers/userHandlers";

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

// Middleware for authentication / query validation
io.use((socket, next) => {
  const query = socket.handshake.query;

  if (!query.userId || !query.username) {
    console.warn("Missing required identity in query");
    // Uncomment to reject connection:
    // return next(new Error("missing_identity"));
  }

  next();
});

io.on("connection", (socket) => {
  console.log(
    `New connection: ${socket.id} | UserID from query: ${socket.handshake.query.userId || "unknown"}`,
  );

  socket.on("joinRoom", (data) => handleJoinRoom(io, socket, data));
  socket.on("leaveRoom", (data) => handleLeaveRoom(io, socket, data));
  socket.on("disconnect", () => removeUserFromTracking(io, socket));
});

// ── Export ────────────────────────────────────
export { io, app, server };