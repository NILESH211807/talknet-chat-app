const { rateLimit } = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        const resetTime = req.rateLimit.resetTime;
        const secondsLeft = Math.ceil((resetTime - new Date()) / 1000);
        const minutesLeft = Math.ceil(secondsLeft / 60);

        res.status(429).json({
            success: false,
            message: `Too many requests. Please try again in ${minutesLeft} minutes.`,
        });
    }
});

module.exports = {
    limiter
};