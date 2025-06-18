const chatModel = require("../models/chat.model");
const userModel = require("../models/user.model");
const messageModel = require("../models/message.model");
const { deleteFilesFromCloudinary, IdIsValid } = require("../utils/utility");

module.exports.startNewChat = async (req, res) => {
    const { userId } = req.body;

    try {

        if (!userId) {
            return res.status(400).json({
                success: false, message: 'UserId is required'
            });
        }

        if (!IdIsValid(userId)) {
            return res.status(400).json({
                success: false, message: 'Invalid userId'
            });
        }

        if (userId === req.user.id) {
            return res.status(400).json({
                success: false, message: 'You cannot start chat with yourself'
            });
        }

        const user = await userModel.findById(userId).lean();

        if (!user) {
            return res.status(404).json({
                success: false, message: 'Invalid userId'
            });
        }

        const chat = await chatModel.findOne({
            members: { $all: [req.user.id, userId] }
        }).lean();


        if (chat) {
            return res.status(200).json({
                success: true,
                message: 'Chat already exists',
                data: {
                    chatId: chat._id,
                    name: chat.name,
                    isGroup: chat.isGroup,
                    members: chat.members,
                    createdAt: chat.createdAt,
                    updatedAt: chat.updatedAt,
                }
            });
        }

        const newChat = await chatModel.create({
            name: user.name,
            members: [userId, req.user.id]
        });

        res.status(200).json({
            success: true,
            message: 'Chat created successfully',
            data: {
                chatId: newChat._id,
                name: newChat.name,
                isGroup: newChat.isGroup,
                members: newChat.members,
                createdAt: newChat.createdAt,
                updatedAt: newChat.updatedAt,
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false, message: error.message || 'Internal server error'
        });
    }
}

// my chats
module.exports.myChats = async (req, res) => {

    try {

        if (!req.user.id) {
            return res.status(401).json({
                success: false, message: 'Unauthorized. Please login.'
            });
        }

        const allChats = await chatModel.find({ members: req.user.id })
            .populate('members', 'name profile')
            .sort({ updatedAt: -1 })
            .lean();

        const chatData = await Promise.all(
            allChats.map(async ({ _id, ...rest }) => {
                // Get the last message only
                const lastMessage = await messageModel.findOne({ chat: _id })
                    .sort({ createdAt: -1 })
                    .lean().select('content attachments createdAt updatedAt');

                const lastMessageContent = lastMessage?.content || lastMessage?.attachments[0]?.type;

                // Count only unread messages not sent by the current user
                const unreadCount = await messageModel.countDocuments({
                    chat: _id,
                    isRead: false,
                    sender: { $ne: req.user.id }
                });

                return {
                    chatId: _id,
                    ...rest,
                    lastMessage: lastMessageContent,
                    unread: unreadCount
                };
            })
        );

        res.status(200).json({
            success: true, data: chatData
        });

    } catch (error) {
        res.status(500).json({
            success: false, message: error.message || 'Internal server error'
        });
    }
}

// send attachment
module.exports.sendAttachment = async (req, res) => {
    const { chatId } = req.body;

    if (!chatId) {
        return res.status(400).json({
            success: false, message: 'ChatId is required'
        });
    }

    try {

        const [chat, user] = await Promise.all([
            chatModel.findById(chatId),
            userModel.findById(req.user.id),
        ]);

        if (!chat) {
            return res.status(404).json({
                success: false, message: 'ChatId not found'
            });
        }
        if (!user) {
            return res.status(404).json({
                success: false, message: 'ChatId not found'
            });
        }

        const files = req.files || [];

        if (!files.length) {
            return res.status(400).json({
                success: false, message: 'No files uploaded'
            });
        }

        const attachments = [];

        const messageForDB = {
            sender: user._id,
            content: '',
            chat: chatId,
            attachments
        }

        const messageForRealTime = {
            ...messageForDB,
            sender: {
                _id: user._id,
                name: user.name,
                profile: user.profile
            },
        }

        const message = await messageModel.create(messageForDB);

        res.status(200).json({
            success: true, message: 'Message sent successfully', data: message
        });

    } catch (error) {
        res.status(500).json({
            success: false, message: error.message || 'Internal server error'
        });
    }
}

// get chat details
module.exports.getChatDetails = async (req, res) => {

    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false, message: 'ChatId is required'
        });
    }

    if (!IdIsValid(id)) {
        return res.status(400).json({
            success: false, message: 'Invalid chatId'
        });
    }

    try {

        if (req.query.populate === 'true') {

            const chat = await chatModel.findById(id)
                .populate('members', 'name profile')
                .populate('creator', 'name profile')
                .lean();

            if (!chat) {
                return res.status(404).json({
                    success: false, message: 'ChatId not found'
                });
            }

            res.status(200).json({
                success: true, data: chat
            });

        } else {
            const chat = await chatModel.findById(id).select('-createdAt -updatedAt').lean();

            if (!chat) {
                return res.status(404).json({
                    success: false, message: 'ChatId not found'
                });
            }
            res.status(200).json({
                success: true, data: chat
            });
        }


    } catch (error) {
        res.status(500).json({
            success: false, message: error.message || 'Internal server error'
        });
    }
}

// delete chats
module.exports.deleteChat = async (req, res) => {
    const chatId = req.params.id;

    if (!chatId) {
        return res.status(400).json({
            success: false, message: 'ChatId is required'
        });
    }

    if (!IdIsValid(chatId)) {
        return res.status(400).json({
            success: false, message: 'Invalid chatId'
        });
    }

    try {

        const chat = await chatModel.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false, message: 'Chat not found'
            });
        }

        const members = chat.members;

        if (chat.isGroup && chat.creator.toString() !== req.user.id.toString()) {
            return res.status(401).json({
                success: false, message: 'You are not allowed to delete this chat'
            });
        }


        if (!chat.isGroup && !members.includes(req.user.id)) {
            return res.status(401).json({
                success: false, message: 'You are not allowed to delete this chat'
            });
        }

        // here we have to delete all the messages of this chat

        const messagesWithAttachments = await messageModel.find({
            chat: chatId, attachments: { $exists: true, $ne: [] }
        }).lean();

        const publicIds = [];

        messagesWithAttachments.forEach((attachments) => {
            attachments.forEach((public_id) => {
                publicIds.push(public_id);
            });
        });

        await Promise.all([
            // delete files from cloudinary
            deleteFilesFromCloudinary(publicIds),
            chat.deleteOne(), // delete chat details from db
            messageModel.deleteMany({ chat: chatId }), // delete messages from db
        ]);


        res.status(200).json({
            success: true, message: 'Chat deleted successfully'
        });


    } catch (error) {
        res.status(500).json({
            success: false, message: error.message || 'Internal server error'
        });
    }
};


// get messages
module.exports.getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;

        if (!chatId) {
            return res.status(400).json({
                success: false, message: 'ChatId is required'
            });
        }

        if (!IdIsValid(chatId)) {
            return res.status(400).json({
                success: false, message: 'Invalid chatId'
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 30;
        const skip = (page - 1) * limit;

        const [messages, totalMessages] = await Promise.all([
            messageModel.find({ chat: chatId })
                .populate('sender', 'name')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean(),
            messageModel.countDocuments({ chat: chatId })
        ]);

        if (!messages) {
            return res.status(404).json({
                success: false, message: 'No messages found'
            });
        }

        const totalPages = Math.ceil(totalMessages / limit) || 0;

        await messageModel.updateMany(
            { chat: chatId, sender: { $ne: req.user.id }, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({
            success: true,
            data: {
                totalMessages,
                totalPages,
                messages: messages.reverse()
            },
        });

    } catch (error) {
        res.status(500).json({
            success: false, message: error.message || 'Internal server error'
        });
    }
}


// delete chat person 
module.exports.deleteChatPerson = async (req, res) => {

    const { chatId } = req.params;

    if (!chatId) {
        return res.status(400).json({
            success: false, message: 'ChatId is required'
        });
    }

    if (!IdIsValid(chatId)) {
        return res.status(400).json({
            success: false, message: 'Invalid chatId'
        });
    }

    try {

        const chat = await chatModel.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false, message: 'Chat not found'
            });
        }

        if (chat.isGroup) {
            return res.status(400).json({
                success: false, message: 'You cannot delete a group'
            });
        }

        chat.members = chat.members.filter((m) => m.toString() !== req.user.id);

        await Promise.all([
            messageModel.deleteMany({ chat: chatId }),
            chat.save()
        ]);

        res.status(200).json({
            success: true,
            message: 'Chat person deleted successfully',
        });

    } catch (error) {
        res.status(500).json({
            success: false, message: error.message || 'Internal server error'
        });
    }
}

