// src/handlers/userHandlers.ts
import { Server, Socket } from "socket.io";
import { userSocketMap, roomSocketMap } from "../functions/users";
import { getSocketKey } from "../helpers/conversationHelpers";
import {
  broadcastRoomSize,
  getRoomKey,
  getPeopleInRoom,
} from "../helpers/roomHelpers";

// Define types
interface UserData {
  userId: string;
  username: string;
  room?: string;
}

interface RoomUser {
  userId: string;
  username: string;
}

interface JoinRoomData extends UserData {
  roomName: string;
}

interface LeaveRoomData extends UserData {
  roomName: string;
}

// Remove user from global tracking
async function removeUserFromTracking(io: Server, socket: Socket): Promise<void> {
  const userId = Object.keys(userSocketMap).find(
    (id) => userSocketMap[id]?.socketId === socket.id
  );

  if (!userId) return;

  const userData = userSocketMap[userId];
  const roomName = userData?.room;

  delete userSocketMap[userId];
  console.log(`User ${userId} removed from tracking (socket: ${socket.id})`);

  if (roomName) {
    broadcastRoomSize(io, roomName);
  }
}

// Handle user joining a room
function handleJoinRoom(io: Server, socket: Socket, userData: JoinRoomData): void {
  try {
    const { roomName, userId, username } = userData || {};

    if (!roomName || !userId) {
      console.error("Missing roomName or userId in join data");
      socket.emit("error", { message: "Missing roomName or userId" });
      return;
    }

    const roomKey = getRoomKey(roomName);
    const userInfo: RoomUser = { userId, username };

    // Join the room
    socket.join(roomKey);

    // Update user's socket mapping
    userSocketMap[userId] = { socketId: socket.id, room: roomKey };

    // Initialize room if it doesn't exist
    if (!roomSocketMap[roomKey]) {
      roomSocketMap[roomKey] = {
        fileCount: 0,
        users: [userInfo],
      };
    } else {
      // Check if user is already in the room
      const userExists = roomSocketMap[roomKey].users.some(
        (u) => u.userId === userId
      );

      if (userExists) {
        // User is rejoining (e.g. page refresh)
        io.to(roomKey).emit("userJoined", userInfo);
      } else {
        // New user joining
        roomSocketMap[roomKey].users.push(userInfo);

        // Send current room members to the new user
        const peopleInRoom = getPeopleInRoom(roomKey);
        const recipientSocketId = getSocketKey(userId);

        io.to(recipientSocketId).emit("newlyJoinedUser", peopleInRoom);

        // Notify others
        socket.to(roomKey).emit("userJoined", userInfo);
      }
    }

    // Always broadcast updated room size
    broadcastRoomSize(io, roomName);
  } catch (error) {
    console.error("Error in handleJoinRoom:", error);
    socket.emit("error", { message: "Failed to join room" });
  }
}


// Handle user leaving a room
async function handleLeaveRoom(
  io: Server,
  socket: Socket,
  { roomName, userId, username }: LeaveRoomData
): Promise<void> {
  try {
    if (!roomName || !userId) return;

    const roomKey = getRoomKey(roomName);

    // Remove socket from room
    socket.leave(roomKey);

    // Remove from tracking if this socket matches
    if (userSocketMap[userId]?.socketId === socket.id) {
      delete userSocketMap[userId];
    }

    // Notify remaining users
    io.to(roomKey).emit("userLeft", {
      userId,
      username,
      timestamp: new Date().toISOString(),
    });

    broadcastRoomSize(io, roomName);
  } catch (error) {
    console.error("Error in handleLeaveRoom:", error);
  }
}

// Exports
export {
  handleJoinRoom,
  handleLeaveRoom,
  removeUserFromTracking,
};