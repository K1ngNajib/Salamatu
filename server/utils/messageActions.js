const { isValidObjectId } = require('mongoose');
const { hasPermission } = require('../services/roleService');

const MAX_MESSAGE_EXPIRY_MINUTES = 60 * 24 * 7; // 7 days

/**
 * Parse and validate a message expiry timestamp.
 * Returns a Date instance or null when no expiry is provided.
 */
const parseMessageExpiry = (expiresAt, now = new Date()) => {
  if (!expiresAt) return null;

  const parsed = new Date(expiresAt);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('ValidationError: Invalid expiry timestamp');
  }

  if (parsed <= now) {
    throw new Error('ValidationError: Expiry timestamp must be in the future');
  }

  const maxWindowMs = MAX_MESSAGE_EXPIRY_MINUTES * 60 * 1000;
  if (parsed.getTime() - now.getTime() > maxWindowMs) {
    throw new Error(`ValidationError: Expiry cannot exceed ${MAX_MESSAGE_EXPIRY_MINUTES} minutes`);
  }

  return parsed;
};

/**
 * Validate message send payload against authenticated socket user.
 */
const validateMessagePayload = ({ payload, actor }) => {
  const actorId = actor?._id?.toString();
  const sender = payload?.sender?.toString();
  const msgByUserId = payload?.msgByUserId?.toString();
  const receiver = payload?.receiver?.toString();

  if (!actorId || !sender || !msgByUserId || !receiver) {
    throw new Error('ValidationError: Missing required messaging identifiers');
  }

  if (sender !== actorId || msgByUserId !== actorId) {
    throw new Error('AuthorizationError: Sender mismatch for authenticated user');
  }

  if (!isValidObjectId(receiver)) {
    throw new Error('ValidationError: Invalid recipient identifier');
  }

  const hasContent = Boolean(payload?.textForRecipient || payload?.textForSender || payload?.imageUrl || payload?.videoUrl);
  if (!hasContent) {
    throw new Error('ValidationError: Message content is required');
  }

  if (payload?.isOfficial && !hasPermission(actor?.role, 'issue_directives')) {
    throw new Error('AuthorizationError: User is not allowed to send official messages');
  }

  return {
    sender,
    receiver,
    msgByUserId,
    textForRecipient: payload?.textForRecipient || '',
    textForSender: payload?.textForSender || '',
    imageUrl: payload?.imageUrl || '',
    videoUrl: payload?.videoUrl || '',
    signature: payload?.signature || '',
    isOfficial: Boolean(payload?.isOfficial),
    expiresAt: parseMessageExpiry(payload?.expiresAt),
  };
};

/**
 * Ensure only the author can recall a non-recalled message.
 */
const validateRecallRequest = ({ message, actorId, messageId }) => {
  if (!isValidObjectId(messageId)) {
    throw new Error('ValidationError: Invalid message identifier');
  }

  if (!message) {
    throw new Error('NotFoundError: Message not found');
  }

  if (message.msgByUserId?.toString() !== actorId?.toString()) {
    throw new Error('AuthorizationError: Cannot recall a message from another user');
  }

  if (message.recalledAt) {
    throw new Error('ValidationError: Message has already been recalled');
  }
};

module.exports = {
  MAX_MESSAGE_EXPIRY_MINUTES,
  parseMessageExpiry,
  validateMessagePayload,
  validateRecallRequest,
};
