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

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
    logger.info(`👋 ${signal} RECEIVED. Shutting down gracefully...`);

    // Stop accepting new connections
    server.close(async () => {
        logger.info("🔒 HTTP server closed");

        try {
            // Stop scheduler service
            logger.info("⏸️  Stopping scheduler service...");
            SchedulerService.stop();

            // Disconnect from database
            logger.info("🔌 Disconnecting from database...");
            await prisma.$disconnect();
            logger.info("✅ Database disconnected");

            logger.info("💥 Process terminated gracefully!");
            process.exit(0);
        } catch (error) {
            logger.error("❌ Error during graceful shutdown:", error);
            process.exit(1);
        }
    });

    // Force shutdown after 30 seconds if graceful shutdown fails
    setTimeout(() => {
        logger.error("⚠️  Graceful shutdown timeout, forcing exit...");
        process.exit(1);
    }, 30000);
};

// Handle graceful shutdown on SIGTERM (docker stop, kubernetes)
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Handle graceful shutdown on SIGINT (Ctrl+C)
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
