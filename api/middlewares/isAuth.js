const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

module.exports.authMiddleware = async (req, res, next) => {
    try {

        const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false, message: 'Unauthorized. Please login.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false, message: 'Unauthorized. Please login.'
        });
    }
}

module.exports.socketAuthMiddleware = async (err, socket, next) => {
    // console.log('socketAuthMiddleware', socket.request.cookies);
    try {

        if (err) {
            return next(new Error(err));
        }

        const token = socket.request.cookies.token;

        if (!token) {
            return next(new Error("Unauthorized. Please login."));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return next(new Error("Unauthorized. Please login."));
        }

        const user = await User.findById(decoded.id);

        if (!user) {
            return next(new Error("Unauthorized. Please login."));
        }

        socket.user = user;
        return next();
    } catch (error) {
        // console.log(error);
        return next(new Error("Unauthorized Access. Please login."));
    }
}