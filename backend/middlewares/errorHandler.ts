const logger = require('../utils/logger');
const { NODE_ENV } = require('../config/env');
const { Prisma } = require('@prisma/client');

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Log error for debugging
    logger.error(`Error: ${err.message}`, {
        stack: err.stack,
        path: req.path,
        method: req.method,
        statusCode,
    });

    // Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                // Unique constraint violation
                statusCode = 409;
                message = 'A record with this value already exists';
                break;
            case 'P2003':
                // Foreign key constraint violation
                statusCode = 400;
                message = 'Referenced resource not found';
                break;
            case 'P2025':
                // Record not found
                statusCode = 404;
                message = 'Record not found';
                break;
            case 'P2014':
                // Required relation missing
                statusCode = 400;
                message = 'Required relation is missing';
                break;
            default:
                statusCode = 400;
                message = 'Database operation failed';
        }
    }

    // Prisma validation errors
    if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = 'Invalid data provided';
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token has expired';
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        message,
        ...(NODE_ENV === 'development' && {
            stack: err.stack,
            error: err,
        }),
    });
};

module.exports = errorHandler;
