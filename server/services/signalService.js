const Signal = require('../models/SignalModel');
const { logAuditAction } = require('./auditService');

const createSignal = async ({ payload, actor }) => {
  const signal = await Signal.create(payload);

  await logAuditAction({
    actor,
    action: 'CREATE_SIGNAL',
    targetType: 'Signal',
    targetId: signal._id.toString(),
    metadata: { priority: signal.priority, requiresAck: signal.acknowledgementRequired },
  });

  return signal;
};

module.exports = {
  createSignal,
};
