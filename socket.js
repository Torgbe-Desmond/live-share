const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { userSocketMap, getUserSocket } = require("./functions/users");

const app = express();
const server = http.createServer(app);

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000","https://live-share-frontend.vercel.app/"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

// Handle user connection
const handleUserConnection = async (socket, userData) => {
  try {
    const { roomName, userId } = userData || {};
    if (!roomName) {
      console.error("Missing roomName in userData");
      return;
    }

    userSocketMap[userId] = socket.id;
    const roomNameWithSuffix = `${roomName}@room`;
    socket.join(roomNameWithSuffix);

    roomSize(roomName);
  } catch (error) {
    console.error("Error handling user connection:", error);
  }
};

const sendMessageToRoom = ({ content, sender_id, roomName, username }) => {
  const roomNameWithSuffix = `${roomName}@room`;
  io.to(roomNameWithSuffix).emit("receiveMessage", {
    content,
    roomName,
    username,
    sender_id,
  });
};

// Handle socket disconnection
const handleDisconnection = (socket) => {
  try {
    // Find and remove the user associated with the disconnected socket ID
    const userId = Object.keys(userSocketMap).find(
      (id) => userSocketMap[id] === socket.id,
    );

    if (userId) {
      delete userSocketMap[userId];
    }
  } catch (error) {
    console.error("Error handling disconnection:", error);
  }
};

const roomSize = (roomName) => {
  const roomNameWithSuffix = `${roomName}@room`;
  const room = io.sockets.adapter.rooms.get(roomNameWithSuffix);
  io.to(roomNameWithSuffix).emit("roomSizeCount", {
    size: room ? room.size : 0,
  });
};

// Set up socket event listeners
const setupSocketListeners = () => {
  io.on("connection", (socket) => {
    console.log("New socket connection established:", socket.id);

    try {
      socket.on("joinRoom", (data) => {
        console.log("joinRoom event received with data:", data);
        handleUserConnection(socket, data);
      });
      socket.on("sendMessage", (data) => {
        console.log("sendMessage event received with data:", data);
        sendMessageToRoom(data);
      });
    } catch (error) {
      console.error("Invalid userData in handshake query:", error);
    }

    socket.on("disconnect", () => {
      handleDisconnection(socket);
    });
  });
};

// Initialize socket listeners
setupSocketListeners();

// Export io and related modules
module.exports = {
  io,
  app,
  server,
};
