const AuditLog = require('../models/AuditLogModel');

const logAuditAction = async ({ actor, action, targetType, targetId, metadata = {} }) => {
  return AuditLog.create({ actor, action, targetType, targetId, metadata });
};

module.exports = { logAuditAction };
