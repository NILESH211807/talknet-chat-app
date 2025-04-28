const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
const profilesDir = path.join(uploadsDir, 'profiles');

// Ensure directories exist
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, profilesDir); // Use absolute path
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, uuidv4() + ext);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);

    if (ext && mime) cb(null, true);
    else cb(new Error('Only JPEG, PNG, GIF, WEBP, and JPG images are allowed'));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});


module.exports = upload;
