// error handler 

const errorHandler = (err, req, res, next) => {
    const statusCode = 500;

    res.status(statusCode);

    res.json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
}

module.exports = {
    errorHandler
}