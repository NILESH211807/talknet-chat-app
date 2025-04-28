const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');

router.route("/create").post(groupController.createGroup);
router.route("/update-group").put(groupController.updateGroup);
router.route("/delete-group").delete(groupController.deleteGroup);
router.route("/leave-group").delete(groupController.leaveGroup);

module.exports = router;