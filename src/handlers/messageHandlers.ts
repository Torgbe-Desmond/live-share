// src/handlers/messageHandlers.ts
import { Server } from "socket.io";

import {
  createConversation,
  getSocketKey,
} from "../helpers/conversationHelpers";

import { getRoomKey } from "../helpers/roomHelpers";

import {
  RoomResponseObject,
  PersonalMessageResponseObject,
} from "../models/index";

import { v4 as uuidv4 } from "uuid";

// ====================== TYPES ======================
interface MessagePayload extends RoomResponseObject {
  content: string;
  senderId: string;
  roomName: string;
  username: string;
  replyTo: any | null;
  messageId: string;
  createdAt: Date | string | null;
}

interface PersonalMessagePayload extends PersonalMessageResponseObject {
  from: string;
  to: string;
  conversationId?: string;
  files?: any[];
}

// ====================== HANDLERS ======================

/**
 * Send message to all users in a room
 */
function sendMessageToRoom(io: Server, payload: MessagePayload): void {
  if (!payload.roomName) return;

  const roomKey = getRoomKey(payload.roomName);
  io.to(roomKey).emit("receiveMessage", payload);
}

/**
 * Send personal (private) message
 */
async function sendPersonalMessage(
  io: Server,
  data: PersonalMessagePayload,
): Promise<void> {
  const { from, to } = data;
  let currentConversationId = data.conversationId
    ? data.conversationId
    : uuidv4();

  createConversation(currentConversationId, from, to);

  const recipientId = getSocketKey(to);
  io.to(recipientId).emit("receivePersonalMessage", data);
}

// ====================== EXPORTS ======================
export { sendMessageToRoom, sendPersonalMessage };
