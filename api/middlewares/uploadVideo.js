const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = /mp4|mov|avi|wmv|flv|mkv/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

    const allowedMimeTypes = [
        'video/mp4',
        'video/mov',
        'video/avi',
        'video/wmv',
        'video/flv',
        'video/mkv',
    ];
    const mimetype = allowedMimeTypes.includes(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only MP4, MOV, AVI, WMV, FLV, and MKV video files are allowed'));
    }
};

// Multer Upload Middleware
const uploadVideoMiddleware = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

module.exports = {
    uploadVideoMiddleware,
};