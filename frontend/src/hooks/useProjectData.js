import { useState, useEffect, useCallback, useRef } from 'react';
import { tasksService } from '../services/api/tasks.service';
import { sectionsService } from '../services/api/sections.service';

/**
 * Custom hook for managing project data (sections and tasks)
 * Handles fetching, caching, and CRUD operations with optimistic updates
 *
 * OPTIMIZATIONS:
 * - Uses useRef to avoid stale closures in callbacks
 * - Cleanup function prevents memory leaks
 * - Callbacks don't include state in dependencies
 */
export function useProjectData(projectId) {
  const [sections, setSections] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use refs to avoid stale closures in callbacks
  const tasksRef = useRef(tasks);
  const sectionsRef = useRef(sections);

  // Keep refs in sync with state
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  // Load project data from API
  useEffect(() => {
    let isMounted = true;

    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch sections and tasks in parallel
        // Use nested: true to get hierarchical structure
        const [sectionsResponse, tasksResponse] = await Promise.all([
          sectionsService.getAll(projectId),
          tasksService.getAll(projectId, { limit: 1000, nested: true }),
        ]);

        if (!isMounted) return;

        // Extract data from response
        const sectionsData = sectionsResponse?.data || [];
        const tasksData = tasksResponse?.data?.data || tasksResponse?.data || [];

        setSections(sectionsData);
        setTasks(tasksData);
      } catch (err) {
        console.error('Failed to load project data:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load project data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  /**
   * Helper: Recursively update a task in nested structure
   */
  const updateTaskInTree = (tasks, taskId, updates) => {
    return tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, ...updates, updatedAt: new Date().toISOString() };
      }
      if (task.subtasks && task.subtasks.length > 0) {
        return {
          ...task,
          subtasks: updateTaskInTree(task.subtasks, taskId, updates),
        };
      }
      return task;
    });
  };

  /**
   * Helper: Find a task in nested structure
   */
  const findTaskInTree = (tasks, taskId) => {
    for (const task of tasks) {
      if (task.id === taskId) return task;
      if (task.subtasks && task.subtasks.length > 0) {
        const found = findTaskInTree(task.subtasks, taskId);
        if (found) return found;
      }
    }
    return null;
  };

  /**
   * Update a task with optimistic update
   * Uses ref to avoid stale closure
   * Now handles nested task structure
   */
  const updateTask = useCallback(async (taskId, updates) => {
    // Keep backup for rollback using ref
    const taskBackup = findTaskInTree(tasksRef.current, taskId);

    // Optimistic update - recursively update in nested structure
    setTasks((prev) => updateTaskInTree(prev, taskId, updates));

    try {
      const response = await tasksService.update(taskId, updates);
      // Update with server response - recursively
      setTasks((prev) => updateTaskInTree(prev, taskId, response.data));
    } catch (err) {
      console.error('Failed to update task:', err);
      // Revert on error
      if (taskBackup) {
        setTasks((prev) => updateTaskInTree(prev, taskId, taskBackup));
      }
      setError('Failed to update task');
      throw err;
    }
  }, []); // Empty deps - uses ref instead

  /**
   * Create a new task
   */
  const createTask = useCallback(async (sectionId, taskData = {}) => {
    const tempId = `temp-${Date.now()}`;
    const newTask = {
      id: tempId,
      title: taskData.title || taskData.name || '',
      name: taskData.title || taskData.name || '',
      description: taskData.description || '',
      completed: false,
      sectionId,
      projectId,
      assigneeId: taskData.assigneeId || null,
      assigneeName: taskData.assigneeName || null,
      assigneeAvatar: null,
      startDate: taskData.startDate || null,
      dueDate: taskData.dueDate || null,
      priority: taskData.priority || null,
      status: taskData.status || null,
      tags: taskData.tags || [],
      customFields: {},
      orderIndex: tasksRef.current.filter((t) => t.sectionId === sectionId).length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      subtaskCount: 0,
      isExpanded: false,
    };

    // Optimistic update
    setTasks((prev) => [...prev, newTask]);

    try {
      const response = await tasksService.create(projectId, {
        sectionId,
        title: newTask.title,
        description: newTask.description,
        assigneeId: newTask.assigneeId,
        startDate: newTask.startDate,
        dueDate: newTask.dueDate,
        priority: newTask.priority,
        status: newTask.status,
        tags: newTask.tags,
      });

      // Replace temp task with real task from server
      setTasks((prev) =>
        prev.map((t) => (t.id === tempId ? response.data : t))
      );
      return response.data;
    } catch (err) {
      console.error('Failed to create task:', err);
      // Remove temp task on error
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      setError('Failed to create task');
      throw err;
    }
  }, [projectId]); // Only projectId in deps

  /**
   * Delete a task
   */
  const deleteTask = useCallback(async (taskId) => {
    // Keep backup for rollback
    const taskBackup = tasksRef.current.find((t) => t.id === taskId);

    // Optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      await tasksService.delete(taskId);
    } catch (err) {
      console.error('Failed to delete task:', err);
      // Restore on error
      if (taskBackup) {
        setTasks((prev) => [...prev, taskBackup]);
      }
      setError('Failed to delete task');
      throw err;
    }
  }, []); // Empty deps

  /**
   * Move a task to a different section
   */
  const moveTask = useCallback(async (taskId, toSectionId, orderIndex = null) => {
    // Keep backup for rollback
    const taskBackup = tasksRef.current.find((t) => t.id === taskId);

    // Optimistic update
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) return prev;

      return prev.map((t) => {
        if (t.id === taskId) {
          return { ...t, sectionId: toSectionId, orderIndex: orderIndex ?? t.orderIndex };
        }
        return t;
      });
    });

    try {
      await tasksService.move(taskId, toSectionId, orderIndex);
    } catch (err) {
      console.error('Failed to move task:', err);
      // Restore on error
      if (taskBackup) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? taskBackup : t))
        );
      }
      setError('Failed to move task');
      throw err;
    }
  }, []); // Empty deps

  /**
   * Update a section
   */
  const updateSection = useCallback(async (sectionId, updates) => {
    // Keep backup for rollback
    const sectionBackup = sectionsRef.current.find((s) => s.id === sectionId);

    // Optimistic update
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    );

    try {
      const response = await sectionsService.update(sectionId, updates);
      // Update with server response
      setSections((prev) =>
        prev.map((s) => (s.id === sectionId ? response.data : s))
      );
    } catch (err) {
      console.error('Failed to update section:', err);
      // Restore on error
      if (sectionBackup) {
        setSections((prev) =>
          prev.map((s) => (s.id === sectionId ? sectionBackup : s))
        );
      }
      setError('Failed to update section');
      throw err;
    }
  }, []); // Empty deps

  /**
   * Create a new section
   */
  const createSection = useCallback(async (sectionData = {}) => {
    const tempId = `temp-${Date.now()}`;
    const newSection = {
      id: tempId,
      name: sectionData.name || 'New Section',
      projectId,
      color: sectionData.color || '#94a3b8',
      orderIndex: sectionsRef.current.length,
      isCollapsed: false,
      kanbanWipLimit: null,
      taskCount: 0,
    };

    // Optimistic update
    setSections((prev) => [...prev, newSection]);

    try {
      const response = await sectionsService.create(projectId, {
        name: newSection.name,
        color: newSection.color,
      });

      // Replace temp section with real section from server
      setSections((prev) =>
        prev.map((s) => (s.id === tempId ? response.data : s))
      );
      return response.data;
    } catch (err) {
      console.error('Failed to create section:', err);
      // Remove temp section on error
      setSections((prev) => prev.filter((s) => s.id !== tempId));
      setError('Failed to create section');
      throw err;
    }
  }, [projectId]); // Only projectId

  /**
   * Delete a section
   */
  const deleteSection = useCallback(async (sectionId) => {
    // Keep backup for rollback
    const sectionBackup = sectionsRef.current.find((s) => s.id === sectionId);

    // Optimistic update
    setSections((prev) => prev.filter((s) => s.id !== sectionId));

    try {
      await sectionsService.delete(sectionId);
    } catch (err) {
      console.error('Failed to delete section:', err);
      // Restore on error
      if (sectionBackup) {
        setSections((prev) => [...prev, sectionBackup]);
      }
      setError('Failed to delete section');
      throw err;
    }
  }, []); // Empty deps

  /**
   * Create a subtask
   */
  const createSubtask = useCallback(async (parentTaskId, subtaskData = {}) => {
    const parentTask = tasksRef.current.find((t) => t.id === parentTaskId);
    if (!parentTask) {
      console.error('Parent task not found');
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const newSubtask = {
      id: tempId,
      title: subtaskData.title || '',
      name: subtaskData.title || '',
      description: '',
      completed: false,
      sectionId: parentTask.sectionId,
      projectId,
      assigneeId: null,
      assigneeName: null,
      assigneeAvatar: null,
      startDate: null,
      dueDate: null,
      priority: null,
      status: null,
      tags: [],
      customFields: {},
      parentId: parentTaskId,
      level: (parentTask.level || 0) + 1,
      orderIndex: tasksRef.current.filter((t) => t.parentId === parentTaskId).length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      subtaskCount: 0,
      isExpanded: false,
    };

    // Optimistic update
    setTasks((prev) => [...prev, newSubtask]);

    try {
      const response = await tasksService.createSubtask(parentTaskId, {
        title: newSubtask.title,
      });

      // Replace temp task with real task from server
      setTasks((prev) =>
        prev.map((t) => (t.id === tempId ? response.data : t))
      );

      // Update parent task's subtask count
      setTasks((prev) =>
        prev.map((t) =>
          t.id === parentTaskId ? { ...t, subtaskCount: (t.subtaskCount || 0) + 1 } : t
        )
      );

      return response.data;
    } catch (err) {
      console.error('Failed to create subtask:', err);
      // Remove temp task on error
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      setError('Failed to create subtask');
      throw err;
    }
  }, [projectId]); // Only projectId

  /**
   * Duplicate a task
   */
  const duplicateTask = useCallback(async (taskId) => {
    try {
      const response = await tasksService.duplicate(taskId);

      // Add the duplicated task to the state
      setTasks((prev) => [...prev, response.data]);

      return response.data;
    } catch (err) {
      console.error('Failed to duplicate task:', err);
      setError('Failed to duplicate task');
      throw err;
    }
  }, []);

  return {
    sections,
    tasks,
    loading,
    error,
    updateTask,
    createTask,
    deleteTask,
    moveTask,
    updateSection,
    createSection,
    deleteSection,
    createSubtask,
    duplicateTask,
  };
}
