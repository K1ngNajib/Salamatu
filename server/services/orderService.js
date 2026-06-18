const Order = require('../models/OrderModel');
const User = require('../models/UserModel');
const { verifySignature } = require('../utils/signatureUtils');
const { logAuditAction } = require('./auditService');
const { buildOrderLookupQuery } = require('../utils/orderLookup');
const { canTransitionOrderStatus } = require('../utils/orderLifecycle');
const socketEventBus = require('../socket/eventBus');

const createOrder = async ({ payload, actor }) => {
  const signer = await User.findById(actor).select('publicKey');
  const isValidSignature = verifySignature({
    payload: payload.body,
    signature: payload.signature,
    publicKey: signer?.publicKey,
  });

  if (!isValidSignature) {
    throw new Error('Invalid digital signature for order payload.');
  }

  const order = await Order.create({
    ...payload,
    issuingAuthority: actor,
  });

  await logAuditAction({
    actor,
    action: 'CREATE_ORDER',
    targetType: 'Order',
    targetId: order._id.toString(),
    metadata: { priority: order.priority, recipientCount: order.recipients.length },
  });

  socketEventBus.emit('order:updated', { orderId: order._id.toString(), recipients: order.recipients.map((r) => r.toString()) });

  return order;
};

const acknowledgeOrder = async ({ orderId, actor }) => {
  const lookupQuery = buildOrderLookupQuery(orderId);
  const order = await Order.findOne(lookupQuery);
  if (!order) throw new Error('Order not found');

  const isRecipient = order.recipients.some((recipient) => recipient.toString() === actor.toString());
  if (!isRecipient) {
    throw new Error('Only recipients can acknowledge this order');
  }

  const alreadyAcknowledged = order.acknowledgements.some((ack) => ack.user.toString() === actor.toString());
  if (!alreadyAcknowledged) {
    order.acknowledgements.push({ user: actor });
  }

  if (order.acknowledgements.length >= order.recipients.length) {
    order.status = 'Acknowledged';
  }

  await order.save();

  await logAuditAction({
    actor,
    action: 'ACKNOWLEDGE_ORDER',
    targetType: 'Order',
    targetId: order._id.toString(),
  });

  socketEventBus.emit('order:updated', { orderId: order._id.toString(), recipients: order.recipients.map((r) => r.toString()) });

  return order;
};


const transitionOrderStatus = async ({ orderId, nextStatus, actor }) => {
  const lookupQuery = buildOrderLookupQuery(orderId);
  const order = await Order.findOne(lookupQuery);

  if (!order) throw new Error('Order not found');

  const isIssuer = order.issuingAuthority.toString() === actor.toString();
  if (!isIssuer) {
    throw new Error('Only issuing authority can transition order status');
  }

  if (!canTransitionOrderStatus(order.status, nextStatus)) {
    throw new Error(`Invalid status transition from ${order.status} to ${nextStatus}`);
  }

  order.status = nextStatus;
  await order.save();

  await logAuditAction({
    actor,
    action: 'ORDER_STATUS_TRANSITION',
    targetType: 'Order',
    targetId: order._id.toString(),
    metadata: { nextStatus },
  });

  socketEventBus.emit('order:updated', { orderId: order._id.toString(), recipients: order.recipients.map((r) => r.toString()) });

  return order;
};

module.exports = {
  createOrder,
  acknowledgeOrder,
  transitionOrderStatus,
};
