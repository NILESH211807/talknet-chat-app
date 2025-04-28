const jwt = require("jsonwebtoken");

module.exports = authMiddleware = async (req, res, next) => {
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
            success: false, message: error.message || 'Unauthorized. Please login.'
        });
    }
}