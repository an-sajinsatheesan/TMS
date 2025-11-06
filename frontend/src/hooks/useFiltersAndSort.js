import { useState, useMemo } from 'react';
import { filterTasks, sortTasks } from '../utils/taskHelpers';

/**
 * Custom hook for managing task filters and sorting
 */
export function useFiltersAndSort(tasks) {
  const [filters, setFilters] = useState([]);
  const [sortBy, setSortBy] = useState('orderIndex');
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Add a filter
   */
  const addFilter = (field, value) => {
    setFilters((prev) => {
      // Remove existing filter for the same field
      const filtered = prev.filter((f) => f.field !== field);
      return [...filtered, { field, value }];
    });
  };

  /**
   * Remove a filter
   */
  const removeFilter = (field) => {
    setFilters((prev) => prev.filter((f) => f.field !== field));
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setFilters([]);
    setSearchQuery('');
  };

  /**
   * Toggle a filter value
   */
  const toggleFilter = (field, value) => {
    setFilters((prev) => {
      const existing = prev.find((f) => f.field === field && f.value === value);
      if (existing) {
        return prev.filter((f) => !(f.field === field && f.value === value));
      }
      return [...prev, { field, value }];
    });
  };

  /**
   * Apply filters and sorting to tasks
   */
  const processedTasks = useMemo(() => {
    let result = [...tasks];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.name.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    result = filterTasks(result, filters);

    // Apply sorting
    result = sortTasks(result, sortBy);

    return result;
  }, [tasks, filters, sortBy, searchQuery]);

  /**
   * Get active filter count
   */
  const activeFilterCount = filters.length + (searchQuery ? 1 : 0);

  return {
    filters,
    sortBy,
    searchQuery,
    processedTasks,
    activeFilterCount,
    addFilter,
    removeFilter,
    clearFilters,
    toggleFilter,
    setSortBy,
    setSearchQuery,
    setFilters, // Export setFilters for direct filter array management
  };
}
