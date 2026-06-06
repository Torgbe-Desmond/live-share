// src/models/index.ts

// ====================== INTERFACES ======================

export interface RoomMessage {
  content: string;
  senderId: string;
  roomName: string;
  username: string;
  replyTo: any | null;
  messageId: string;
  createdAt: Date | string | null;
}

export interface PersonalMessage {
  content: string;
  username: string;
  to: string;
  from: string;
  messageId: string;
  senderId: string;
  replyTo: any;
  isRead: boolean;
  createdAt: Date | string | null;
  conversationId?: string;
}

export interface FileData {
  originalname: string;
  path: string;
  publicId: string;
  type: string;
  local: boolean;
  isSuccess: boolean;
  viewOnce: boolean;
  isFailed: boolean;
}

export interface ReplyObject {
  content: string;
  senderId: string;
  roomName: string;
  messageId: string;
  username: string;
  replyTo: ReplyObject | null;
  createdAt: Date | string | null;
}

export interface PersonalReplyObject {
  content: string;
  senderId: string;
  messageId: string;
  to: string;
  from: string;
  conversationId: string;
  replyTo: PersonalReplyObject | null;
  username: string;
  isRead: boolean;
  createdAt: Date | string | null;
}

// ====================== CLASSES (Constructors) ======================

class RoomResponseObject implements RoomMessage {
  content: string;
  senderId: string;
  roomName: string;
  username: string;
  replyTo: ReplyObject;
  messageId: string;
  createdAt: Date | string | null;

  constructor(data: Partial<RoomMessage> = {}) {
    this.content = data.content || "";
    this.senderId = data.senderId || "";
    this.roomName = data.roomName || "";
    this.username = data.username || "";
    this.replyTo = data.replyTo || null;
    this.messageId = data.messageId || "";
    this.createdAt = data.createdAt || null;
  }
}

class PersonalMessageResponseObject implements PersonalMessage {
  content: string;
  username: string;
  messageId: string;
  to: string;
  from: string;
  senderId: string;
  replyTo: PersonalReplyObject | null;
  isRead: boolean;
  createdAt: Date | string | null;
  conversationId?: string;

  constructor(data: Partial<PersonalMessage> = {}) {
    this.content = data.content || "";
    this.username = data.username || "";
    this.to = data.to || "";
    this.from = data.from || "";
    this.messageId = data.messageId || "";
    this.senderId = data.senderId || "";
    this.replyTo = data.replyTo || null;
    this.isRead = false;
    this.createdAt = data.createdAt || null;
    this.conversationId = data.conversationId || "";
  }
}

class FileObject implements FileData {
  originalname: string;
  path: string;
  publicId: string;
  type: string;
  local: boolean;
  isSuccess: boolean;
  viewOnce: boolean;
  isFailed: boolean;

  constructor(file: any, uploaded: any) {
    this.originalname = file.originalname;
    this.path = uploaded.url;
    this.publicId = uploaded.publicId;
    this.type = file.mimetype;
    this.local = false;
    this.isSuccess = true;
    this.viewOnce = false;
    this.isFailed = false;
  }
}

class FirebaseFileObject implements FileData {
  originalname: string;
  path: string;
  publicId: string;
  type: string;
  local: boolean;
  isSuccess: boolean;
  viewOnce: boolean;
  isFailed: boolean;

  constructor(file: any, uploaded: any) {
    this.originalname = file.originalname;
    this.path = uploaded.url;
    this.publicId = uploaded.publicId;
    this.type = file.mimetype;
    this.local = false;
    this.isSuccess = true;
    this.viewOnce = false;
    this.isFailed = false;
  }
}

// ====================== EXPORTS ======================
export {
  RoomResponseObject,
  PersonalMessageResponseObject,
  FileObject,
  FirebaseFileObject,
};
