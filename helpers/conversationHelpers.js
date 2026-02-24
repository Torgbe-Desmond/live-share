const {
  userSocketMap,
  getUserSocket,
  conversations,
} = require("../functions/users");
const FileService = require("../services/file.service");
const fileService = new FileService();

function getSocketKey(userId) {
  return userSocketMap[userId].socketId;
}

function getConversationSize(conversationId) {
  if (!checkConverstationAvailability(conversationId)) {
    return;
  }
  return conversations[conversationId].list.length;
}

function checkConverstationAvailability(conversationId) {
  return conversations[conversationId] ? true : false;
}

function createConversation(conversationId = null, from, to) {
  if (checkConverstationAvailability(conversationId)) {
    return;
  }
  conversations[conversationId] = {
    list: [],
    fileCount: 0,
  };
  conversations[conversationId].list = [from, to];
}

function incrementFileCount(conversationId) {
  conversations[conversationId].fileCount++;
}

function getConversationMembers(conversationId) {
  return conversations[conversationId];
}

async function cleanupConversationFiles(conversationId) {
  if (!conversationId) return;
  const size = getConversationSize(conversationId);
  // 2 return , 1 continue
  if (size > 1) return;

  const fileCount = conversations[conversationId].fileCount;
  if (!Number(fileCount) || fileCount === 0) {
    delete conversations[conversationId];
    return;
  }

  console.log(
    `Conversation ${conversationId} is empty → cleaning up ${fileCount} files`,
  );

  try {
    if (fileCount > 0) {
      await fileService.deleteAsync(conversationId);
      console.log(`Deleted all files in conversation: ${conversationId}`);
    }
  } catch (err) {
    console.error(err.message);
  }

  delete roomSocketMap[roomName];
}

module.exports = {
  getSocketKey,
  cleanupConversationFiles,
  incrementFileCount,
  createConversation,
  getConversationMembers,
};
