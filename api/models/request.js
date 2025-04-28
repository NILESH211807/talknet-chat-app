const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Sender is required"],
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Receiver is required"],
    },
}, { timestamps: true, versionKey: false });

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;