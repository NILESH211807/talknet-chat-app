const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Sender is required"],
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: [true, "Chat is required"]
    },
    content: {
        type: String,
        trim: true,
    },
    attachments: [
        {
            url: {
                type: String,
            },
            public_id: {
                type: String,
            },
            type: {
                type: String,
                default: 'image',
            },
        }
    ],
}, { timestamps: true, versionKey: false });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;