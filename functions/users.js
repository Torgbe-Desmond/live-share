let userSocketMap = {};
let roomSocketMap = {};
let conversations = {};
let globalSocketReference = null;

const setGlobalSocket = (socket) => {
  globalSocketReference = socket;
};

const getUserSocket = (userId) => userSocketMap[userId];
module.exports = {
  userSocketMap,
  getUserSocket,
  roomSocketMap,
  conversations,
  globalSocketReference,
  setGlobalSocket,
};
