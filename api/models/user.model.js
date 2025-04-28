const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "Name is required"],
        minlength: [3, "Name must be at least 3 characters"],
        maxlength: [50, "Name must be at most 50 characters"],
    },
    username: {
        type: String,
        trim: true,
        required: [true, "Username is required"],
        minlength: [3, "Username must be at least 3 characters"],
        maxlength: [50, "Username must be at most 50 characters"],
        unique: true,
        lowercase: true,
        index: true,
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        required: [true, "Email is required"],
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
        index: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        maxlength: [50, "Password must be at most 20 characters"],
        select: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    profile: {
        type: String,
        // default: "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
    },
}, { timestamps: true, versionKey: false });

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// generate token 
userSchema.methods.generateToken = function () {
    return jwt.sign({
        id: this._id, email: this.email
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
}


userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

const User = mongoose.model("User", userSchema);
module.exports = User;