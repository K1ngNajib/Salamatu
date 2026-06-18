const express = require('express');
const registerUser = require('../controller/registerUser');
const checkEmail = require('../controller/checkEmail');
const checkPassword = require('../controller/checkPassword');
const userDetails = require('../controller/userDetails');
const logout = require('../controller/logout');
const updateUserDetails = require('../controller/updateUserDetails');
const searchUser = require('../controller/searchUser');
const getPublicKey = require('../controller/getPublicKey');
const setup2FA = require('../controller/setup2FA');
const verify2FA = require('../controller/verify2FA');
const reset2FA = require('../controller/reset2FA');
const authenticateJWT = require('../middleware/auth');
const authWithGoogle = require('../controller/authWithGoogle');
const requirePermission = require('../middleware/permission');
const {
  requireFields,
  validateOrderPayload,
  validateSignalPayload,
  validateChannelMemberPayload,
  validateChannelMessagePayload,
} = require('../middleware/requestValidation');
const { getHttpStatusFromError } = require('../utils/httpError');

const Order = require('../models/OrderModel');
const Circular = require('../models/CircularModel');
const Signal = require('../models/SignalModel');
const Document = require('../models/DocumentModel');
const Channel = require('../models/ChannelModel');
const { createOrder, acknowledgeOrder, transitionOrderStatus } = require('../services/orderService');
const { publishCircular } = require('../services/circularService');
const { createSignal } = require('../services/signalService');
const { searchDirectory } = require('../services/directoryService');
const { uploadDocument } = require('../services/documentService');
const {
  createChannel,
  addChannelMember,
  pinChannelMessage,
  unpinChannelMessage,
} = require('../services/channelService');

const router = express.Router();

// Route groups (high-level navigation):
// 1) Auth/profile: register/login/user/2FA
// 2) Orders/Circulars/Signals/Documents APIs
// 3) Channels + member moderation APIs
// 4) Directory and role-aware administrative read models

const sendServiceError = (res, error) => {
  const status = getHttpStatusFromError(error?.message || '');
  return res.status(status).json({ error: true, message: error.message });
};

router.post('/register', registerUser);
router.post('/email', checkEmail);
router.post('/password', checkPassword);
router.get('/user-details', userDetails);
router.get('/logout', logout);
router.post('/update-user', authenticateJWT, updateUserDetails);
router.post('/search-user', searchUser);
router.get('/get-public-key', getPublicKey);
router.post('/2fa/setup', authenticateJWT, setup2FA);
router.post('/2fa/verify', authenticateJWT, verify2FA);
router.post('/2fa/reset', authenticateJWT, reset2FA);
router.post('/auth/google', authWithGoogle);

router.post('/orders', authenticateJWT, requirePermission('issue_directives'), requireFields(['title', 'body', 'signature', 'recipients']), validateOrderPayload, async (req, res) => {
  try {
    const orderId = `ORD-${Date.now()}`;
    const order = await createOrder({ payload: { ...req.body, orderId }, actor: req.user._id });
    return res.status(201).json({ success: true, data: order });
  } catch (error) {
    return sendServiceError(res, error);
  }
});

router.post('/orders/:orderId/acknowledge', authenticateJWT, async (req, res) => {
  try {
    const order = await acknowledgeOrder({ orderId: req.params.orderId, actor: req.user._id });
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return sendServiceError(res, error);
  }
});

router.post('/orders/:orderId/publish', authenticateJWT, requirePermission('issue_directives'), async (req, res) => {
  try {
    const order = await transitionOrderStatus({ orderId: req.params.orderId, nextStatus: 'Published', actor: req.user._id });
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return sendServiceError(res, error);
  }
});

router.post('/orders/:orderId/archive', authenticateJWT, requirePermission('issue_directives'), async (req, res) => {
  try {
    const order = await transitionOrderStatus({ orderId: req.params.orderId, nextStatus: 'Archived', actor: req.user._id });
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return sendServiceError(res, error);
  }
});

router.get('/orders', authenticateJWT, async (req, res) => {
  const data = await Order.find({ recipients: req.user._id }).sort({ createdAt: -1 });
  return res.status(200).json({ data });
});

router.post('/circulars', authenticateJWT, requirePermission('publish_circulars'), requireFields(['title', 'content', 'signature']), async (req, res) => {
  try {
    const circular = await publishCircular({ payload: req.body, actor: req.user._id });
    return res.status(201).json({ success: true, data: circular });
  } catch (error) {
    return sendServiceError(res, error);
  }
});

router.get('/circulars', authenticateJWT, async (req, res) => {
  const data = await Circular.find({ archiveStatus: false }).sort({ updatedAt: -1 });
  return res.status(200).json({ data });
});

router.post('/signals', authenticateJWT, requirePermission('broadcast_announcements'), requireFields(['message', 'recipients']), validateSignalPayload, async (req, res) => {
  try {
    const signal = await createSignal({ payload: req.body, actor: req.user._id });
    return res.status(201).json({ success: true, data: signal });
  } catch (error) {
    return sendServiceError(res, error);
  }
});

router.get('/signals', authenticateJWT, async (req, res) => {
  const data = await Signal.find({ recipients: req.user._id }).sort({ createdAt: -1 });
  return res.status(200).json({ data });
});

router.get('/directory', authenticateJWT, async (req, res) => {
  const data = await searchDirectory(req.query);
  return res.status(200).json({ data });
});

router.post('/documents', authenticateJWT, requirePermission('publish_circulars'), requireFields(['title', 'encryptedFileURL', 'accessPermissions']), async (req, res) => {
  try {
    const document = await uploadDocument({ payload: req.body, actor: req.user._id });
    return res.status(201).json({ success: true, data: document });
  } catch (error) {
    return sendServiceError(res, error);
  }
});

router.get('/documents', authenticateJWT, async (req, res) => {
  const userRole = req.user.role || 'personnel';
  const data = await Document.find({ accessPermissions: { $in: [userRole] } }).sort({ createdAt: -1 });
  return res.status(200).json({ data });
});

router.post('/channels', authenticateJWT, requirePermission('create_rooms'), requireFields(['name', 'type']), async (req, res) => {
  try {
    const channel = await createChannel({ payload: req.body, actor: req.user._id });
    return res.status(201).json({ success: true, data: channel });
  } catch (error) {
    return sendServiceError(res, error);
  }
});

router.post('/channels/:channelId/members', authenticateJWT, requirePermission('create_rooms'), requireFields(['memberId']), validateChannelMemberPayload, async (req, res) => {
  try {
    const channel = await addChannelMember({
      channelId: req.params.channelId,
      memberId: req.body.memberId,
      actor: req.user._id,
    });
    return res.status(200).json({ success: true, data: channel });
  } catch (error) {
    return sendServiceError(res, error);
  }
});

router.post('/channels/:channelId/pin-message', authenticateJWT, requirePermission('create_rooms'), requireFields(['messageId']), validateChannelMessagePayload, async (req, res) => {
  try {
    const channel = await pinChannelMessage({
      channelId: req.params.channelId,
      messageId: req.body.messageId,
      actor: req.user._id,
    });
    return res.status(200).json({ success: true, data: channel });
  } catch (error) {
    return sendServiceError(res, error);
  }
});

router.post('/channels/:channelId/unpin-message', authenticateJWT, requirePermission('create_rooms'), requireFields(['messageId']), validateChannelMessagePayload, async (req, res) => {
  try {
    const channel = await unpinChannelMessage({
      channelId: req.params.channelId,
      messageId: req.body.messageId,
      actor: req.user._id,
    });
    return res.status(200).json({ success: true, data: channel });
  } catch (error) {
    return sendServiceError(res, error);
  }
});

router.get('/channels', authenticateJWT, async (req, res) => {
  const data = await Channel.find({ members: req.user._id }).sort({ updatedAt: -1 });
  return res.status(200).json({ data });
});

module.exports = router;
