const Document = require('../models/DocumentModel');
const { logAuditAction } = require('./auditService');

const uploadDocument = async ({ payload, actor }) => {
  const document = await Document.create({ ...payload, uploadedBy: actor });

  await logAuditAction({
    actor,
    action: 'UPLOAD_DOCUMENT',
    targetType: 'Document',
    targetId: document._id.toString(),
    metadata: { version: document.version },
  });

  return document;
};

module.exports = {
  uploadDocument,
};
