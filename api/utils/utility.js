const mongoose = require('mongoose');

// validate mongoDb object id
const IdIsValid = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
}

const deleteFilesFromCloudinary = (publicIds) => { }

module.exports = {
    IdIsValid,
    deleteFilesFromCloudinary,
}