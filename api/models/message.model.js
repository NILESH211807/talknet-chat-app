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
        type: String, trim: true,
    },
    attachments: [
        {
            url: String,
            type: { type: String, enum: ['image', 'video', 'audio', 'document'], }
        }
    ],
}, { timestamps: true, versionKey: false });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;