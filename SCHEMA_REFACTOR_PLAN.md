# Database Schema Refactor Plan

## Overview
This document outlines the complete database schema refactor to implement:
1. Unified StaticTaskOptions table
2. Separate Template and TemplateSections tables
3. Unified Membership model
4. Enhanced role system
5. Improved invitation flow

---

## 1. StaticTaskOptions Table

**Purpose:** Single table for both priority and status options with shared IDs across all tenants

```prisma
enum TaskOptionType {
  PRIORITY
  STATUS
}

model StaticTaskOption {
  id          String         @id @default(uuid()) @db.Uuid
  optionType  TaskOptionType // PRIORITY or STATUS
  label       String         // Display name (e.g., "High", "In Progress")
  value       String         // Unique value (e.g., "high", "in_progress")
  color       String         // Hex color for UI
  icon        String?        // Optional icon name
  description String?        // Optional description
  position    Int            @default(0) // Display order
  isActive    Boolean        @default(true)
  isDefault   Boolean        @default(false) // Mark one as default
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@unique([optionType, value]) // e.g., (PRIORITY, "high")
  @@index([optionType])
  @@index([optionType, isActive])
  @@map("static_task_options")
}
```

**Migration:**
- Consolidate TaskStatusOption and TaskPriorityOption into StaticTaskOption
- Add optionType discriminator
- Tasks reference these by value (String) instead of direct FK

---

## 2. Template System

**Purpose:** Separate templates from projects for better organization

### Template Model

```prisma
model Template {
  id               String           @id @default(uuid()) @db.Uuid
  name             String
  description      String?
  color            String           @default("#3b82f6")
  layout           ProjectLayout    @default(LIST)
  category         TemplateCategory @default(CUSTOM)
  icon             String?          // Template icon
  thumbnail        String?          // Preview image URL
  isGlobal         Boolean          @default(false) // Super admin templates
  createdBy        String           @db.Uuid
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  // Relations
  creator          User             @relation(fields: [createdBy], references: [id])
  sections         TemplateSection[]
  columns          TemplateColumn[]

  @@index([isGlobal])
  @@index([category])
  @@index([createdBy])
  @@map("templates")
}
```

### TemplateSections Model

```prisma
model TemplateSection {
  id             String    @id @default(uuid()) @db.Uuid
  templateId     String    @db.Uuid
  name           String
  description    String?
  position       Int
  color          String?   @default("#94a3b8")
  icon           String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Relations
  template       Template  @relation(fields: [templateId], references: [id], onDelete: Cascade)
  tasks          TemplateTask[]

  @@index([templateId])
  @@map("template_sections")
}
```

### TemplateTask Model (Optional - for pre-defined tasks)

```prisma
model TemplateTask {
  id              String          @id @default(uuid()) @db.Uuid
  templateSectionId String        @db.Uuid
  title           String
  description     String?
  type            TaskType        @default(TASK)
  position        Int
  priority        String?         // Reference to StaticTaskOption value
  status          String?         // Reference to StaticTaskOption value
  tags            String[]
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  // Relations
  templateSection TemplateSection @relation(fields: [templateSectionId], references: [id], onDelete: Cascade)

  @@index([templateSectionId])
  @@map("template_tasks")
}
```

### TemplateColumn Model

```prisma
model TemplateColumn {
  id          String    @id @default(uuid()) @db.Uuid
  templateId  String    @db.Uuid
  name        String
  type        String    // 'text', 'date', 'select', 'user', 'number'
  width       Int       @default(150)
  position    Int
  options     Json?     // For select type columns
  isDefault   Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  template    Template  @relation(fields: [templateId], references: [id], onDelete: Cascade)

  @@index([templateId])
  @@map("template_columns")
}
```

---

## 3. Role System Refactor

**Purpose:** Unified role system across tenant and project levels

### Role Enum

```prisma
enum SystemRole {
  SUPER_ADMIN    // Global system admin
  TENANT_ADMIN   // Manage tenant, users, settings
  PROJECT_ADMIN  // Manage specific project
  MEMBER         // Normal project member
  VIEWER         // Read-only access
}
```

### User Model Update

```prisma
model User {
  id               String    @id @default(uuid()) @db.Uuid
  email            String    @unique
  authProvider     AuthProvider @default(EMAIL)
  googleId         String?   @unique
  passwordHash     String?
  fullName         String?
  avatarUrl        String?
  isEmailVerified  Boolean   @default(false)
  systemRole       SystemRole? // Only for SUPER_ADMIN
  twoFaEnabled     Boolean   @default(false)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  // Relations
  onboardingData   OnboardingData?
  ownedTenants     Tenant[]          @relation("TenantOwner")
  memberships      Membership[]      // NEW: Unified memberships
  createdProjects  Project[]
  createdTasks     Task[]
  assignedTasks    Task[]            @relation("TaskAssignee")
  sentInvitations  Invitation[]
  taskComments     TaskComment[]
  projectActivities ProjectActivity[]
  createdTemplates Template[]

  @@index([email])
  @@index([googleId])
  @@index([systemRole])
  @@map("users")
}
```

---

## 4. Membership Model (Replaces TenantUser + ProjectMember)

**Purpose:** Unified membership table for both tenant-level and project-level access

```prisma
enum MembershipLevel {
  TENANT   // Access to all projects in tenant
  PROJECT  // Access to specific project only
}

model Membership {
  id          String          @id @default(uuid()) @db.Uuid
  userId      String          @db.Uuid
  tenantId    String          @db.Uuid
  projectId   String?         @db.Uuid // NULL = tenant-level membership
  level       MembershipLevel // TENANT or PROJECT
  role        SystemRole      // TENANT_ADMIN, PROJECT_ADMIN, MEMBER, VIEWER
  joinedAt    DateTime        @default(now())
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  // Relations
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  tenant      Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  project     Project?        @relation(fields: [projectId], references: [id], onDelete: Cascade)

  // Constraints
  @@unique([userId, tenantId, projectId]) // User can only have one role per tenant/project combo
  @@index([userId])
  @@index([tenantId])
  @@index([projectId])
  @@index([tenantId, level])
  @@index([projectId, role])
  @@map("memberships")
}
```

**Business Rules:**
1. **Tenant-level membership** (`level=TENANT, projectId=NULL`):
   - Grants access to ALL projects in the tenant
   - Role can be: `TENANT_ADMIN` or `MEMBER`

2. **Project-level membership** (`level=PROJECT, projectId=<id>`):
   - Grants access ONLY to the specified project
   - Role can be: `PROJECT_ADMIN`, `MEMBER`, or `VIEWER`

3. **Access Check Logic:**
   ```typescript
   // User has access to project if:
   // 1. Tenant-level membership exists for this tenant, OR
   // 2. Project-level membership exists for this specific project

   const hasAccess = await prisma.membership.findFirst({
     where: {
       userId: userId,
       OR: [
         { tenantId: tenantId, level: 'TENANT' },
         { projectId: projectId, level: 'PROJECT' }
       ]
     }
   });
   ```

---

## 5. Updated Invitation Model

**Purpose:** Enhanced invitation with membership-based redemption

```prisma
model Invitation {
  id          String           @id @default(uuid()) @db.Uuid
  tenantId    String           @db.Uuid
  projectId   String?          @db.Uuid // NULL = tenant-level invitation
  email       String
  invitedBy   String           @db.Uuid
  token       String           @unique // One-time use token
  role        SystemRole       // Role to assign (TENANT_ADMIN, PROJECT_ADMIN, MEMBER, VIEWER)
  status      InvitationStatus @default(PENDING)
  expiresAt   DateTime         // 7-day TTL
  acceptedAt  DateTime?        // When invitation was accepted
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  // Relations
  tenant      Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  project     Project?         @relation(fields: [projectId], references: [id], onDelete: Cascade)
  inviter     User             @relation(fields: [invitedBy], references: [id])

  @@index([tenantId])
  @@index([projectId])
  @@index([email])
  @@index([token])
  @@index([status, expiresAt])
  @@map("invitations")
}
```

**Invitation Flow:**

1. **Send Invitation:**
   ```typescript
   // Tenant-level invite (access to all projects)
   {
     tenantId: "tenant-uuid",
     projectId: null,
     email: "user@example.com",
     role: "TENANT_ADMIN" | "MEMBER",
     expiresAt: new Date(Date.now() + 7*24*60*60*1000)
   }

   // Project-level invite (access to specific project only)
   {
     tenantId: "tenant-uuid",
     projectId: "project-uuid",
     email: "user@example.com",
     role: "PROJECT_ADMIN" | "MEMBER" | "VIEWER",
     expiresAt: new Date(Date.now() + 7*24*60*60*1000)
   }
   ```

2. **Accept Invitation:**
   ```typescript
   // On redemption, create Membership:
   await prisma.membership.create({
     data: {
       userId: user.id,
       tenantId: invitation.tenantId,
       projectId: invitation.projectId, // NULL for tenant-level
       level: invitation.projectId ? 'PROJECT' : 'TENANT',
       role: invitation.role
     }
   });
   ```

---

## 6. Updated Project Model

**Purpose:** Remove template logic from projects

```prisma
model Project {
  id                String           @id @default(uuid()) @db.Uuid
  tenantId          String           @db.Uuid
  templateId        String?          @db.Uuid // Reference to source template
  name              String
  description       String?
  color             String?          @default("#3b82f6")
  layout            ProjectLayout    @default(LIST)
  status            ProjectStatus    @default(ACTIVE)
  dueDate           DateTime?
  deletedAt         DateTime?        // Soft delete
  createdBy         String           @db.Uuid
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  // Relations
  tenant            Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  sourceTemplate    Template?        @relation(fields: [templateId], references: [id], onDelete: SetNull)
  creator           User             @relation(fields: [createdBy], references: [id])
  sections          ProjectSection[]
  tasks             Task[]
  invitations       Invitation[]
  memberships       Membership[]     // NEW: Project-level memberships
  columns           ProjectColumn[]
  activities        ProjectActivity[]

  @@index([tenantId])
  @@index([templateId])
  @@index([createdBy])
  @@index([deletedAt])
  @@index([tenantId, deletedAt])
  @@map("projects")
}
```

---

## 7. Migration Strategy

### Phase 1: Add New Tables
1. Create `static_task_options` table
2. Create `templates` table
3. Create `template_sections` table
4. Create `template_tasks` table (optional)
5. Create `template_columns` table
6. Create `memberships` table

### Phase 2: Migrate Data
1. Migrate `task_status_options` + `task_priority_options` → `static_task_options`
2. Migrate templates from `projects` (where `isTemplate=true`) → `templates`
3. Migrate `tenant_users` + `project_members` → `memberships`

### Phase 3: Update References
1. Update `Task.priority` and `Task.status` to reference option values
2. Update `Project` to reference `Template`
3. Update `Invitation` to new schema
4. Update all foreign keys

### Phase 4: Remove Old Tables
1. Drop `task_status_options`
2. Drop `task_priority_options`
3. Drop `tenant_users`
4. Drop `project_members`
5. Remove template fields from `projects` table

---

## 8. Access Control Logic

### Middleware: `checkProjectAccess`

```typescript
async function checkProjectAccess(req, res, next) {
  const { projectId } = req.params;
  const userId = req.user.id;

  // Get project with tenant
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, tenantId: true }
  });

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  // Check membership: tenant-level OR project-level
  const membership = await prisma.membership.findFirst({
    where: {
      userId: userId,
      OR: [
        {
          tenantId: project.tenantId,
          level: 'TENANT'
        },
        {
          projectId: projectId,
          level: 'PROJECT'
        }
      ]
    }
  });

  if (!membership) {
    throw new ApiError(403, 'Access denied to this project');
  }

  // Attach membership to request
  req.membership = membership;
  next();
}
```

### Role-Based Access Control

```typescript
function requireRole(minRole: SystemRole) {
  return (req, res, next) => {
    const userRole = req.membership.role;

    const roleHierarchy = {
      SUPER_ADMIN: 5,
      TENANT_ADMIN: 4,
      PROJECT_ADMIN: 3,
      MEMBER: 2,
      VIEWER: 1
    };

    if (roleHierarchy[userRole] >= roleHierarchy[minRole]) {
      next();
    } else {
      throw new ApiError(403, `Requires ${minRole} role or higher`);
    }
  };
}

// Usage:
router.patch('/:projectId', authenticate, checkProjectAccess, requireRole('PROJECT_ADMIN'), updateProject);
```

---

## 9. UI Role Display

**In Invitation Modal:**
- Show only: `PROJECT_ADMIN`, `MEMBER`, `VIEWER`
- Hide: `SUPER_ADMIN`, `TENANT_ADMIN`

**Role Descriptions:**
```typescript
const VISIBLE_ROLES = [
  {
    value: 'PROJECT_ADMIN',
    label: 'Admin',
    description: 'Can manage project settings and members'
  },
  {
    value: 'MEMBER',
    label: 'Member',
    description: 'Can create and edit tasks'
  },
  {
    value: 'VIEWER',
    label: 'Viewer',
    description: 'Can only view project (read-only)'
  }
];
```

---

## 10. Template Cloning Flow

```typescript
async function cloneTemplate(templateId: string, projectName: string, userId: string) {
  // 1. Get template with sections and columns
  const template = await prisma.template.findUnique({
    where: { id: templateId },
    include: {
      sections: {
        include: { tasks: true },
        orderBy: { position: 'asc' }
      },
      columns: { orderBy: { position: 'asc' } }
    }
  });

  // 2. Get user's tenant
  const membership = await prisma.membership.findFirst({
    where: { userId, level: 'TENANT' }
  });

  // 3. Create project with transaction
  const project = await prisma.$transaction(async (tx) => {
    // Create project
    const newProject = await tx.project.create({
      data: {
        name: projectName,
        description: template.description,
        color: template.color,
        layout: template.layout,
        tenantId: membership.tenantId,
        templateId: template.id, // Link to source template
        createdBy: userId
      }
    });

    // Clone sections
    for (const section of template.sections) {
      const newSection = await tx.projectSection.create({
        data: {
          projectId: newProject.id,
          name: section.name,
          position: section.position,
          color: section.color
        }
      });

      // Clone tasks (optional)
      for (const task of section.tasks) {
        await tx.task.create({
          data: {
            projectId: newProject.id,
            sectionId: newSection.id,
            title: task.title,
            description: task.description,
            type: task.type,
            priority: task.priority,
            status: task.status,
            createdBy: userId
          }
        });
      }
    }

    // Clone columns
    for (const column of template.columns) {
      await tx.projectColumn.create({
        data: {
          projectId: newProject.id,
          name: column.name,
          type: column.type,
          width: column.width,
          position: column.position,
          options: column.options,
          isDefault: column.isDefault
        }
      });
    }

    // Create creator's membership
    await tx.membership.create({
      data: {
        userId: userId,
        tenantId: membership.tenantId,
        projectId: newProject.id,
        level: 'PROJECT',
        role: 'PROJECT_ADMIN'
      }
    });

    return newProject;
  });

  return project;
}
```

---

## Summary of Changes

| Component | Current | New | Impact |
|-----------|---------|-----|--------|
| Task Options | 2 tables (status, priority) | 1 table with type enum | Simplified, shared IDs |
| Templates | Mixed with projects | Separate tables | Clean separation |
| Memberships | 2 tables (TenantUser, ProjectMember) | 1 unified table | Simplified access control |
| Roles | TenantRole + ProjectRole enums | Single SystemRole enum | Unified hierarchy |
| Invitations | Separate role fields | Single role field | Cleaner structure |
| Access Control | Complex dual-check | Simple membership query | Better performance |

**Migration Risk:** HIGH - Requires careful data migration and thorough testing

**Estimated Downtime:** 15-30 minutes for production migration

**Rollback Plan:** Keep old tables for 7 days, maintain backup before migration
