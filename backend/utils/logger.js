const winston = require('winston');
const { NODE_ENV } = require('../config/env');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let metaStr = '';
        if (Object.keys(meta).length > 0) {
            metaStr = JSON.stringify(meta, null, 2);
        }
        return `${timestamp} [${level}]: ${message} ${metaStr}`;
    })
);

// Create transports
const transports = [
    // Console transport
    new winston.transports.Console({
        format: NODE_ENV === 'development' ? consoleFormat : logFormat,
    }),
];

// Add file transports in production
if (NODE_ENV === 'production') {
    transports.push(
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: logFormat,
        }),
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: logFormat,
        })
    );
}

// Create logger instance
const logger = winston.createLogger({
    level: NODE_ENV === 'development' ? 'debug' : 'info',
    format: logFormat,
    transports,
    exitOnError: false,
});

// Create stream for morgan
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};

module.exports = logger;
