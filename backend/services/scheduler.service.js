const prisma = require('../config/prisma');
const logger = require('../utils/logger');

/**
 * Scheduler Service
 * Handles scheduled background tasks
 */

class SchedulerService {
  /**
   * Start all scheduled tasks
   */
  static start() {
    logger.info('Starting scheduler service...');

    // Run auto-delete job every day at 2 AM
    this.scheduleDaily('02:00', this.autoDeleteTrashedProjects);

    logger.info('Scheduler service started successfully');
  }

  /**
   * Schedule a task to run daily at a specific time
   * @param {string} time - Time in HH:MM format (24-hour)
   * @param {Function} task - Task function to execute
   */
  static scheduleDaily(time, task) {
    const [hours, minutes] = time.split(':').map(Number);

    const runTask = () => {
      const now = new Date();
      const scheduledTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes,
        0
      );

      if (now > scheduledTime) {
        // If the time has passed today, schedule for tomorrow
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const delay = scheduledTime.getTime() - now.getTime();

      setTimeout(async () => {
        try {
          await task();
        } catch (error) {
          logger.error('Scheduled task error:', error);
        }
        // Schedule next run
        runTask();
      }, delay);

      logger.info(`Task scheduled for ${scheduledTime.toISOString()}`);
    };

    runTask();
  }

  /**
   * Auto-delete projects that have been in trash for more than 30 days
   */
  static async autoDeleteTrashedProjects() {
    try {
      logger.info('Running auto-delete job for trashed projects...');

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Find projects deleted more than 30 days ago
      const projectsToDelete = await prisma.project.findMany({
        where: {
          deletedAt: {
            not: null,
            lte: thirtyDaysAgo,
          },
        },
        select: {
          id: true,
          name: true,
          deletedAt: true,
        },
      });

      if (projectsToDelete.length === 0) {
        logger.info('No projects to auto-delete');
        return;
      }

      logger.info(`Found ${projectsToDelete.length} projects to auto-delete`);

      // Delete each project
      for (const project of projectsToDelete) {
        try {
          await prisma.project.delete({
            where: { id: project.id },
          });

          logger.info(
            `Auto-deleted project: ${project.name} (ID: ${project.id}), ` +
            `deleted on: ${project.deletedAt.toISOString()}`
          );
        } catch (error) {
          logger.error(`Failed to auto-delete project ${project.id}:`, error);
        }
      }

      logger.info(
        `Auto-delete job completed. Deleted ${projectsToDelete.length} projects`
      );
    } catch (error) {
      logger.error('Auto-delete job failed:', error);
      throw error;
    }
  }

  /**
   * Manually trigger auto-delete job (for testing)
   */
  static async triggerAutoDelete() {
    return this.autoDeleteTrashedProjects();
  }
}

module.exports = SchedulerService;
