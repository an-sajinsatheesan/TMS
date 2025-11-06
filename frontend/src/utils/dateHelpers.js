import { format, formatDistance, isAfter, isBefore, isToday, isPast, isFuture, parseISO } from 'date-fns';

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString, formatStr = 'MMM dd, yyyy') => {
  if (!dateString) return null;
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};

/**
 * Format a date relative to now (e.g., "2 days ago")
 */
export const formatRelativeDate = (dateString) => {
  if (!dateString) return null;
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return formatDistance(date, new Date(), { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return null;
  }
};

/**
 * Check if a task is overdue
 */
export const isOverdue = (dueDate, completed = false) => {
  if (!dueDate || completed) return false;
  try {
    const date = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
    return isPast(date) && !isToday(date);
  } catch (error) {
    console.error('Error checking overdue:', error);
    return false;
  }
};

/**
 * Check if a task is due today
 */
export const isDueToday = (dueDate) => {
  if (!dueDate) return false;
  try {
    const date = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
    return isToday(date);
  } catch (error) {
    console.error('Error checking due today:', error);
    return false;
  }
};

/**
 * Get the due date status color
 */
export const getDueDateColor = (dueDate, completed = false) => {
  if (!dueDate || completed) return 'text-gray-500';

  if (isOverdue(dueDate)) return 'text-red-600';
  if (isDueToday(dueDate)) return 'text-orange-600';
  return 'text-gray-700';
};

/**
 * Parse ISO date string to Date object
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  try {
    return typeof dateString === 'string' ? parseISO(dateString) : dateString;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

/**
 * Convert Date object to ISO string
 */
export const toISOString = (date) => {
  if (!date) return null;
  try {
    return date instanceof Date ? date.toISOString() : date;
  } catch (error) {
    console.error('Error converting to ISO string:', error);
    return null;
  }
};
