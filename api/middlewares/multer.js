const multer = require('multer');

const multerUpload = multer({
    limits: {
        fileSize: 5 * 1024 * 1024 // no larger than 5mb
    }
});


// attach the upload middleware to the request object
const attachmentsMulter = multerUpload.array('files', 5); // 5 files max     // upload multiple files

// upload for signle file
const uploadSignleMulter = multerUpload.single('file'); // upload for signle file

module.exports = { attachmentsMulter, uploadSignleMulter };