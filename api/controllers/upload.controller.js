const cloudinary = require('cloudinary').v2;
const { cloudinaryConfig } = require('../config/cloudinary.config');
cloudinary.config(cloudinaryConfig);


// upload image
module.exports.uploadImage = async (req, res) => {

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {

        const uploadResult = await cloudinary.uploader.upload(
            req.file.path, {
            folder: "talknet/attachments/images",
            transformation: {
                quality: "auto:low",
                fetch_format: "webp"
            }
        });

        if (!uploadResult || !uploadResult.secure_url) {
            return res.status(500).json({
                success: false, message: 'Failed to upload image'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                image_url: uploadResult.secure_url,
                public_id: uploadResult.public_id
            },
        });

    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

// upload audio
module.exports.uploadAudio = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {

        const uploadResult = await cloudinary.uploader.upload(
            req.file.path,
            {
                folder: "talknet/attachments/audio",
                resource_type: "video",
                format: "mp3",
                transformation: {
                    quality: "auto:low",
                    fetch_format: "mp3"
                }
            }
        );


        if (!uploadResult || !uploadResult.secure_url) {
            return res.status(500).json({
                success: false, message: 'Failed to upload audio'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Audio uploaded successfully',
            data: {
                audio_url: uploadResult.secure_url,
                public_id: uploadResult.public_id
            },
        });

    } catch (error) {
        console.error('Error uploading audio:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
}

// upload video
module.exports.uploadVideo = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {

        const uploadResult = await cloudinary.uploader.upload(
            req.file.path,
            {
                folder: "talknet/attachments/video",
                resource_type: "video",
                format: "mp4",
                transformation: {
                    quality: "auto:low",
                    fetch_format: "mp4"
                }
            }
        );


        if (!uploadResult || !uploadResult.secure_url) {
            return res.status(500).json({
                success: false, message: 'Failed to upload video'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Video uploaded successfully',
            data: {
                video_url: uploadResult.secure_url,
                public_id: uploadResult.public_id
            },
        });

    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
}

// upload document
module.exports.uploadDocument = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {

        const uploadResult = await cloudinary.uploader.upload(
            req.file.path,
            {
                folder: "talknet/attachments/documents",
                resource_type: "raw",
                format: "auto",
                transformation: {
                    quality: "auto:low",
                    fetch_format: "auto"
                }
            }
        );

        if (!uploadResult || !uploadResult.secure_url) {
            return res.status(500).json({
                success: false, message: 'Failed to upload document'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Document uploaded successfully',
            data: {
                document_url: uploadResult.secure_url,
                public_id: uploadResult.public_id
            },
        });

    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
}