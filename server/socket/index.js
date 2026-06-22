const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const getUserDetailsFromToken = require('../services/getUserDetailsFromToken');
const UserModel = require('../models/UserModel');
const Signal = require('../models/SignalModel');
const Order = require('../models/OrderModel');
const Circular = require('../models/CircularModel');
const Channel = require('../models/ChannelModel');
const { ConversationModel, MessageModel } = require('../models/ConversationModel');
const getConversation = require('../services/getConversation');
const socketEventBus = require('./eventBus');
const { validateMessagePayload, validateRecallRequest } = require('../utils/messageActions');
const { getSocketErrorPayload } = require('../utils/socketError');

const app = express();

/** Socket connection **/
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

const onlineUser = new Set();

io.on('connection', async (socket) => {
  // Connection log intentionally omitted to reduce metadata exposure in logs.

  const token = socket.handshake.auth.token;

  // current user details
  const user = await getUserDetailsFromToken(token);

  // create a room
  socket.join(user?._id?.toString());
  onlineUser.add(user?._id?.toString());

  io.emit('onlineUser', Array.from(onlineUser));
  io.emit('online-user', Array.from(onlineUser));

  socket.on('message-page', async (userId) => {
    const userDetails = await UserModel.findById(userId).select('-password');

    const payload = {
      _id: userDetails?._id,
      name: userDetails?.name,
      email: userDetails?.email,
      profile_pic: userDetails?.profile_pic,
      online: onlineUser.has(userId),
      role: userDetails?.role,
      unit: userDetails?.unit,
      department: userDetails?.department,
    };

    socket.emit('message-user', payload);

    const getConversationMessage = await ConversationModel.findOne({
      $or: [
        { sender: user?._id, receiver: userId },
        { sender: userId, receiver: user?._id },
      ],
    }).populate('message').sort({ updatedAt: -1 });

    const visibleMessages = (getConversationMessage?.message || []).filter((msg) => !msg.recalledAt && (!msg.expiresAt || new Date(msg.expiresAt) > new Date()));

    socket.emit('message', visibleMessages);
  });

  socket.on('new message', async (data) => {
    try {
      const normalizedPayload = validateMessagePayload({ payload: data, actor: user });

      let conversation = await ConversationModel.findOne({
        $or: [
          { sender: normalizedPayload.sender, receiver: normalizedPayload.receiver },
          { sender: normalizedPayload.receiver, receiver: normalizedPayload.sender },
        ],
      });

      if (!conversation) {
        const createConversation = new ConversationModel({
          sender: normalizedPayload.sender,
          receiver: normalizedPayload.receiver,
        });
        conversation = await createConversation.save();
      }

      const message = new MessageModel(normalizedPayload);
      const saveMessage = await message.save();

      await ConversationModel.updateOne({ _id: conversation._id }, {
        $push: { message: saveMessage._id },
      });

      const getConversationMessage = await ConversationModel.findOne({
        $or: [
          { sender: normalizedPayload.sender, receiver: normalizedPayload.receiver },
          { sender: normalizedPayload.receiver, receiver: normalizedPayload.sender },
        ],
      }).populate('message').sort({ updatedAt: -1 });

      io.to(normalizedPayload.sender).emit('message', getConversationMessage?.message || []);
      io.to(normalizedPayload.receiver).emit('message', getConversationMessage?.message || []);

      const conversationSender = await getConversation(normalizedPayload.sender);
      const conversationReceiver = await getConversation(normalizedPayload.receiver);

      io.to(normalizedPayload.sender).emit('conversation', conversationSender);
      io.to(normalizedPayload.receiver).emit('conversation', conversationReceiver);
    } catch (error) {
      socket.emit('message-action-error', getSocketErrorPayload(error, 'send'));
    }
  });

  socket.on('recall-message', async ({ messageId, sender, receiver }) => {
    try {
      if (sender?.toString() !== user?._id?.toString()) {
        throw new Error('AuthorizationError: Sender mismatch for recall');
      }

      const message = await MessageModel.findById(messageId).select('msgByUserId recalledAt');
      validateRecallRequest({ message, actorId: user?._id, messageId });

      await MessageModel.updateOne({ _id: messageId }, { recalledAt: new Date() });
      io.to(sender).emit('message-recalled', { messageId });
      io.to(receiver).emit('message-recalled', { messageId });
    } catch (error) {
      socket.emit('message-action-error', getSocketErrorPayload(error, 'recall'));
    }
  });

  socket.on('sidebar', async (currentUserId) => {
    const conversation = await getConversation(currentUserId);
    socket.emit('conversation', conversation);
  });

  socket.on('seen', async (msgByUserId) => {
    const conversation = await ConversationModel.findOne({
      $or: [
        { sender: user?._id, receiver: msgByUserId },
        { sender: msgByUserId, receiver: user?._id },
      ],
    });
    const conversationMessageId = conversation?.message || [];
    await MessageModel.updateMany(
      { _id: { $in: conversationMessageId }, msgByUserId },
      { $set: { seen: true } },
    );

    const conversationSender = await getConversation(user?._id?.toString());
    const conversationReceiver = await getConversation(msgByUserId);

    io.to(user?._id?.toString()).emit('conversation', conversationSender);
    io.to(msgByUserId).emit('conversation', conversationReceiver);
  });

  socket.on('disconnect', () => {
    onlineUser.delete(user?._id?.toString());
    // Disconnect log intentionally omitted to reduce metadata exposure in logs.
  });
});

const ordersNamespace = io.of('/orders');
ordersNamespace.on('connection', async (socket) => {
  const token = socket.handshake.auth?.token;
  const user = await getUserDetailsFromToken(token);
  if (!user?._id) return socket.disconnect();

  socket.join(user._id.toString());

  socket.on('orders:subscribe', async () => {
    const orders = await Order.find({ recipients: user._id }).sort({ createdAt: -1 }).limit(30);
    socket.emit('orders:list', orders);
  });
});

const signalsNamespace = io.of('/signals');
signalsNamespace.on('connection', async (socket) => {
  const token = socket.handshake.auth?.token;
  const user = await getUserDetailsFromToken(token);
  if (!user?._id) return socket.disconnect();

  socket.join(user._id.toString());

  socket.on('signals:subscribe', async () => {
    const signals = await Signal.find({ recipients: user._id }).sort({ createdAt: -1 }).limit(50);
    socket.emit('signals:list', signals);
  });
});

const announcementsNamespace = io.of('/announcements');
announcementsNamespace.on('connection', async (socket) => {
  const token = socket.handshake.auth?.token;
  const user = await getUserDetailsFromToken(token);
  if (!user?._id) return socket.disconnect();

  socket.on('announcements:subscribe', async () => {
    const circulars = await Circular.find({ archiveStatus: false }).sort({ updatedAt: -1 }).limit(20);
    socket.emit('announcements:list', circulars);
  });
});

const channelsNamespace = io.of('/channels');
channelsNamespace.on('connection', async (socket) => {
  const token = socket.handshake.auth?.token;
  const user = await getUserDetailsFromToken(token);
  if (!user?._id) return socket.disconnect();

  socket.join(user._id.toString());
  socket.emit('channels:ready', { userId: user._id, role: user.role });
});



// Broadcast service-layer workflow updates to relevant namespaces.
socketEventBus.on('channel:updated', async ({ channelId }) => {
  const targetChannel = await Channel.findById(channelId);
  if (!targetChannel) return;

  const memberIds = (targetChannel.members || []).map((m) => m.toString());
  memberIds.forEach((memberId) => {
    channelsNamespace.to(memberId).emit('channels:updated', { channelId });
  });
});

socketEventBus.on('order:updated', ({ recipients = [], orderId }) => {
  recipients.forEach((recipientId) => {
    ordersNamespace.to(recipientId.toString()).emit('orders:updated', { orderId });
  });
});

module.exports = {
  app,
  server,
};
