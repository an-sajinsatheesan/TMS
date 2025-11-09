# Project-Level Features Implementation Guide

## Overview

This document outlines the comprehensive project-level features that have been implemented in the TMS (Task Management System), including trash management, project templates, dashboard analytics, activity tracking, and more.

## Table of Contents

1. [Backend Implementation](#backend-implementation)
2. [Frontend Implementation](#frontend-implementation)
3. [Features Implemented](#features-implemented)
4. [Features Pending](#features-pending)
5. [Database Schema Changes](#database-schema-changes)
6. [API Endpoints](#api-endpoints)
7. [Usage Guide](#usage-guide)
8. [Next Steps](#next-steps)

---

## Backend Implementation

### ✅ Completed

#### 1. **Database Schema Updates** (`backend/prisma/schema.prisma`)

**New Enums:**
- `ProjectStatus`: ACTIVE, PAUSED, COMPLETED, ARCHIVED
- `TemplateCategory`: CUSTOM, MARKETING, OPERATION, HR, IT, SALES, CAMPAIGN, DESIGN
- `ActivityType`: 14 types of project activities for logging

**New/Updated Models:**
- **Project** model extended with:
  - `status` (ProjectStatus) - Project status tracking
  - `dueDate` (DateTime) - Project deadlines
  - `description` (String) - Project description for overview
  - `deletedAt` (DateTime) - Soft delete timestamp for trash
  - `isTemplate` (Boolean) - Mark projects as templates
  - `templateCategory` (TemplateCategory) - Categorize templates

- **ProjectActivity** model (new):
  - Tracks all project-related activities
  - Links to user and project
  - Stores metadata as JSON
  - Indexed by createdAt for efficient queries

**Migration File:** `backend/prisma/migrations/20251109_add_project_level_features/migration.sql`

#### 2. **Seed Data** (`backend/prisma/seeds/consolidatedOptions.seed.js`)

Added `seedProjectTemplates()` function that creates:
- **21 pre-built project templates** across 7 categories
- Each template includes:
  - Pre-configured sections
  - Sample tasks
  - Category-specific workflows

**Template Categories:**
- **Marketing** (3 templates): Campaign Launch, Social Media Management, Content Pipeline
- **HR** (3 templates): Employee Onboarding, Recruitment Pipeline, Performance Reviews
- **IT** (3 templates): Software Sprint, Bug Tracking, Infrastructure Setup
- **Sales** (3 templates): Sales Pipeline, Product Launch Plan, Account Management
- **Operations** (3 templates): Process Improvement, Vendor Management, Inventory Management
- **Campaign** (3 templates): Email Marketing, Event Planning, PR Campaign
- **Design** (3 templates): Website Redesign, Brand Identity, UI/UX Sprint

#### 3. **API Endpoints** (`backend/routes/project.routes.js` & `backend/controllers/project.controller.js`)

**Project Status & Management:**
- `PATCH /api/v1/projects/:projectId/status` - Update project status
- `PATCH /api/v1/projects/:projectId/due-date` - Update project due date

**Trash Management:**
- `POST /api/v1/projects/:projectId/trash` - Soft delete (move to trash)
- `POST /api/v1/projects/:projectId/restore` - Restore from trash
- `DELETE /api/v1/projects/:projectId/permanent` - Permanent deletion
- `GET /api/v1/projects/trash/list` - List all trashed projects

**Activity & Analytics:**
- `GET /api/v1/projects/:projectId/activities` - Get activity feed (paginated)
- `GET /api/v1/projects/:projectId/dashboard` - Get dashboard statistics with charts data

**Templates:**
- `GET /api/v1/projects/templates/list` - List all templates (with category filter)
- `POST /api/v1/projects/templates/:templateId/clone` - Clone template to create project

#### 4. **Scheduler Service** (`backend/services/scheduler.service.js`)

- **Auto-delete service** for trashed projects after 30 days
- Runs daily at 2 AM
- Integrated into server startup
- Logs all operations

#### 5. **Updated Project Listing**

Modified `listProjects()` to automatically exclude:
- Deleted projects (`deletedAt !== null`)
- Template projects (`isTemplate === true`)

---

## Frontend Implementation

### ✅ Completed

#### 1. **API Service Methods** (`frontend/src/services/api/projects.service.js`)

Added methods for all new endpoints:
- `updateStatus()`
- `updateDueDate()`
- `moveToTrash()`
- `restoreFromTrash()`
- `permanentDelete()`
- `getTrash()`
- `getActivities()`
- `getDashboard()`
- `getTemplates()`
- `cloneTemplate()`

#### 2. **New Pages Created**

**Trash Page** (`frontend/src/pages/Trash.jsx`)
- Displays all trashed projects in a grid layout
- Shows time remaining until auto-deletion (30-day countdown)
- **Actions:**
  - Restore project
  - Permanently delete
- Visual indicators for urgency
- Empty state handling

**Project Dashboard** (`frontend/src/pages/ProjectDashboard.jsx`)
- **4 Statistics Cards:**
  - Total Tasks
  - Completed Tasks
  - Incomplete Tasks
  - Overdue Tasks

- **4 Charts using Recharts:**
  - Bar Chart: Incomplete tasks by section
  - Pie Chart: Tasks by completion status
  - Bar Chart: Upcoming tasks by assignee
  - Line Chart: Task completion over time (last 7 days)

**Project Overview** (`frontend/src/pages/ProjectOverview.jsx`)
- Activity feed with real-time updates
- Activity types with color-coded icons
- Time-based formatting ("2 hours ago", "yesterday", etc.)
- Paginated loading (load more functionality)
- User avatars and metadata display
- Empty state handling

**Project Templates** (`frontend/src/pages/ProjectTemplates.jsx`)
- **Category filtering:** 8 categories + "All Templates"
- **Search functionality:** Filter by name or description
- Template cards showing:
  - Template name and description
  - Color indicator
  - Category badge
  - Section and task counts
  - "Use Template" button
- Creates project from template with custom name prompt
- Navigates to new project after creation

#### 3. **Routing Updates** (`frontend/src/App.jsx`)

Added routes:
- `/trash` - Trash page
- `/project-templates` - Templates page
- `/project/:projectId/dashboard` - Project dashboard
- `/project/:projectId/overview` - Project overview/activity feed

#### 4. **Dependencies**

Installed:
- `recharts` - For dashboard charts and data visualization

---

## Features Implemented

### ✅ Backend Features

1. **Project Status Management**
   - 4 status types: Active, Paused, Completed, Archived
   - Status change tracking in activity log

2. **Project Due Dates**
   - Set and update project deadlines
   - Tracked in activity feed

3. **Soft Delete / Trash System**
   - Projects moved to trash instead of permanent deletion
   - 30-day retention period
   - Auto-deletion via scheduler service
   - Restore capability

4. **Activity Logging**
   - 14 types of activities tracked
   - User attribution
   - Metadata storage for context

5. **Dashboard Analytics**
   - Task statistics calculation
   - Data formatted for charts
   - Project-isolated queries

6. **Project Templates**
   - 21 pre-seeded templates
   - Template cloning with full structure
   - Category-based organization

### ✅ Frontend Features

1. **Trash Management UI**
   - Visual countdown to deletion
   - Restore and permanent delete actions
   - Responsive grid layout

2. **Dashboard Visualization**
   - Interactive charts with Recharts
   - Real-time statistics
   - Multiple chart types (bar, pie, line)

3. **Activity Feed**
   - Color-coded activity types
   - Time-based formatting
   - Infinite scroll / pagination

4. **Template Browser**
   - Category filtering
   - Search functionality
   - One-click project creation

---

## Features Pending

### ⏳ To Be Implemented

#### 1. **Project Header Enhancements**

The project header in `ProjectBoard` component needs to be enhanced with:

**Editable Project Name:**
- Click to edit inline
- Save on blur or Enter key

**Due Date Display & Edit:**
- Date picker component near project name
- Visual indicator if overdue
- Save action on date selection

**Project Status Dropdown:**
- Dropdown showing current status
- Update via API on selection
- Status badge with appropriate colors

**Invite Members Button:**
- Opens invite popup/modal
- Displays current member avatars (max 5 + count)
- Uses existing invite API

**Trash Button:**
- Moves project to trash with confirmation
- Redirects to projects list after trashing

**Implementation Location:**
- File: `frontend/src/components/project-board/ProjectBoardHeader.jsx`
- Update the header section to include these controls
- Connect to API service methods already created

#### 2. **Invite Members Popup/Modal**

Create a reusable component:
- Email input for invitations
- List of current project members with avatars
- Member role management
- Uses existing backend API: `POST /api/v1/projects/:projectId/members/invite`

**Implementation:**
- Create: `frontend/src/components/modals/InviteMembersModal.jsx`
- Display member avatars in project header
- Show "+N" for additional members beyond 5

#### 3. **Project Board Navigation**

Add tabs/navigation within project workspace for:
- **List View** (existing)
- **Board View** (existing)
- **Overview** → Links to `/project/:projectId/overview`
- **Dashboard** → Links to `/project/:projectId/dashboard`

**Implementation Location:**
- File: `frontend/src/components/project-board/ViewModeBar.jsx` or create new nav component
- Add routing logic to switch between views

#### 4. **Enhanced Project Creation Page**

Replace the existing modal-based creation with a dedicated page similar to Asana/ClickUp:

**Features:**
- Multiple tabs: New, My Organization, Marketing, HR, IT, Sales, Campaign, Design
- "New" tab: Custom project form with sections, tasks, invites
- "My Organization" tab: Clone from existing user projects
- Other tabs: Show pre-built templates from that category
- Template selection triggers confirmation dialog asking for project name

**Implementation:**
- Currently, templates page exists at `/project-templates`
- Enhance with additional "My Organization" tab
- Add template preview before cloning
- Replace existing `CreateProjectModal` usage with route to this page

---

## Database Schema Changes

### Migration Required

Before running the application, execute the migration:

```bash
cd backend
npx prisma migrate dev
```

This will apply the migration: `20251109_add_project_level_features/migration.sql`

### Run Seed Data

To populate the database with templates:

```bash
cd backend
npm run db:seed
```

This creates:
- Subscription plans
- Task status/priority options
- Onboarding options
- **21 project templates** across 7 categories

---

## API Endpoints

### Full Endpoint List

#### Project Management
```
GET    /api/v1/projects                      - List projects (excludes deleted & templates)
POST   /api/v1/projects                      - Create project
GET    /api/v1/projects/:projectId           - Get project details
PATCH  /api/v1/projects/:projectId           - Update project
DELETE /api/v1/projects/:projectId           - Delete project (hard delete)
```

#### Project Status & Metadata
```
PATCH  /api/v1/projects/:projectId/status    - Update project status
PATCH  /api/v1/projects/:projectId/due-date  - Update project due date
```

#### Trash Management
```
POST   /api/v1/projects/:projectId/trash     - Move to trash (soft delete)
POST   /api/v1/projects/:projectId/restore   - Restore from trash
DELETE /api/v1/projects/:projectId/permanent - Permanently delete
GET    /api/v1/projects/trash/list           - List trashed projects
```

#### Activity & Analytics
```
GET    /api/v1/projects/:projectId/activities  - Get activity feed
GET    /api/v1/projects/:projectId/dashboard   - Get dashboard statistics
```

#### Templates
```
GET    /api/v1/projects/templates/list         - List templates (query: ?category=MARKETING)
POST   /api/v1/projects/templates/:templateId/clone - Clone template (body: {name})
```

---

## Usage Guide

### 1. Viewing Trashed Projects

Navigate to `/trash` to see all projects you've deleted:
- Projects show days remaining until permanent deletion
- Click "Restore" to bring back to active projects
- Click "Delete Forever" to permanently remove (with confirmation)

### 2. Viewing Project Dashboard

For any project, navigate to `/project/:projectId/dashboard` to see:
- Summary statistics in 4 cards
- Visual charts showing task distribution, completion trends, and assignee workload

### 3. Viewing Project Activity

Navigate to `/project/:projectId/overview` to see:
- Chronological activity feed
- All changes made to the project
- Who performed each action and when

### 4. Creating from Templates

1. Navigate to `/project-templates`
2. Browse or search for a template
3. Click "Use Template" on any template card
4. Enter a custom name for your new project
5. Automatically navigates to the newly created project

### 5. API Integration Examples

**Update Project Status:**
```javascript
import { projectsService } from './services/api/projects.service';

await projectsService.updateStatus(projectId, 'PAUSED');
```

**Move to Trash:**
```javascript
await projectsService.moveToTrash(projectId);
```

**Get Dashboard Data:**
```javascript
const response = await projectsService.getDashboard(projectId);
const { summary, charts } = response.data.data;
```

---

## Next Steps

### Immediate Priorities

1. **Implement Project Header Enhancements**
   - Add editable project name
   - Add due date picker
   - Add status dropdown
   - Add invite button with member avatars
   - Add trash button

2. **Create Invite Members Modal**
   - Reusable modal component
   - Email invite form
   - Member list display

3. **Add Project Navigation**
   - Integrate Overview and Dashboard links into project workspace
   - Update ViewModeBar or create new navigation component

4. **Enhance Template Creation Flow**
   - Add "My Organization" tab showing user's projects as templates
   - Add template preview/details before cloning

### Future Enhancements

- Email notifications for project status changes
- Project milestones and progress tracking
- Advanced filtering on dashboard (date ranges, custom metrics)
- Export dashboard data to PDF/CSV
- Custom template creation by users
- Template sharing across organization

---

## Technical Notes

### Scheduler Service

The auto-delete scheduler runs daily at 2 AM server time. To manually trigger:

```javascript
const SchedulerService = require('./services/scheduler.service');
await SchedulerService.triggerAutoDelete();
```

### Activity Logging

All project modifications automatically log activities. To manually log:

```javascript
await prisma.projectActivity.create({
  data: {
    projectId,
    userId,
    type: 'PROJECT_UPDATED',
    description: 'custom activity description',
    metadata: { key: 'value' }
  }
});
```

### Template Management

Templates are regular projects with `isTemplate: true`. To convert a project to a template:

```javascript
await prisma.project.update({
  where: { id: projectId },
  data: {
    isTemplate: true,
    templateCategory: 'MARKETING'
  }
});
```

---

## Conclusion

The implementation provides a solid foundation for project-level management features. The backend is fully functional with comprehensive APIs, database schema, seed data, and automated cleanup. The frontend includes core pages for trash management, analytics visualization, activity tracking, and template browsing.

The remaining work primarily involves UI/UX enhancements in the project workspace (header controls, navigation, invite modal) and completing the enhanced project creation flow.

All code follows existing patterns and conventions in the TMS codebase, ensuring maintainability and consistency.

---

**Implementation Date:** November 9, 2025
**Backend Status:** ✅ Complete
**Frontend Status:** 🟡 Core Features Complete, Enhancements Pending
**Documentation Status:** ✅ Complete
