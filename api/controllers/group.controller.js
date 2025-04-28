const chatModel = require('../models/chat.model');
const userModel = require('../models/user.model');

function formatName(name) {
    return name.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '').replace(/\b\w/g, (char) => char.toLocaleUpperCase());
}
// Create Group
module.exports.createGroup = async (req, res) => {
    const { name, members } = req.body;

    try {

        if (!name || !members) {
            return res.status(400).json({
                success: false, message: 'Name and members are required'
            });
        }

        if (members.length < 2) {
            return res.status(400).json({
                success: false, message: 'At least two members are required'
            });
        }

        const allMembers = [...members, req.user.id];

        const newGroup = new chatModel({
            name,
            isGroup: true,
            creator: req.user.id,
            members: allMembers
        });

        await newGroup.save();

        res.status(200).json({
            success: true,
            message: 'Group created successfully',
            data: {
                name: newGroup.name,
                isGroup: newGroup.isGroup,
                creator: newGroup.creator,
                members: newGroup.members
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false, message: error.message || 'Internal server error'
        });
    }
};

// add members 
module.exports.updateGroup = async (req, res) => {
    const { chatId, name, members } = req.body;

    try {
        if (!chatId) {
            return res.status(400).json({
                success: false, message: 'Chat ID is required'
            });
        }

        if (!name && !members) {
            return res.status(400).json({
                success: false, message: 'Name or members is required'
            });
        }

        const chat = await chatModel.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false, message: 'ChatId not found'
            });
        }

        if (!chat.isGroup) {
            return res.status(400).json({
                success: false, message: 'Chat is not a group'
            });
        }

        if (chat.creator.toString() !== req.user.id) {
            return res.status(401).json({
                success: false, message: 'You are not allowed to add members in this group'
            });
        }

        // update group name 
        if (name) {
            const formattedName = formatName(name);
            chat.name = formattedName;
        }

        // update group members 
        if (members) {
            if (!Array.isArray(members)) {
                return res.status(400).json({
                    success: false, message: 'Members must be an array'
                });
            }
            if (members.length < 2) {
                return res.status(400).json({
                    success: false, message: 'At least two members are required'
                });
            }

            const allNewMembersPromise = members.map((m) => userModel.findById(m));
            const allNewMembers = await Promise.all(allNewMembersPromise);

            chat.members = allNewMembers.map((m) => m._id);
            chat.members.push(req.user.id);
        }

        await chat.save();

        // Fetch updated chat with populated members
        const updatedChat = await chatModel.findById(chatId)
            .populate('members', 'name email profile')
            .populate('creator', 'name email profile');

        res.status(200).json({
            success: true,
            message: 'Group updated successfully',
        });

    } catch (error) {
        res.status(500).json({
            success: false, message: error.message || 'Internal server error'
        });
    }
};

// delete group
module.exports.deleteGroup = async (req, res) => {
    const { chatId } = req.body;

    try {
        if (!chatId) {
            return res.status(400).json({
                success: false, message: 'Chat ID is required'
            });
        }

        const chat = await chatModel.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false, message: 'ChatId not found'
            });
        }

        if (!chat.isGroup) {
            return res.status(400).json({
                success: false, message: 'Chat is not a group'
            });
        }

        if (chat.creator.toString() !== req.user.id) {
            return res.status(401).json({
                success: false, message: 'You are not allowed to delete this group'
            });
        }

        await chat.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Group deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false, message: error.message || 'Internal server error'
        });
    }
}

// leave group
module.exports.leaveGroup = async (req, res) => {
    const { chatId } = req.body;

    try {

        if (!chatId) {
            return res.status(400).json({
                success: false, message: 'Chat ID and user ID are required'
            });
        }

        const chat = await chatModel.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false, message: 'ChatId not found'
            });
        }

        if (!chat.isGroup) {
            return res.status(400).json({
                success: false, message: 'Chat is not a group'
            });
        }

        if (chat.creator.toString() === req.user.id) {
            return res.status(400).json({
                success: false, message: 'You are the creator of this group'
            });
        }

        chat.members = chat.members.filter((m) => m.toString() !== req.user.id);
        
        await chat.save();

        res.status(200).json({
            success: true,
            message: 'Left the group successfully',
        });

    } catch (error) {
        res.status(500).json({
            success: false, message: error.message || 'Internal server error'
        });
    }
}
