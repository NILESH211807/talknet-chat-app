const express = require('express');
const router = express.Router();

const uploadController = require('../controllers/upload.controller');
const { uploadAudioMiddleware } = require('../middlewares/upload.audio');
const { uploadProfile } = require('../middlewares/upload');
const { errorHandler } = require('../middlewares/error');
const { uploadVideoMiddleware } = require('../middlewares/uploadVideo');
const { uploadDocumentMiddleware } = require('../middlewares/uploadDocument');

router.route("/image").post(uploadProfile.single('image'), errorHandler, uploadController.uploadImage); // upload image
router.route("/audio").post(uploadAudioMiddleware.single('audio'), errorHandler, uploadController.uploadAudio); // upload audio
router.route("/video").post(uploadVideoMiddleware.single('video'), uploadController.uploadVideo); // upload video
// router.route("/document").post(uploadDocumentMiddleware.single('document'), uploadController.uploadDocument); // upload document

module.exports = router;