const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { NODE_ENV } = require('./config/env');
const logger = require('./utils/logger');

// Import middlewares
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');

// Import routes
const routes = require('./routes');

// Initialize Express app
const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/verify-otp', authLimiter);

// CORS configuration - Require CLIENT_URL to be set
if (!process.env.CLIENT_URL) {
    logger.error('CLIENT_URL environment variable is not set!');
    throw new Error('CLIENT_URL environment variable is required for CORS configuration');
}

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', {
        stream: {
            write: (message) => logger.info(message.trim())
        }
    }));
}

// API Routes
app.use('/api/v1', routes);

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'StackFlow CRM API',
        version: '1.0.0',
        environment: NODE_ENV,
    });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;