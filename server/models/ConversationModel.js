const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    textForRecipient: {
        type: String,
    },
    textForSender: {
        type: String,
    },
    imageUrl : {
        type: String,
        default: ''
    },
    videoUrl : {
        type : String,
        default : ""
    },
    seen : {
        type: Boolean,
        default: false
    },
    msgByUserId : {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref : 'User'
    }
,

    signature: {
        type: String,
        default: ''
    },
    isOfficial: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        default: null
    },
    recalledAt: {
        type: Date,
        default: null
    },
    parentMessageId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Message',
        default: null
    },
}, {
    timestamps: true
});

const conversationSchema = new mongoose.Schema({
    sender : {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref : 'User'
    },
    receiver : {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref : 'User'
    },
    message : [
        {
            type: mongoose.Schema.ObjectId,
            ref : 'Message'
        }
    ]
}, {
    timestamps: true
});

const MessageModel = mongoose.model('Message', messageSchema);
const ConversationModel = mongoose.model('Conversation', conversationSchema);

module.exports = { 
    MessageModel, 
    ConversationModel 
};