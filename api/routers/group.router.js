const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const { uploadProfile } = require('../middlewares/upload');

router.route("/create").post(uploadProfile.single("profile_image"), groupController.createGroup);
router.route("/update-group").put(uploadProfile.single("profile_image"), groupController.updateGroup);
router.route("/delete-group").delete(groupController.deleteGroup);
router.route("/leave-group").delete(groupController.leaveGroup);

module.exports = router;