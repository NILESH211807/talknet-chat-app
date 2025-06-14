const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const validators = require('../validators/authValidator');

router.route("/signup").post(validators.signup, authController.signup);
router.route("/login").post(validators.login, authController.login);

router.route("/logout").get(authController.logout);

module.exports = router;