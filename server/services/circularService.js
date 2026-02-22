const Circular = require('../models/CircularModel');
const User = require('../models/UserModel');
const { verifySignature } = require('../utils/signatureUtils');
const { logAuditAction } = require('./auditService');

const publishCircular = async ({ payload, actor }) => {
  const signer = await User.findById(actor).select('publicKey');

  const isValid = verifySignature({
    payload: payload.content,
    signature: payload.signature,
    publicKey: signer?.publicKey,
  });

  if (!isValid) {
    throw new Error('Invalid circular signature');
  }

  const circular = await Circular.create({ ...payload, publishedBy: actor });

  await logAuditAction({
    actor,
    action: 'PUBLISH_CIRCULAR',
    targetType: 'Circular',
    targetId: circular._id.toString(),
    metadata: { version: circular.version },
  });

  return circular;
};

module.exports = {
  publishCircular,
};
