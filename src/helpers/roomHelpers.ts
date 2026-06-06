// src/helpers/roomHelpers.ts
import { Server } from "socket.io";
import {
  roomSocketMap,
  userSocketMap,
  UserSocketInfo,
} from "../functions/users";

// ====================== TYPES ======================
interface RoomUser {
  userId: string;
  username: string;
}

interface UserRoomStatus {
  currentlyInRoom: boolean;
  wasPreviouslyInRoom: boolean;
  disconnectedFromRoom?: boolean;
}

// ====================== HELPERS ======================

/**
 * Generate standardized room key
 */
function getRoomKey(roomName: string): string {
  return `${roomName}@room`;
}

/**
 * Get current number of users in a Socket.IO room
 */
function getRoomSize(io: Server, roomName: string): number {
  const roomKey = getRoomKey(roomName);
  const room = io.sockets.adapter.rooms.get(roomKey);
  return room ? room.size : 0;
}

/**
 * Check user's current and previous room status
 */
function getUserRoomStatus(
  io: Server,
  userId: string,
  roomName: string,
): UserRoomStatus {
  if (!userSocketMap[userId]) {
    return {
      currentlyInRoom: false,
      wasPreviouslyInRoom: false,
    };
  }

  const entry: UserSocketInfo = userSocketMap[userId];
  const socketId = entry.socketId;
  const socket = io.sockets.sockets.get(socketId);

  const roomKey = getRoomKey(roomName);
  const currentlyInRoom = (socket && socket.rooms.has(roomKey)) || false;

  const wasPreviouslyInRoom = entry.room === roomKey; // using roomKey for consistency

  return {
    currentlyInRoom,
    wasPreviouslyInRoom,
    disconnectedFromRoom: wasPreviouslyInRoom && !currentlyInRoom,
  };
}

/**
 * Get list of people currently in the room (from our tracking)
 */
function getPeopleInRoom(roomName: string): RoomUser[] {
  const roomKey = getRoomKey(roomName);
  return Array.isArray(roomSocketMap[roomKey]?.users)
    ? roomSocketMap[roomKey].users
    : [];
}

/**
 * Broadcast current room size to all users in the room
 */
function broadcastRoomSize(io: Server, roomName: string): void {
  if (!roomName) return;

  const size = getRoomSize(io, roomName);
  const roomKey = getRoomKey(roomName);

  io.to(roomKey).emit("roomSizeCount", { size });
  console.log(`Room ${roomName} size updated: ${size} users`);
}

// ====================== EXPORTS ======================
export {
  getRoomKey,
  getRoomSize,
  getPeopleInRoom,
  broadcastRoomSize,
  getUserRoomStatus,
};
