// src/helpers/conversationHelpers.ts
import { conversations, getUserSocket } from "../functions/users";

// ====================== TYPES ======================
interface Conversation {
  list?: Array<string | { userId: string; username?: string }>;
}

// ====================== HELPERS ======================

/**
 * Get socket ID for a user
 */
function getSocketKey(userId: string): string {
  return getUserSocket(userId)?.socketId || "";
}

/**
 * Get number of messages/files in a conversation
 */
function getConversationSize(conversationId: string): number | void {
  if (!checkConversationAvailability(conversationId)) {
    return;
  }

  if (
    conversations[conversationId] &&
    Array.isArray(conversations[conversationId].list)
  ) {
    return conversations[conversationId].list.length;
  }

  return 0;
}

/**
 * Check if conversation exists
 * (Fixed typo from original: "Converstation" → "Conversation")
 */
function checkConversationAvailability(conversationId: string): boolean {
  return !!conversations[conversationId];
}

/**
 * Create a new conversation if it doesn't exist
 */
function createConversation(
  conversationId: string | null,
  from: string,
  to: string,
): void {
  if (!conversationId || checkConversationAvailability(conversationId)) {
    return;
  }

  conversations[conversationId] = {
    list: [from, to],
    fileCount: 0,
  };
}

/**
 * Get full conversation object
 */
function getConversationMembers(
  conversationId: string,
): Conversation | undefined {
  return conversations[conversationId];
}

// ====================== EXPORTS ======================
export {
  getSocketKey,
  getConversationSize,
  checkConversationAvailability,
  createConversation,
  getConversationMembers,
};
