// src/controllers/messageController.ts
import { Request, Response } from "express";
import { io } from "../server"; // Adjust path if needed

import {
  sendMessageToRoom,
  sendPersonalMessage,
} from "../handlers/messageHandlers";

import {
  RoomResponseObject,
  PersonalMessageResponseObject,
  PersonalReplyObject,
} from "../models";

// ====================== RESPONSE HELPERS ======================

const success = (res: Response, data: any = null, status: number = 200) => {
  return res.status(status).json({
    success: true,
    data,
  });
};

const error = (
  res: Response,
  message: string = "Something went wrong",
  status: number = 400,
) => {
  return res.status(status).json({
    success: false,
    error: message,
  });
};

// ====================== TYPES ======================

interface ReplyObject {
  content: string;
  senderId: string;
  roomName: string;
  messageId: string;
  username: string;
  replyTo: ReplyObject | null;
  createdAt: string;
}

interface RoomRequestObject {
  roomName: string;
  content: string;
  senderId: string;
  username: string;
  replyTo: ReplyObject;
  messageId: string;
}

interface PersonalRequestObject {
  conversationId: string;
  content: string;
  senderId: string;
  username: string;
  replyTo: PersonalReplyObject | null;
  messageId: string;
  to: string;
  from: string;
}

// ====================== CONTROLLER ======================

class MessageController {
  async addMessage(req: Request, res: Response): Promise<Response> {
    try {
      const { roomName, content, senderId, username, replyTo, messageId } =
        req.body as RoomRequestObject;

      if (!roomName || !senderId) {
        return error(res, "roomName and senderId are required", 400);
      }

      // Build message payload using interface
      const payload: RoomResponseObject = {
        content: content || "",
        senderId,
        roomName,
        messageId: messageId || "",
        username: username || "",
        replyTo,
        createdAt: new Date(),
      };

      sendMessageToRoom(io, payload);

      return success(res, payload, 201);
    } catch (err: any) {
      console.error("AddMessage Error:", err);
      return error(res, err.message || "Failed to create message", 500);
    }
  }

  async addPersonalMessage(req: Request, res: Response): Promise<Response> {
    try {
      const {
        conversationId,
        content,
        senderId,
        username,
        replyTo,
        messageId,
        to,
        from,
      } = req.body as PersonalRequestObject;

      if (!conversationId || !senderId) {
        return error(res, "conversationId and senderId are required", 400);
      }
      // Build personal message payload
      const payload: PersonalMessageResponseObject = {
        content: content || "",
        senderId,
        messageId: messageId || "",
        to: to || "",
        from: from || "",
        conversationId,
        username: username || "",
        replyTo,
        isRead: false,
        createdAt: new Date(),
      };
      
      sendPersonalMessage(io, payload);

      return success(res, payload, 201);
    } catch (err: any) {
      console.error("AddPersonalMessage Error:", err);
      return error(res, err.message || "Failed to create message", 500);
    }
  }
}

export default new MessageController();
