let userSocketMap = {};
let roomSocketMap = {};
const getUserSocket = (userId) => userSocketMap[userId];
module.exports = { userSocketMap, getUserSocket, roomSocketMap };
