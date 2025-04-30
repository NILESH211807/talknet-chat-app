const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chat.controller');
const { attachmentsMulter } = require('../middlewares/multer');
router.route("/start-chat").post(chatController.startNewChat); // start new chat with a user or group of users
router.route("/my-chats").get(chatController.myChats);
router.route("/message").post(attachmentsMulter, chatController.sendAttachment);
router.route("/:id").get(chatController.getChatDetails); // populate=true to populate the members and creator fields
router.route("/:id").delete(chatController.deleteChat);
router.route("/message/:chatId").get(chatController.getMessages);

module.exports = router;