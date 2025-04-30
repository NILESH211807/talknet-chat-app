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
const messageModel = require("./models/message.model");

const authMiddleware = require("./middlewares/isAuth");
const { createSingleChats, createGroupChats, createMessageInChat } = require("./seeders/chat");
const { createServer } = require("http");
const { NEW_MESSAGE, NEW_MESSAGE_ALERT } = require("./constants/events");
const { getSockets, userSocketIds } = require("./lib/socketStore");
// const { createUserSignup } = require("./seeders/user");
// const userSocketIds = new Map();
// const { getSockets } = require("./lib/helper");

// dotenv.config();
connectDb();

const app = express();
const server = createServer(app);
const io = new Server(server);

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

app.get("/", (req, res) => {
   res.send("Welcome to Talknet API");
});

// io.use((socket, next) => {
//     console.log("Socket connected", socket.id);
//     next();
// });

io.on("connection", (socket) => {
   console.log("New client connected", socket.id);

   const user = {
      id: "680b2e8f5731a4bd0e4d50db",
      name: "Ram"
   }

   userSocketIds.set(user.id.toString(), socket.id);

   socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {

      const messsageForRealTime = {
         content: message,
         id: uuid(),
         sender: {
            _id: user.id,
            name: user.name,
         },
         chatId: chatId,
         createdAt: new Date().toISOString()
      }

      const messageForDB = {
         sender: user.id,
         content: message,
         chat: chatId,
      }

      const usersSocket = getSockets(members);
      io.to(usersSocket).emit(NEW_MESSAGE, {
         chatId: chatId,
         message: messsageForRealTime
      });

      io.to(usersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

      // try {

      //    await messageModel.create(messageForDB);
      //    console.log('Message saved successfully');

      // } catch (error) {
      //    // console.log(error);
      //    console.log('Error in saving message', error.message);
      // }

      // console.log('new message', messsageForRealTime);

   });

   socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
      userSocketIds.delete(user.id.toString());
   });
});

server.listen(process.env.PORT, () => {
   console.log(`Server is running on port ${process.env.PORT}`);
});


module.exports = {
   userSocketIds
}