require("dotenv").config();
const express = require('express');
const cookieParser = require("cookie-parser");
const path = require('path');
const connectDb = require("./config/db");
const { Server } = require("socket.io");
const { v4: uuid } = require('uuid');
const { corsOptions } = require("./config/cors");
const cors = require("cors");

const authRouter = require("./routers/auth.router");
const userRouter = require("./routers/user.router");
const chatRouter = require("./routers/chat.router");
const groupRouter = require("./routers/group.router");
const uploadRouter = require("./routers/upload.router");
const messageModel = require("./models/message.model");
const chatModel = require("./models/chat.model");

const { authMiddleware, socketAuthMiddleware } = require("./middlewares/isAuth");
const { createSingleChats, createGroupChats, createMessageInChat } = require("./seeders/chat");
const { createServer } = require("http");
const { NEW_MESSAGE, NEW_MESSAGE_ALERT } = require("./constants/events");
const { getSockets, userSocketIDS } = require("./lib/socketStore");
// const { createUserSignup } = require("./seeders/user");
// const userSocketIds = new Map();
// const { getSockets } = require("./lib/helper");

// dotenv.config();
connectDb();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URI,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// createSingleChats(10);
// createGroupChats(10);
// createMessageInChat("680b2e8f5731a4bd0e4d50db", 50);
// createUserSignup(10);

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/auth", authRouter);
app.use("/api/user", authMiddleware, userRouter);
app.use("/api/group", authMiddleware, groupRouter);
app.use("/api/chat", authMiddleware, chatRouter);
app.use("/api/upload/attachment", authMiddleware, uploadRouter);


app.get("/", (req, res) => {
    res.send("Welcome to Talknet API");
});

io.use((socket, next) => {
    cookieParser()(socket.request, socket.request.res,
        async (error) => await socketAuthMiddleware(error, socket, next)
    )
});

const onlineUsers = new Map(); // userId -> socketId

function isUserOnline(userId) {
    return onlineUsers.has(userId);
}

io.on("connection", (socket) => {

    const user = socket.user;
    const userId = user._id.toString();

    if (userId) {
        onlineUsers.set(userId, socket.id);
        io.emit('USER_ONLINE', userId); // broadcast
    }

    userSocketIDS.set(user._id.toString(), socket.id);

    socket.on('NEW_MESSAGE', async ({ chatId, members, message, attachment }) => {

        const messageForRealTime = {
            content: message,
            id: uuid(),
            sender: { _id: user._id, name: user.name, },
            chatId: chatId,
            attachments: [attachment],
            createdAt: new Date().toISOString(),
        }

        let messageForDb = {
            sender: user._id,
            content: message,
            chat: chatId,
        }

        if (attachment) {
            messageForDb.attachments = [attachment];
        }

        // Get array of socket IDs for the members
        const memberSocketIds = getSockets(members);

        // Emit NEW_MESSAGE_RECEIVED to each socket individually
        memberSocketIds.forEach(socketId => {
            io.to(socketId).emit('NEW_MESSAGE_RECEIVED', {
                chatId: chatId,
                message: messageForRealTime
            });
        });

        // Also emit NEW_MESSAGE_ALERT to each socket
        memberSocketIds.forEach(socketId => {
            io.to(socketId).emit('NEW_MESSAGE_ALERT', { chatId });
        });

        // Try to save message to database
        try {
            await messageModel.create(messageForDb);
        } catch (error) {
            console.log('Error in saving message', error.message);
        }

        // Find all chat members except sender
        const chat = await chatModel.findById(chatId).lean();
        const recipients = chat.members.filter(id => id.toString() !== userId.toString());

        // Send real-time unread count to each recipient
        for (const recipientId of recipients) {
            const unreadCount = await messageModel.countDocuments({
                chat: chatId,
                isRead: false,
                sender: { $ne: recipientId }
            });

            const socketId = onlineUsers.get(recipientId.toString());

            if (socketId) {
                io.to(socketId).emit("UNREAD_COUNT", { // broadcast
                    chatId,
                    unread: unreadCount
                });
            }
        }
    });

    socket.on("disconnect", () => {
        userSocketIDS.delete(user._id.toString());
        if (userId) {
            onlineUsers.delete(userId);
            io.emit('USER_OFFLINE', userId); // broadcast
        }

    });

    // Handle online check request from client
    socket.on("CHECK_ONLINE_STATUS", (targetUserId, callback) => {
        callback({ online: onlineUsers.has(targetUserId) });
    });
});


server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});


// module.exports = {
//     userSocketIds
// }