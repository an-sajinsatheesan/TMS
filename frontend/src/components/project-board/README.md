# Dashboard Layout Components

This directory contains the complete dashboard layout system for the Project Management and Task Management Web App.

## 📁 Component Structure

### `DashboardLayout.jsx`
Main layout wrapper component that orchestrates all dashboard sub-components.

**Features:**
- Full-page responsive layout
- Sidebar state management (collapsed/expanded)
- View mode management (List, Kanban, Table)
- Event handler integration for all actions
- Mobile overlay for sidebar

**Props:**
- `children` - Content to be rendered in the main scrollable area

**Usage:**
```jsx
import DashboardLayout from '@/components/dashboard/DashboardLayout';

<DashboardLayout>
  <YourContent />
</DashboardLayout>
```

---

### `Sidebar.jsx`
Collapsible sidebar navigation with multiple sections.

**Features:**
- Collapsible with smooth animations
- Icon-only mode when collapsed
- Hover tooltips in collapsed state
- Main navigation (Dashboard, Notifications, Today's Tasks)
- Favorites section with color-coded projects
- Projects section with all projects
- User dropdown menu with comprehensive options

**Props:**
- `isCollapsed` - Boolean state for collapsed/expanded
- `setIsCollapsed` - Function to toggle sidebar state

**Sections:**
1. **Main Navigation:** Dashboard, Notifications, Today's Tasks
2. **Favorites:** Quick access to starred projects
3. **Projects:** Complete project list
4. **User Menu:** Profile and settings dropdown

---

### `DashboardHeader.jsx`
Fixed header with project information and actions.

**Features:**
- Project name and creation date
- Status dropdown (Active, Paused, Completed, Archived)
- Member avatar group (shows 4 + overflow count)
- Action buttons: Delete, Invite, Settings
- Tooltips for all interactive elements
- Responsive design

**Props:**
- `project` - Project object with name, date, status
- `onStatusChange` - Handler for status changes
- `onDelete` - Handler for project deletion
- `onInvite` - Handler for inviting members
- `onSettings` - Handler for project settings

**Mock Data:**
```javascript
const project = {
  name: 'Website Redesign Project',
  date: 'Created on January 15, 2024',
  status: 'active'
};
```

---

### `ViewModeBar.jsx`
View mode selector with tabs for different project views.

**Features:**
- Tab selection for List, Kanban, Table views
- Future-ready tabs for Calendar and Gantt (disabled)
- Task status summary (Active, Done, Blocked)
- Sticky positioning below header
- Responsive tab labels

**Props:**
- `currentView` - Current active view ('list', 'kanban', 'table')
- `onViewChange` - Handler for view changes

**Available Views:**
- ✅ List - Traditional list view with sections
- ✅ Kanban - Board view with status columns
- ✅ Table - Tabular data view
- 🚧 Calendar - Coming soon
- 🚧 Gantt - Coming soon

---

### `ProjectActionBar.jsx`
Action toolbar for task and view management.

**Features:**
- Add Task dropdown (Milestone, Task, Subtask)
- Add Section button
- Sort, Column Customization, Filter buttons
- Responsive button labels
- Tooltips for all actions

**Props:**
- `onAddTask` - Handler for adding tasks (receives type)
- `onAddSection` - Handler for adding sections
- `onSort` - Handler for sorting
- `onColumnCustomize` - Handler for column customization
- `onFilter` - Handler for filtering

---

### `DashboardContent.jsx`
Content renderer supporting multiple view modes.

**Features:**
- List view with project overview cards and grouped tasks
- Kanban view with status-based columns
- Table view with comprehensive task details
- Status icons and priority badges
- Mock data for demonstration

**Props:**
- `viewMode` - Current view mode ('list', 'kanban', 'table')

**Mock Task Structure:**
```javascript
{
  id: 1,
  title: 'Design new homepage layout',
  status: 'in-progress',
  priority: 'high',
  assignee: 'John Doe',
  dueDate: '2024-01-20',
  section: 'Design'
}
```

---

## 🎨 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    DashboardLayout                          │
├──────────┬──────────────────────────────────────────────────┤
│          │          DashboardHeader (Fixed)                 │
│          ├──────────────────────────────────────────────────┤
│          │          ViewModeBar (Fixed)                     │
│  Sidebar ├──────────────────────────────────────────────────┤
│          │          ProjectActionBar (Fixed)                │
│ (Fixed)  ├──────────────────────────────────────────────────┤
│          │                                                  │
│          │         DashboardContent (Scrollable)            │
│          │                                                  │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 📱 Responsive Behavior

### Desktop (lg+)
- Sidebar fully visible (264px width)
- All button labels visible
- Full member avatar group
- Complete tab labels

### Tablet (md - lg)
- Sidebar collapsible
- Abbreviated button labels
- Visible member count
- Tab icons + labels

### Mobile (< md)
- Sidebar as overlay with backdrop
- Icon-only buttons
- Compact avatar display
- Icon-only tabs

---

## 🎯 Key Features

### Collapsible Sidebar
- Toggle button positioned on right edge
- Smooth transition animation (300ms)
- Icon-only mode with hover tooltips
- Persistent state (can be connected to localStorage)

### Fixed Top Bars
- Header: `sticky top-0 z-40`
- ViewModeBar: `sticky top-16 z-30`
- ProjectActionBar: `sticky top-28 z-20`
- Scrollable content below all fixed bars

### Status Indicators
- Color-coded project status
- Priority badges (urgent, high, medium, low)
- Task status icons (completed, in-progress, blocked, todo)

### Member Management
- Avatar group with overflow count
- Hover tooltips with member names
- Invite functionality
- Visual hierarchy with ring styles

---

## 🛠️ Dependencies

### shadcn/ui Components Used:
- `Button` - Action buttons
- `Select` - Status dropdown
- `Avatar` - User and member avatars
- `Tabs` - View mode selector
- `Card` - Content cards
- `Badge` - Status and priority indicators
- `Progress` - Completion progress
- `Tooltip` - Interactive element hints
- `DropdownMenu` - User and action menus

### Lucide Icons Used:
- Navigation: `LayoutDashboard`, `Bell`, `CheckSquare`, `Star`, `FolderKanban`
- Actions: `Plus`, `Trash2`, `UserPlus`, `Settings`
- Views: `List`, `LayoutGrid`, `Table2`, `Calendar`, `GanttChart`
- Controls: `ArrowUpDown`, `Columns`, `Filter`
- Status: `CheckCircle2`, `Circle`, `Clock`, `AlertCircle`
- Navigation: `ChevronLeft`, `ChevronRight`

---

## 🚀 Integration with React Router

The dashboard components are designed to work seamlessly with React Router:

```jsx
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

<Routes>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/dashboard/:userId/:projectId/:viewMode" element={<Dashboard />} />
</Routes>
```

**URL Parameters:**
- `userId` - Current user ID
- `projectId` - Active project ID
- `viewMode` - Current view (list, kanban, table)

---

## 🎨 Customization

### Color Schemes
Projects use color-coded indicators:
```javascript
const colors = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  cyan: 'bg-cyan-500',
  pink: 'bg-pink-500',
  yellow: 'bg-yellow-500'
};
```

### Priority Colors
```javascript
const priorityColors = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-gray-100 text-gray-700 border-gray-200'
};
```

---

## 📝 TODO: Future Enhancements

- [ ] Calendar view implementation
- [ ] Gantt chart view implementation
- [ ] Real-time collaboration indicators
- [ ] Drag-and-drop task reordering
- [ ] Advanced filtering system
- [ ] Column customization persistence
- [ ] Task quick actions (edit, duplicate, delete)
- [ ] Keyboard shortcuts
- [ ] Dark mode support
- [ ] Export functionality (CSV, PDF)

---

## 🔧 Development Notes

### State Management
Currently uses local component state. Consider migrating to:
- Context API for global dashboard state
- Zustand for lightweight state management
- Redux for complex applications

### Data Fetching
Mock data is currently used. Integrate with:
- React Query for server state
- SWR for data fetching
- GraphQL for complex queries

### Persistence
Add localStorage/sessionStorage for:
- Sidebar collapsed state
- Preferred view mode
- Column customization
- Filter preferences

---

## 📄 License

Part of the Task Management System (TMS) project.
