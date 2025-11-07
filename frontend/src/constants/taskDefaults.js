export const TASK_TYPES = [
  { value: 'TASK', label: 'Task', icon: 'pi pi-check-circle' },
  { value: 'MILESTONE', label: 'Milestone', icon: 'pi pi-flag' },
  { value: 'APPROVAL', label: 'Approval', icon: 'pi pi-verified' },
];

export const PRIORITY_OPTIONS = [
  { value: 'High', label: 'High', color: '#ef4444' },
  { value: 'Medium', label: 'Medium', color: '#f59e0b' },
  { value: 'Low', label: 'Low', color: '#3b82f6' },
];

export const STATUS_OPTIONS = [
  { value: 'On Track', label: 'On Track', color: '#10b981' },
  { value: 'At Risk', label: 'At Risk', color: '#f59e0b' },
  { value: 'Off Track', label: 'Off Track', color: '#ef4444' },
];

export const APPROVAL_STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending', color: '#f59e0b' },
  { value: 'Approved', label: 'Approved', color: '#10b981' },
  { value: 'Rejected', label: 'Rejected', color: '#ef4444' },
];

export const DEFAULT_TASK = {
  name: '',
  description: '',
  type: 'TASK',
  completed: false,
  sectionId: null,
  projectId: null,
  assigneeId: null,
  assigneeName: null,
  assigneeAvatar: null,
  startDate: null,
  dueDate: null,
  priority: null,
  status: null,
  approvalStatus: null,
  tags: [],
  customFields: {},
  orderIndex: 0,
};

export const DEFAULT_COLUMNS = [
  { id: 'assignee', name: 'Assignee', type: 'user', width: 200, visible: true, orderIndex: 0 },
  { id: 'dueDate', name: 'Due Date', type: 'date', width: 150, visible: true, orderIndex: 1 },
  { id: 'priority', name: 'Priority', type: 'select', width: 120, visible: true, orderIndex: 2, options: PRIORITY_OPTIONS },
  { id: 'status', name: 'Status', type: 'select', width: 150, visible: true, orderIndex: 3, options: STATUS_OPTIONS },
];
