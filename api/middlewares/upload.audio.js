const path = require('path');
const multer = require('multer');


const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = /mp3|mp4|wav|ogg/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

    const allowedMimeTypes = [
        'audio/mpeg',     // .mp3
        'audio/wav',      // .wav
        'audio/ogg',      // .ogg
        'video/mp4',      // .mp4 (used for some audio containers too)
    ];
    const mimetype = allowedMimeTypes.includes(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only MP3, MP4, WAV, and OGG audio files are allowed'));
    }
};


// Multer Upload Middleware
const uploadAudioMiddleware = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

module.exports = {
    uploadAudioMiddleware,
};  