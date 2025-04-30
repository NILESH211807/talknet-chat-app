const cloudinary = require('cloudinary').v2;
const { cloudinaryConfig } = require('../config/cloudinary.config');

cloudinary.config(cloudinaryConfig);

const uploadImage = async (file) => {

    try {
        const uploadResult = await cloudinary.uploader.upload(
            file, {
            folder: "profiles",
            transformation: {
                width: 500,
                height: 500,
                crop: "thumb",
                gravity: "face",
                quality: "auto:low",
                fetch_format: "webp"
            }
        });

        return uploadResult;

    } catch (error) {
        console.error('Error uploading image:', error);
        return error;
    }
}


const deleteFilesFromCloudinary = async (publicIds) => {
    try {
        const result = await cloudinary.uploader.destroy(publicIds);
        return result;
    } catch (error) {
        return error;
    }
}

module.exports = {
    uploadImage, deleteFilesFromCloudinary,
};
