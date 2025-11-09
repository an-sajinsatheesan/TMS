const app = require("./app");
const prisma = require('./config/prisma');
const { PORT, NODE_ENV } = require("./config/env");
const logger = require("./utils/logger");
const SchedulerService = require("./services/scheduler.service");

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    logger.error(`${err.name}: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
});

// Connect to database
const connectDB = async () => {
    try {
        await prisma.$connect();
        logger.info('✅ Prisma connected to PostgreSQL');

        // Start scheduler service after database connection
        SchedulerService.start();
    } catch (error) {
        logger.error('❌ Prisma connection failed:', error);
        process.exit(1);
    }
};

connectDB();

// Start server
const server = app.listen(PORT, () => {
    logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
    logger.info(`Health check: http://localhost:${PORT}/api/v1/health`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    logger.error("UNHANDLED REJECTION! 💥 Shutting down...");
    logger.error(`${err.name}: ${err.message}`);
    console.error(err.stack);
    server.close(async () => {
        await prisma.$disconnect();
        process.exit(1);
    });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
    logger.info("👋 SIGTERM RECEIVED. Shutting down gracefully");
    server.close(async () => {
        await prisma.$disconnect();
        logger.info("💥 Process terminated!");
    });
});
