
const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    isGroup: {
        type: Boolean,
        default: false,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
}, { timestamps: true, versionKey: false });

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;