const createLocalModel = require('./localModel');

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

module.exports = { ConversationModel, MessageModel };
