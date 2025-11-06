const { Pool } = require('pg');
const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, NODE_ENV } = require('./env');
const logger = require('../utils/logger');

// Debug: Log connection parameters (remove in production)
if (NODE_ENV === 'development') {
    console.log('PostgreSQL Connection Config:');
    console.log('  Host:', DB_HOST);
    console.log('  Port:', DB_PORT);
    console.log('  Database:', DB_NAME);
    console.log('  User:', DB_USER);
    console.log('  Password:', DB_PASSWORD ? '***' + DB_PASSWORD.slice(-3) : 'EMPTY/UNDEFINED');
}

// Create PostgreSQL connection pool
const pool = new Pool({
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
const connectDB = async () => {
    try {
        const client = await pool.connect();
        logger.info(`PostgreSQL Connected: ${DB_HOST}:${DB_PORT}/${DB_NAME}`);

        // Test query
        const result = await client.query('SELECT NOW()');
        logger.info(`Database time: ${result.rows[0].now}`);

        client.release();

        // Connection events
        pool.on('error', (err) => {
            logger.error(`PostgreSQL pool error: ${err.message}`);
        });

        pool.on('connect', () => {
            if (NODE_ENV === 'development') {
                logger.debug('New PostgreSQL client connected');
            }
        });

        pool.on('remove', () => {
            if (NODE_ENV === 'development') {
                logger.debug('PostgreSQL client removed from pool');
            }
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await pool.end();
            logger.info('PostgreSQL pool closed through app termination');
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            await pool.end();
            logger.info('PostgreSQL pool closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        logger.error(`PostgreSQL connection failed: ${error.message}`);
        process.exit(1);
    }
};

module.exports = { connectDB, pool };
