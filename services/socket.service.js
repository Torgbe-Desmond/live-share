// src/services/socket.service.js
let ioInstance = null;

function setGlobalIO(io) {
  ioInstance = io;
}

function getGlobalIO() {
  if (!ioInstance) throw new Error("Socket.IO instance not initialized!");
  return ioInstance;
}

module.exports = { setGlobalIO, getGlobalIO };