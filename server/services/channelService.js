const Channel = require('../models/ChannelModel');
const { MessageModel } = require('../models/ConversationModel');
const { logAuditAction } = require('./auditService');
const User = require('../models/UserModel');
const socketEventBus = require('../socket/eventBus');

const ensureActorCanManageChannel = (channel, actor) => {
  const actorId = actor.toString();
  const isCreator = channel.createdBy.toString() === actorId;
  const isMember = channel.members.some((member) => member.toString() === actorId);

  if (!isCreator && !isMember) {
    throw new Error('Only channel members can manage this channel');
  }
};

const createChannel = async ({ payload, actor }) => {
  const channel = await Channel.create({
    ...payload,
    createdBy: actor,
    members: Array.from(new Set([actor.toString(), ...((payload.members || []).map((m) => m.toString()))])),
  });

  await logAuditAction({
    actor,
    action: 'CREATE_CHANNEL',
    targetType: 'Channel',
    targetId: channel._id.toString(),
    metadata: { type: channel.type, memberCount: channel.members.length },
  });

  socketEventBus.emit('channel:updated', { channelId: channel._id.toString() });

  return channel;
};

const addChannelMember = async ({ channelId, memberId, actor }) => {
  const channel = await Channel.findById(channelId);

  if (!channel) {
    throw new Error('Channel not found');
  }

  ensureActorCanManageChannel(channel, actor);

  const member = await User.findById(memberId).select('_id');
  if (!member) {
    throw new Error('Member user not found');
  }

  channel.members = Array.from(new Set([...channel.members.map((m) => m.toString()), memberId.toString()]));
  await channel.save();

  await logAuditAction({
    actor,
    action: 'ADD_CHANNEL_MEMBER',
    targetType: 'Channel',
    targetId: channel._id.toString(),
    metadata: { memberId },
  });

  socketEventBus.emit('channel:updated', { channelId: channel._id.toString() });

  return channel;
};

const pinChannelMessage = async ({ channelId, messageId, actor }) => {
  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new Error('Channel not found');
  }

  ensureActorCanManageChannel(channel, actor);

  const message = await MessageModel.findById(messageId).select('_id');
  if (!message) {
    throw new Error('Message not found');
  }

  channel.pinnedMessages = Array.from(new Set([...channel.pinnedMessages.map((m) => m.toString()), messageId.toString()]));
  await channel.save();

  await logAuditAction({
    actor,
    action: 'PIN_CHANNEL_MESSAGE',
    targetType: 'Channel',
    targetId: channel._id.toString(),
    metadata: { messageId },
  });

  socketEventBus.emit('channel:updated', { channelId: channel._id.toString() });

  return channel;
};

const unpinChannelMessage = async ({ channelId, messageId, actor }) => {
  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new Error('Channel not found');
  }

  ensureActorCanManageChannel(channel, actor);

  channel.pinnedMessages = channel.pinnedMessages.filter((id) => id.toString() !== messageId.toString());
  await channel.save();

  await logAuditAction({
    actor,
    action: 'UNPIN_CHANNEL_MESSAGE',
    targetType: 'Channel',
    targetId: channel._id.toString(),
    metadata: { messageId },
  });

  socketEventBus.emit('channel:updated', { channelId: channel._id.toString() });

  return channel;
};

module.exports = {
  createChannel,
  addChannelMember,
  pinChannelMessage,
  unpinChannelMessage,
};
