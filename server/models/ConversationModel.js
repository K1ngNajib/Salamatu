const createLocalModel = require('./localModel');

const ConversationModel = createLocalModel('conversation');
const MessageModel = createLocalModel('message');

module.exports = { ConversationModel, MessageModel };
