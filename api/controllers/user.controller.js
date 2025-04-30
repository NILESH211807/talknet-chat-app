const userModel = require('../models/user.model');
const requestModel = require('../models/request');
const chatModel = require('../models/chat.model');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { uploadImage, deleteFilesFromCloudinary } = require('../utils/cloudinary');


function formatName(name) {
   return name.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '').replace(/\b\w/g, (char) => char.toLocaleUpperCase());
}

function formatUsername(username) {
   username = username.replace(/\s+/g, '').replace(/^\s+|\s+$/g, '');
   if (username.charAt(0) !== '@') {
      username = '@' + username;
   }
   // Remove all non-alphanumeric characters except for "@" and ensure it's only letters/numbers
   username = username.replace(/[^a-zA-Z0-9@]/g, '');
   // Format: Make the first letter after "@" lowercase
   username = username.replace(/\b\w/g, (char) => char.toLocaleLowerCase());
   return username;
}


const queryFormatter = (query) => {
   return query
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, char => char.toUpperCase());
};

// fetch profile data
module.exports.fetchProfile = async (req, res) => {
   try {
      const user = await userModel.findById(req.user.id).select('-password -createdAt -updatedAt').lean();
      if (!user) {
         return res.status(404).json({
            success: false, message: 'Unauthorized. Please login.'
         });
      }
      // user.profile = `${req.protocol}://${req.get('host')}${user.profile}`;
      res.status(200).json({
         success: true, data: user
      });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
   }
}

// update profile
module.exports.updateProfile = async (req, res) => {
   try {

      const { name, username } = req.body;

      if (!name && !username) {
         return res.status(400).json({
            success: false, message: 'Name or username is required'
         });
      }

      const user = await userModel.findById(req.user.id);

      if (!user) {
         return res.status(404).json({
            success: false, message: 'Unauthorized. Please login.'
         });
      }
      if (name) {
         user.name = formatName(name);
      }

      if (username) {
         user.username = formatUsername(username);
      }

      if (!user.isModified('name') && !user.isModified('username')) {
         return res.status(400).json({
            success: false, message: 'No changes made'
         });
      }

      await user.save();
      res.status(200).json({
         success: true, message: 'Profile updated successfully',
      });

   } catch (error) {
      res.status(500).json({
         success: false, message: error.message || 'Internal server error'
      });
   }
}

// change password
module.exports.changePassword = async (req, res) => {
   const { oldPassword, newPassword } = req.body;

   if (!oldPassword && !newPassword) {
      return res.status(400).json({
         success: false, message: 'Old password and new password are required'
      });
   }

   try {

      const user = await userModel.findById(req.user.id).select('+password');

      if (!user) {
         return res.status(404).json({
            success: false, message: 'Unauthorized. Please login.'
         });
      }

      const isMatch = await user.comparePassword(oldPassword);

      if (!isMatch) {
         return res.status(400).json({
            success: false, message: 'Old password is incorrect'
         });
      }

      const checkSamePassword = await user.comparePassword(newPassword);

      if (checkSamePassword) {
         return res.status(400).json({
            success: false, message: 'New password cannot be the same as the old password'
         });
      }

      user.password = newPassword;

      await user.save();

      res.status(200).json({
         success: true, message: 'Password changed successfully',
      });

   } catch (error) {
      res.status(500).json({
         success: false, message: error.message || 'Internal server error'
      });
   }

}

// update profile image
module.exports.uploadProfileImage = async (req, res) => {
   try {
      if (!req.file) {
         return res.status(400).json({ message: 'No file uploaded' });
      }

      const user = await userModel.findById(req.user.id);
      if (!user) {
         return res.status(404).json({
            success: false, message: 'Unauthorized. Please login.'
         });
      }

      try {

         // if profile image is already uploaded, delete it
         if (user?.profile?.public_id) {
            await deleteFilesFromCloudinary(user.profile.public_id);
            user.profile = null;
         }

         const uploadResult = await uploadImage(req.file.path);

         if (!uploadResult) {
            return res.status(500).json({
               success: false, message: 'Failed to upload image'
            });
         }

         user.profile = {
            image_url: uploadResult.secure_url,
            public_id: uploadResult.public_id
         };

         await user.save();

         res.status(200).json({
            success: true,
            message: 'Profile image updated successfully',
            profileImage: user.profile.image_url
         });

      } catch (err) {
         console.error('Upload error:', err);
         res.status(500).json({
            success: false,
            message: err.message || 'Internal server error'
         });
      }

   } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
         success: false,
         message: error.message || 'Internal server error'
      });
   }
}
// logout
module.exports.logout = async (req, res) => {
   try {

      res.cookie('token', null, {
         httpOnly: true,
         expires: new Date(Date.now()),
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'lax'
      });

      res.status(200).json({
         success: true, message: 'Logout successful',
      });

   } catch (error) {
      res.status(500).json({
         success: false, message: error.message || 'Internal server error'
      });
   }
}

// send friend request
module.exports.sendFriendRequest = async (req, res) => {
   const { requestId } = req.body;
   if (!requestId) {
      return res.status(400).json({
         success: false, message: 'requestId is required'
      });
   }

   try {

      const request = await requestModel.findOne({
         $or: [
            { sender: req.user.id, receiver: requestId },
            { sender: requestId, receiver: req.user.id }
         ]
      });

      if (request) {
         return res.status(400).json({
            success: false, message: 'Request already sent'
         });
      }

      if (req.user.id === requestId) {
         return res.status(400).json({
            success: false, message: 'You cannot send request to yourself'
         });
      }

      await requestModel.create({
         sender: req.user.id,
         receiver: requestId
      });

      // emitEvent(req, NEW_REQUEST, [requestId]);

      res.status(200).json({
         success: true, message: 'Request sent successfully',
      });

   } catch (error) {
      res.status(500).json({
         success: false, message: error.message || 'Internal server error'
      });
   }
}

// accept friend request
module.exports.acceptFriendRequest = async (req, res) => {
   const { requestId, accept } = req.body;
   if (!requestId) {
      return res.status(400).json({
         success: false, message: 'requestId is required'
      });
   }

   try {

      if (accept === undefined) {
         return res.status(400).json({
            success: false, message: 'accept is required'
         });
      }

      const request = await requestModel.findById(requestId)
         .populate('sender', 'name profile')
         .populate('receiver', 'name profile');

      if (!request) {
         return res.status(400).json({
            success: false, message: 'Request not found'
         });
      }

      if (request.receiver._id.toString() !== req.user.id) {
         return res.status(401).json({
            success: false, message: 'You are not allowed to accept this request'
         });
      }

      if (!accept) {
         await request.deleteOne();
         return res.status(200).json({
            success: true, message: 'Request rejected successfully',
         });
      }

      if (req.user._id === request.sender._id) {
         return res.status(400).json({
            success: false, message: 'You cannot accept your own request'
         });
      }

      const members = [request.sender._id, request.receiver._id];

      await Promise.all([
         chatModel.create({
            name: `${request.sender.name} & ${request.receiver.name}`,
            members
         }),
         request.deleteOne(),
      ]);

      // emitEvent(req, REFETCH_CHAT, members);

      res.status(200).json({
         success: true,
         message: 'Request accepted successfully',
         data: {
            sender: request.sender,
            receiver: request.receiver
         }
      });

   } catch (error) {
      res.status(500).json({
         success: false, message: error.message || 'Internal server error'
      });
   }
}

// notifications
module.exports.getAllNotifications = async (req, res) => {
   try {

      const requests = await requestModel.find({ receiver: req.user.id })
         .populate('sender', 'name profile')
         .lean();

      res.status(200).json({
         success: true, data: requests
      });

   } catch (error) {
      res.status(500).json({
         success: false, message: error.message || 'Internal server error'
      });
   }
}

// search user
module.exports.searchUser = async (req, res) => {
   try {
      const { query } = req.query;

      if (!query) {
         return res.status(400).json({
            success: false, message: 'Query is required'
         });
      }

      const formattedQuery = queryFormatter(query);

      const users = await userModel.find({
         $or: [
            { name: { $regex: formattedQuery, $options: 'i' } },
            { username: { $regex: formattedQuery, $options: 'i' } }
         ], _id: { $ne: req.user.id }
      }).select('name username profile').lean();

      res.status(200).json({
         success: true, data: users
      });

   } catch (error) {
      res.status(500).json({
         success: false, message: error.message || 'Internal server error'
      });
   }
}
