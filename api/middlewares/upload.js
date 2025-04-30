const path = require('path');
const multer = require('multer');


const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);

    if (ext && mime) cb(null, true);
    else  cb(new Error('Only JPEG, PNG, GIF, WEBP, and JPG images are allowed'), false); // Reject the file
};


// Multer Upload Middleware
const uploadProfile = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

module.exports = {
    uploadProfile,
};