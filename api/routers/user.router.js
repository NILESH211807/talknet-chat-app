const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const upload = require('../middlewares/upload');

router.route("/profile").get(userController.fetchProfile); // fetch profile data
router.route("/update-profile").put(userController.updateProfile); // update profile data
router.route("/change-password").put(userController.changePassword); // change password
router.post("/upload-profile",
    upload.single('profile'),
    userController.uploadProfileImage
); // update profile data
// router.route("/upload-profile").post(upload.single('profile'), userController.uploadProfileImage); // update profile image
router.route("/logout").get(userController.logout); // logout
router.route("/send-friend-request").put(userController.sendFriendRequest); // send friend request
router.route("/accept-friend-request").put(userController.acceptFriendRequest); // accept friend request
router.route("/notifications").get(userController.getAllNotifications); // get all notifications

router.route("/search").get(userController.searchUser);

module.exports = router;