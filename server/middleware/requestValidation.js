const { isNonEmptyString, areValidObjectIds, isValidObjectId } = require('../utils/validation');

/**
 * Shared request validators for administrative workflow endpoints.
 */
const requireFields = (fields) => (req, res, next) => {
  const missing = fields.filter((field) => req.body?.[field] === undefined || req.body?.[field] === null || req.body?.[field] === '');

  if (missing.length > 0) {
    return res.status(400).json({
      error: true,
      message: `Missing required fields: ${missing.join(', ')}`,
    });
  }

  return next();
};

const validateOrderPayload = (req, res, next) => {
  const { title, body, signature, recipients } = req.body;

  if (!isNonEmptyString(title) || !isNonEmptyString(body) || !isNonEmptyString(signature)) {
    return res.status(400).json({ error: true, message: 'Order title/body/signature must be non-empty strings.' });
  }

  if (!areValidObjectIds(recipients)) {
    return res.status(400).json({ error: true, message: 'Order recipients must be a non-empty list of valid user ids.' });
  }

  return next();
};

const validateSignalPayload = (req, res, next) => {
  if (!isNonEmptyString(req.body.message)) {
    return res.status(400).json({ error: true, message: 'Signal message must be a non-empty string.' });
  }

  if (!areValidObjectIds(req.body.recipients)) {
    return res.status(400).json({ error: true, message: 'Signal recipients must be a non-empty list of valid user ids.' });
  }

  return next();
};

const validateChannelMemberPayload = (req, res, next) => {
  if (!isValidObjectId(req.body.memberId)) {
    return res.status(400).json({ error: true, message: 'memberId must be a valid user id.' });
  }

  return next();
};

const validateChannelMessagePayload = (req, res, next) => {
  if (!isValidObjectId(req.body.messageId)) {
    return res.status(400).json({ error: true, message: 'messageId must be a valid message id.' });
  }

  return next();
};

module.exports = {
  requireFields,
  validateOrderPayload,
  validateSignalPayload,
  validateChannelMemberPayload,
  validateChannelMessagePayload,
};
