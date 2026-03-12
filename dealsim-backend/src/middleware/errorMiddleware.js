export const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.url}:`, err);
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;
    // Handle Mongoose Validation Errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(', ');
    }
    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
//# sourceMappingURL=errorMiddleware.js.map