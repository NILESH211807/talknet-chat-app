const chatModel = require('../models/chat.model');
const userModel = require('../models/user.model');
const { uploadImage, deleteFilesFromCloudinary } = require('../utils/cloudinary');
const { IdIsValid } = require('../utils/utility');

function formatName(name) {
    return name.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '').replace(/\b\w/g, (char) => char.toLocaleUpperCase());
}
// Create Group
module.exports.createGroup = async (req, res) => {
    try {
        const req_data = req.body;

        // Check required fields first
        if (!req_data.name || !req_data.members) {
            return res.status(400).json({
                success: false, message: 'Name and members are required'
            });
        }

        const name = formatName(req_data.name);

        // Parse members with proper error handling
        let members;
        try {
            members = typeof req_data.members === 'string'
                ? JSON.parse(req_data.members)
                : req_data.members;
        } catch (error) {
            return res.status(400).json({
                success: false, message: 'Members must be valid JSON'
            });
        }

        // Validate members is an array with content
        if (!Array.isArray(members)) {
            return res.status(400).json({
                success: false, message: 'Members must be an array'
            });
        }

        if (members.length < 1) {
            return res.status(400).json({
                success: false, message: 'At least one member is required'
            });
        }

        // Create unique members list including creator
        const allMembers = [...new Set([...members, req.user.id])];

        // Create group
        const newGroup = new chatModel({
            name,
            isGroup: true,
            creator: req.user.id,
            members: allMembers
        });

        // Handle profile image if provided
        if (req.file) {
            try {
                const uploadResult = await uploadImage(req.file.path);

                if (!uploadResult) {
                    return res.status(500).json({
                        success: false, message: 'Failed to upload image'
                    });
                }

                newGroup.profile = {
                    image_url: uploadResult.secure_url,
                    public_id: uploadResult.public_id
                };
            } catch (imageError) {
                return res.status(500).json({
                    success: false, message: 'Error uploading profile image'
                });
            }
        }

        await newGroup.save();

        res.status(201).json({
            success: true,
            message: 'Group created successfully',
            data: {
                name: newGroup.name,
                isGroup: newGroup.isGroup,
                creator: newGroup.creator,
                members: newGroup.members,
                profile: newGroup.profile
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false, message: error.message || 'Internal server error'
        });
    }
};

// update group 
module.exports.updateGroup = async (req, res) => {

    const req_data = req.body;

    try {

        if (!req_data.chatId) {
            return res.status(400).json({
                success: false, message: 'Chat ID is required'
            });
        }

        if (!IdIsValid(req_data.chatId)) {
            return res.status(400).json({
                success: false, message: 'Invalid chatId'
            });
        }

        // Check required fields first
        if (!req_data.members) {
            return res.status(400).json({
                success: false, message: 'Members are required'
            });
        }

        // Parse members with proper error handling
        let members;
        try {
            members = typeof req_data.members === 'string'
                ? JSON.parse(req_data.members)
                : req_data.members;
        } catch (error) {
            return res.status(400).json({
                success: false, message: 'Members must be valid JSON'
            });
        }

        // Validate members is an array with content
        if (!Array.isArray(members)) {
            return res.status(400).json({
                success: false, message: 'Members must be an array'
            });
        }

        if (members.length < 1) {
            return res.status(400).json({
                success: false, message: 'At least one member is required'
            });
        }

        // Create unique members list including creator
        const allMembers = [...new Set([...members, req.user.id])];

        const chat = await chatModel.findById(req_data.chatId).select('-createdAt -updatedAt');

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

        if (chat.creator.toString() !== req.user.id.toString()) {
            return res.status(401).json({
                success: false, message: 'You are not allowed to add members in this group'
            });
        }

        if (req_data.name) {
            const name = formatName(req_data.name);
            chat.name = name;
        }

        // Handle profile image if provided
        if (req.file) {
            try {

                if (chat.profile?.public_id) {
                    await deleteFilesFromCloudinary(chat.profile.public_id);
                }
                const uploadResult = await uploadImage(req.file.path);

                if (!uploadResult) {
                    return res.status(500).json({
                        success: false, message: 'Failed to upload image'
                    });
                }

                chat.profile = {
                    image_url: uploadResult.secure_url,
                    public_id: uploadResult.public_id
                };
            } catch (imageError) {
                return res.status(500).json({
                    success: false, message: 'Error uploading profile image'
                });
            }
        }

        chat.members = allMembers;
        await chat.save();

        res.status(200).json({
            success: true,
            message: 'Group updated successfully',
            data: chat,
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

        if (chat.creator.toString() !== req.user.id.toString()) {
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
