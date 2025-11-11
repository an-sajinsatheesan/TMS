# Workspace Management System - Complete Documentation

## Overview
This document describes the complete workspace (tenant) management system implementation including frontend UI, backend APIs, and integration details.

---

## Architecture

### Frontend Architecture
```
WorkspaceProvider (Context)
  ├── WorkspaceSwitcher (Component)
  ├── WorkspaceSettings (Page)
  │   ├── General Tab
  │   └── Members Tab
  └── WorkspaceCreate (Page)
```

### Backend Architecture
```
/api/v1/tenants (Routes)
  ├── GET / - List user workspaces
  ├── GET /:id/settings - Get workspace settings
  ├── PATCH /:id/settings - Update workspace
  ├── GET /:id/members - List members
  ├── PATCH /:id/members/:userId - Update member role
  └── DELETE /:id/members/:userId - Remove member
```

---

## Frontend Components

### 1. WorkspaceContext
**Location**: `frontend/src/contexts/WorkspaceContext.jsx`

**Purpose**: Global state management for workspaces

**Features**:
- Fetches all user workspaces on mount
- Maintains current workspace state
- Persists selection in localStorage
- Provides switch/refresh functions

**API**:
```javascript
const {
  workspaces,          // Array of workspaces
  currentWorkspace,    // Currently selected workspace
  loading,             // Loading state
  error,               // Error state
  switchWorkspace,     // Function to switch workspace
  refreshWorkspaces,   // Function to refresh list
  refreshCurrentWorkspace // Function to refresh current
} = useWorkspace();
```

---

### 2. WorkspaceSwitcher
**Location**: `frontend/src/components/workspace/WorkspaceSwitcher.jsx`

**Purpose**: Dropdown component to switch between workspaces

**Features**:
- Displays current workspace with icon
- Shows role badge (Admin/Member)
- Lists all available workspaces
- Quick navigation to settings/create
- Supports collapsed sidebar mode

**Usage**:
```jsx
<WorkspaceSwitcher isCollapsed={false} />
```

**Integration**: Added to `Sidebar.jsx` below brand logo

---

### 3. WorkspaceSettings Page
**Location**: `frontend/src/pages/WorkspaceSettings.jsx`

**Purpose**: Complete settings management interface

**Tabs**:

#### General Tab
- **Workspace Name**: Editable field (admin only)
- **Workspace ID**: Read-only display
- **User Role**: Badge showing admin/member status
- **Save Changes**: Button for pending changes

#### Members Tab
- **Invite Section** (admin only):
  - Email input field
  - Role selector (Admin/Member)
  - Send invitation button

- **Members List**:
  - Avatar and name display
  - Email address
  - Role dropdown (admin can change)
  - Pending badge for unaccepted invitations
  - Remove button (admin only, can't remove owner)
  - Owner badge for workspace owner

**Permissions**:
- General settings: Admin only
- Invite members: Admin only
- View members: All members
- Edit roles: Admin only
- Remove members: Admin only

---

### 4. WorkspaceCreate Page
**Location**: `frontend/src/pages/WorkspaceCreate.jsx`

**Purpose**: Create new workspace

**Features**:
- Simple form with workspace name
- Validates input
- Creates via onboarding API
- Auto-refreshes workspace list
- Redirects to dashboard

---

## Backend API Endpoints

### Base Path: `/api/v1/tenants`

All endpoints require authentication via JWT token.

---

### 1. Get User Workspaces
```http
GET /api/v1/tenants
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "tenants": [
      {
        "id": "tenant-uuid",
        "name": "My Workspace",
        "ownerId": "user-uuid",
        "userRole": "TENANT_ADMIN",
        "joinedAt": "2024-01-15T10:00:00Z",
        "subscriptionPlan": { ... },
        "owner": {
          "id": "user-uuid",
          "email": "owner@example.com",
          "fullName": "John Doe",
          "avatarUrl": "https://..."
        }
      }
    ]
  }
}
```

---

### 2. Get Workspace Settings
```http
GET /api/v1/tenants/:tenantId/settings
Authorization: Bearer <token>
```

**Requirements**: Tenant admin role

**Response**:
```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": "tenant-uuid",
      "name": "My Workspace",
      "ownerId": "user-uuid",
      "emailConfig": { ... },
      "messageConfig": { ... },
      ...
    }
  }
}
```

---

### 3. Update Workspace Settings
```http
PATCH /api/v1/tenants/:tenantId/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Workspace Name"
}
```

**Requirements**: Tenant admin role

**Response**:
```json
{
  "success": true,
  "data": {
    "tenant": { ... }
  },
  "message": "Tenant settings updated successfully"
}
```

---

### 4. Get Workspace Members
```http
GET /api/v1/tenants/:tenantId/members
Authorization: Bearer <token>
```

**Requirements**: Tenant member

**Response**:
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "membership-uuid",
        "userId": "user-uuid",
        "role": "TENANT_ADMIN",
        "joinedAt": "2024-01-15T10:00:00Z",
        "isPending": false,
        "user": {
          "id": "user-uuid",
          "email": "user@example.com",
          "fullName": "Jane Smith",
          "avatarUrl": "https://..."
        }
      }
    ]
  }
}
```

---

### 5. Update Member Role
```http
PATCH /api/v1/tenants/:tenantId/members/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "TENANT_ADMIN"
}
```

**Requirements**: Tenant admin role

**Valid Roles**: `TENANT_ADMIN`, `MEMBER`

**Restrictions**:
- Cannot change workspace owner's role
- Only admins can update roles

**Response**:
```json
{
  "success": true,
  "data": {
    "role": "TENANT_ADMIN"
  },
  "message": "Member role updated successfully"
}
```

---

### 6. Remove Member
```http
DELETE /api/v1/tenants/:tenantId/members/:userId
Authorization: Bearer <token>
```

**Requirements**: Tenant admin role

**Restrictions**:
- Cannot remove workspace owner
- Only admins can remove members

**Response**:
```json
{
  "success": true,
  "data": null,
  "message": "Member removed successfully"
}
```

---

### 7. Invite Members
```http
POST /api/v1/invitations/send-tenant
Authorization: Bearer <token>
Content-Type: application/json

{
  "tenantId": "tenant-uuid",
  "emails": ["user@example.com"],
  "role": "MEMBER"
}
```

**Requirements**: Tenant admin role

**Valid Roles**: `TENANT_ADMIN`, `MEMBER`

---

## Integration Guide

### Step 1: Wrap App with WorkspaceProvider

```jsx
// App.jsx
import { WorkspaceProvider } from './contexts/WorkspaceContext';

function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        {/* Rest of app */}
      </WorkspaceProvider>
    </AuthProvider>
  );
}
```

### Step 2: Add Routes

```jsx
// App.jsx
<Route
  path="/workspace/settings"
  element={
    <ProtectedRoute>
      <WorkspaceSettings />
    </ProtectedRoute>
  }
/>
<Route
  path="/workspace/create"
  element={
    <ProtectedRoute>
      <WorkspaceCreate />
    </ProtectedRoute>
  }
/>
```

### Step 3: Add WorkspaceSwitcher to Sidebar

```jsx
// Sidebar.jsx
import WorkspaceSwitcher from '../workspace/WorkspaceSwitcher';

// Inside sidebar, after logo/brand
<div className="border-b px-2 py-3">
  <WorkspaceSwitcher isCollapsed={isCollapsed} />
</div>
```

### Step 4: Use Workspace Context in Components

```jsx
// Any component
import { useWorkspace } from '@/contexts/WorkspaceContext';

function MyComponent() {
  const { currentWorkspace, workspaces } = useWorkspace();

  return (
    <div>
      Current: {currentWorkspace?.name}
      Total: {workspaces.length}
    </div>
  );
}
```

---

## Security Features

### Authentication
- All endpoints require valid JWT token
- Token validated via `authenticate` middleware

### Authorization
- **Tenant Context**: `tenantContext` middleware validates user membership
- **Admin Actions**: `requireTenantAdmin` middleware enforces admin role
- **Owner Protection**: Cannot modify or remove workspace owner

### Data Validation
- Input validation via Joi schemas
- Role validation (only valid roles accepted)
- Email validation for invitations

---

## Database Schema

### tenant Table
```sql
id              UUID PRIMARY KEY
name            VARCHAR(255) NOT NULL
ownerId         UUID REFERENCES users(id)
createdAt       TIMESTAMP
emailConfig     JSONB
messageConfig   JSONB
```

### tenant_users Table (Workspace Memberships)
```sql
id              UUID PRIMARY KEY
tenantId        UUID REFERENCES tenant(id)
userId          UUID REFERENCES users(id)
role            ENUM('TENANT_ADMIN', 'MEMBER')
status          ENUM('ACTIVE', 'PENDING')
joinedAt        TIMESTAMP
```

---

## Testing Checklist

### Frontend
- [ ] Workspace switcher displays correctly
- [ ] Workspace switching persists after page reload
- [ ] Settings page loads workspace data
- [ ] General tab allows name editing (admin only)
- [ ] Members tab loads member list
- [ ] Invite form sends invitation (admin only)
- [ ] Role dropdown updates member role (admin only)
- [ ] Remove button removes member (admin only)
- [ ] Owner cannot be edited or removed
- [ ] Create workspace page creates new workspace
- [ ] Non-admin users cannot access admin features

### Backend
- [ ] GET /tenants returns user's workspaces
- [ ] GET /tenants/:id/settings returns settings (admin only)
- [ ] PATCH /tenants/:id/settings updates settings (admin only)
- [ ] GET /tenants/:id/members returns member list
- [ ] PATCH /tenants/:id/members/:userId updates role (admin only)
- [ ] DELETE /tenants/:id/members/:userId removes member (admin only)
- [ ] Owner cannot be modified or removed
- [ ] Invalid roles are rejected
- [ ] Unauthorized users receive 403 errors
- [ ] Non-members cannot access workspace

---

## Troubleshooting

### Workspace Switcher Not Showing
**Cause**: WorkspaceProvider not wrapping app
**Fix**: Ensure App.jsx wraps with `<WorkspaceProvider>`

### Cannot Switch Workspaces
**Cause**: localStorage may be blocked
**Fix**: Check browser console for errors, ensure localStorage is enabled

### Settings Page Shows "No workspace selected"
**Cause**: User has no workspaces
**Fix**: Create a workspace via onboarding or create page

### Members List Empty
**Cause**: No members invited yet, or backend API not accessible
**Fix**: Check network tab, ensure backend is running and API is accessible

### Cannot Invite Members (Admin)
**Cause**: Not actually admin, or backend validation failing
**Fix**: Check user role in workspace, check backend logs

### 403 Errors on Admin Actions
**Cause**: User is not admin
**Fix**: Only TENANT_ADMIN role can perform admin actions

---

## Future Enhancements

### Potential Features
1. **Workspace Dashboard**: Analytics and overview
2. **Workspace Templates**: Pre-configured workspace setups
3. **Bulk Member Import**: CSV import for members
4. **Workspace Billing**: Subscription management
5. **Workspace Audit Logs**: Track all changes
6. **Custom Roles**: Beyond admin/member
7. **Workspace Transfer**: Change ownership
8. **Workspace Archival**: Soft delete workspaces
9. **Member Groups**: Organize members into teams
10. **Workspace Branding**: Custom logos and colors

---

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── workspace/
│   │       └── WorkspaceSwitcher.jsx
│   ├── contexts/
│   │   └── WorkspaceContext.jsx
│   ├── pages/
│   │   ├── WorkspaceSettings.jsx
│   │   └── WorkspaceCreate.jsx
│   └── services/
│       └── api/
│           ├── tenants.service.js
│           └── index.js

backend/
├── controllers/
│   └── tenant.controller.js
├── routes/
│   └── tenant.routes.js
└── middlewares/
    └── membership.js (tenantContext, requireTenantAdmin)
```

---

## Commits

1. **bf6d0e4**: fix: Replace non-existent API methods in ProjectTemplates page
2. **e751458**: feat: Implement complete workspace/tenant management system
3. **8018a52**: feat: Add complete tenant member management API endpoints

---

## Contributors

Developed by Claude Code AI Assistant
Date: 2024-01-15

---

## License

This feature is part of the TMS (Task Management System) project.
