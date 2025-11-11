# Team Member Management API

## Overview

This API allows you to manage team members similar to Asana and Monday.com:
- 👥 View current team members
- 🔍 Search available users to add
- ➕ Add existing workspace members to team
- ✉️ Invite new users via email
- 🔄 Update member roles
- 🗑️ Remove members from team

## API Endpoints

### 1. Get Team Members

Get all members of a team.

```http
GET /api/v1/teams/:teamId/members
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "member-uuid",
      "teamId": "team-uuid",
      "userId": "user-uuid",
      "role": "ADMIN",
      "joinedAt": "2025-01-15T10:30:00.000Z",
      "user": {
        "id": "user-uuid",
        "fullName": "John Doe",
        "email": "john@example.com",
        "avatarUrl": "https://..."
      }
    }
  ]
}
```

---

### 2. Get Available Members (New!)

Get workspace members who can be added to the team with optional search.

```http
GET /api/v1/teams/:teamId/available-members?search=john
```

**Query Parameters:**
- `search` (optional) - Filter by name or email

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-uuid",
      "fullName": "John Smith",
      "email": "john.smith@example.com",
      "avatarUrl": "https://..."
    },
    {
      "id": "user-uuid-2",
      "fullName": "Johnny Doe",
      "email": "johnny@example.com",
      "avatarUrl": null
    }
  ],
  "message": "Available members retrieved successfully"
}
```

**Notes:**
- Only returns users who are:
  - ✅ Members of the workspace (tenant)
  - ❌ NOT already in the team
- Results can be filtered by `search` parameter
- Search matches against `fullName` and `email` fields

---

### 3. Add Existing Member to Team

Add an existing workspace member to the team.

```http
POST /api/v1/teams/:teamId/members
```

**Request Body:**
```json
{
  "userId": "user-uuid-to-add",
  "role": "MEMBER"  // Optional: "ADMIN" or "MEMBER", defaults to "MEMBER"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "member-uuid",
    "teamId": "team-uuid",
    "userId": "user-uuid",
    "role": "MEMBER",
    "joinedAt": "2025-01-15T10:30:00.000Z",
    "user": {
      "id": "user-uuid",
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "avatarUrl": null
    }
  },
  "message": "Member added to team successfully"
}
```

**Validation:**
- ✅ User must be a workspace member
- ❌ User cannot already be in the team
- ✅ Requester must be team admin
- ✅ Role must be "ADMIN" or "MEMBER"

---

### 4. Update Member Role

Update a team member's role.

```http
PATCH /api/v1/teams/:teamId/members/:memberId
```

**Request Body:**
```json
{
  "role": "ADMIN"  // "ADMIN" or "MEMBER"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "member-uuid",
    "teamId": "team-uuid",
    "userId": "user-uuid",
    "role": "ADMIN",
    "joinedAt": "2025-01-15T10:30:00.000Z"
  },
  "message": "Member role updated successfully"
}
```

**Business Rules:**
- ⚠️ Cannot demote last admin (must have at least 1 admin)
- ✅ Only team admins can update roles
- ✅ Role must be "ADMIN" or "MEMBER"

---

### 5. Remove Member from Team

Remove a member from the team.

```http
DELETE /api/v1/teams/:teamId/members/:memberId
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Member removed from team successfully"
}
```

**Business Rules:**
- ⚠️ Cannot remove last admin (must have at least 1 admin)
- ✅ Only team admins can remove members
- ✅ Cannot remove yourself (use leave team endpoint)

---

## Frontend Implementation Guide

### Step 1: Display Team Members

```typescript
// Fetch current team members
const { data: members } = await api.get(`/teams/${teamId}/members`);

// Display in a list/table
members.forEach(member => {
  // Show: avatar, name, email, role, actions
});
```

### Step 2: Add "Add Member" Button with Search

```typescript
// Open modal/dialog with search
const [search, setSearch] = useState('');
const [available, setAvailable] = useState([]);

// Fetch available members as user types
const handleSearch = async (query) => {
  const { data } = await api.get(
    `/teams/${teamId}/available-members?search=${query}`
  );
  setAvailable(data);
};

// Display results
available.forEach(user => {
  // Show: avatar, name, email
  // Button: "Add to Team"
});
```

### Step 3: Add Member to Team

```typescript
const handleAddMember = async (userId, role = 'MEMBER') => {
  try {
    await api.post(`/teams/${teamId}/members`, {
      userId,
      role
    });

    // Refresh team members list
    fetchTeamMembers();

    // Show success message
    toast.success('Member added to team!');
  } catch (error) {
    // Handle error (already in team, not in workspace, etc.)
    toast.error(error.message);
  }
};
```

### Step 4: Invite New Users (Existing Functionality)

If user is not in workspace, show "Invite via Email" option:

```typescript
const handleInvite = async (email) => {
  // This uses the existing invitation system
  // Send invitation to workspace, they'll be able to join team after
};
```

## UI/UX Examples

### Asana-style
```
┌─────────────────────────────────────┐
│ Team Members                    [+] │ <- Add button
├─────────────────────────────────────┤
│ 🟢 John Doe (Admin)            [...] │
│    john@example.com                  │
├─────────────────────────────────────┤
│ 🔵 Jane Smith (Member)         [...] │
│    jane@example.com                  │
└─────────────────────────────────────┘

[+] Click opens modal:
┌─────────────────────────────────────┐
│ Add Team Members                [×] │
├─────────────────────────────────────┤
│ 🔍 Search people...                  │
├─────────────────────────────────────┤
│ Available:                           │
│ ☐ Mike Johnson                  [+] │
│   mike@example.com                   │
│ ☐ Sarah Connor                  [+] │
│   sarah@example.com                  │
└─────────────────────────────────────┘
```

### Monday.com-style
```
┌─────────────────────────────────────┐
│ 👥 Team Members (3)                  │
│ [Add Member ▾] [Invite via Email]   │
├─────────────────────────────────────┤
│ Avatar | Name          | Role  | ... │
│ [JD]   | John Doe      | Admin | ⋮  │
│ [JS]   | Jane Smith    | Member| ⋮  │
│ [MJ]   | Mike Johnson  | Member| ⋮  │
└─────────────────────────────────────┘

Dropdown shows:
  ✓ Search workspace members
  ✓ Recently added
  ✓ Suggested members
```

## Error Handling

### Common Errors

**400 - User already in team**
```json
{
  "success": false,
  "message": "User is already a team member"
}
```

**400 - User not in workspace**
```json
{
  "success": false,
  "message": "User is not part of this workspace"
}
```

**403 - Permission denied**
```json
{
  "success": false,
  "message": "Only team admins can add members"
}
```

**404 - Team not found**
```json
{
  "success": false,
  "message": "Team not found"
}
```

## Permissions

| Action | Team Member | Team Admin | Workspace Admin |
|--------|------------|------------|-----------------|
| View members | ✅ | ✅ | ✅ |
| Search available | ✅ | ✅ | ✅ |
| Add member | ❌ | ✅ | ✅ |
| Update role | ❌ | ✅ | ✅ |
| Remove member | ❌ | ✅ | ✅ |

## Complete Example

```typescript
// TeamMemberManagement.tsx

import { useState, useEffect } from 'react';

function TeamMemberManagement({ teamId }) {
  const [members, setMembers] = useState([]);
  const [available, setAvailable] = useState([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch team members
  useEffect(() => {
    fetchMembers();
  }, [teamId]);

  const fetchMembers = async () => {
    const { data } = await api.get(`/teams/${teamId}/members`);
    setMembers(data);
  };

  // Search available members
  const handleSearch = async (query) => {
    setSearch(query);
    if (query.length >= 2) {
      const { data } = await api.get(
        `/teams/${teamId}/available-members?search=${query}`
      );
      setAvailable(data);
    } else {
      setAvailable([]);
    }
  };

  // Add member to team
  const handleAddMember = async (userId) => {
    try {
      await api.post(`/teams/${teamId}/members`, { userId, role: 'MEMBER' });
      toast.success('Member added!');
      fetchMembers();
      setShowAddModal(false);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div>
      <h2>Team Members ({members.length})</h2>

      <button onClick={() => setShowAddModal(true)}>
        + Add Member
      </button>

      {/* Current Members List */}
      <div>
        {members.map(member => (
          <div key={member.id}>
            <img src={member.user.avatarUrl} />
            <span>{member.user.fullName}</span>
            <span>({member.role})</span>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <input
            placeholder="Search people..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />

          <div>
            {available.map(user => (
              <div key={user.id}>
                <span>{user.fullName}</span>
                <span>{user.email}</span>
                <button onClick={() => handleAddMember(user.id)}>
                  Add
                </button>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
```

---

**Ready to implement!** The backend API is complete and ready for frontend integration.
