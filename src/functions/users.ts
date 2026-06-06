// src/functions/users.ts

// ====================== TYPES ======================
interface UserSocketInfo {
  socketId: string;
  room: string;           // roomKey
}

interface RoomInfo {
  fileCount: number;
  users: Array<{
    userId: string;
    username: string;
  }>;
}

interface Conversation {
  // Add properties as you discover them in your code
  [key: string]: any;
}

// ====================== STATE ======================
let userSocketMap: Record<string, UserSocketInfo> = {};
let roomSocketMap: Record<string, RoomInfo> = {};
let conversations: Record<string, Conversation> = {};
let globalSocketReference: any = null;   // You can tighten this later

// ====================== FUNCTIONS ======================
const setGlobalSocket = (socket: any): void => {
  globalSocketReference = socket;
};

const getUserSocket = (userId: string): UserSocketInfo | undefined => {
  return userSocketMap[userId];
};

// ====================== EXPORTS ======================
export {
  userSocketMap,
  roomSocketMap,
  conversations,
  globalSocketReference,
  setGlobalSocket,
  getUserSocket,
};

// Optional: Export types for use in other files
export type { UserSocketInfo, RoomInfo, Conversation };