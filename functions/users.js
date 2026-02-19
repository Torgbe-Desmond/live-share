let userSocketMap = {};
const getUserSocket = (userId) => userSocketMap[userId];
module.exports = { userSocketMap, getUserSocket };
