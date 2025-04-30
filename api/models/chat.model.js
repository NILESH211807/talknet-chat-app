
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
    profile: {
        image_url: {
            type: String,
        },
        public_id: {
            type: String,
        }
    },
}, { timestamps: true, versionKey: false });

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;