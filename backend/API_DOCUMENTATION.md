# StackFlow Task Management API Documentation

## Overview

Multi-tenant SaaS application backend built with Node.js, Express, PostgreSQL, and Prisma ORM. Features include user authentication (email + Google OAuth), workspace management, project organization, and team collaboration.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Google OAuth
- **Validation**: Joi
- **Security**: Helmet, CORS, bcrypt

## Project Structure

```
backend/
├── config/
│   ├── db.js              # PostgreSQL pool (legacy)
│   ├── env.js             # Environment variables
│   └── prisma.js          # Prisma client singleton
├── controllers/
│   ├── auth.controller.js
│   ├── onboarding.controller.js
│   ├── tenant.controller.js
│   └── invitation.controller.js
├── middlewares/
│   ├── auth.js            # JWT verification
│   ├── validate.js        # Request validation
│   ├── tenantContext.js   # Tenant context injection
│   ├── errorHandler.js    # Global error handler
│   └── notFound.js        # 404 handler
├── routes/
│   ├── index.js           # Main router
│   ├── auth.routes.js
│   ├── onboarding.routes.js
│   ├── tenant.routes.js
│   └── invitation.routes.js
├── services/
│   ├── auth.service.js    # Authentication logic
│   ├── jwt.service.js     # JWT operations
│   ├── otp.service.js     # OTP generation/verification
│   └── email.service.js   # Email sending (stub)
├── utils/
│   ├── ApiError.js        # Custom error class
│   ├── ApiResponse.js     # Standard response format
│   ├── asyncHandler.js    # Async error wrapper
│   └── logger.js          # Winston logger
├── validators/
│   ├── auth.validator.js
│   ├── onboarding.validator.js
│   ├── tenant.validator.js
│   └── invitation.validator.js
├── prisma/
│   └── schema.prisma      # Database schema
├── app.js                 # Express app setup
└── server.js              # Server entry point
```

## Database Schema

### Models

1. **User** - User accounts (email/Google auth)
2. **Tenant** - Workspaces/organizations
3. **TenantUser** - User-tenant relationships (with roles)
4. **OnboardingData** - User onboarding progress
5. **Project** - Projects within tenants
6. **ProjectSection** - Project sections/columns
7. **Task** - Individual tasks
8. **Invitation** - Team member invitations
9. **SubscriptionPlan** - Subscription plans
10. **OtpCode** - Email verification codes

### Enums

- **AuthProvider**: EMAIL, GOOGLE
- **TenantRole**: OWNER, ADMIN, MEMBER
- **ProjectLayout**: LIST, BOARD, TIMELINE, CALENDAR
- **InvitationStatus**: PENDING, ACCEPTED, EXPIRED

## API Endpoints

### Base URL

```
http://localhost:3001/api/v1
```

---

### Authentication (`/auth`)

#### 1. Register with Email
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "message": "OTP sent to your email",
    "email": "user@example.com"
  }
}
```

#### 2. Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": null,
      "avatarUrl": null,
      "isEmailVerified": true
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

#### 3. Google OAuth Login
```http
POST /auth/google
Content-Type: application/json

{
  "googleToken": "google_oauth_token"
}
```

#### 4. Login with Password
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### 5. Get Current User
```http
GET /auth/me
Authorization: Bearer {accessToken}
```

---

### Onboarding (`/onboarding`)

**All endpoints require authentication**

#### 1. Get Progress
```http
GET /onboarding/progress
Authorization: Bearer {accessToken}
```

#### 2. Save Profile (Step 3)
```http
POST /onboarding/profile
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "fullName": "John Doe",
  "password": "SecurePass123",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

#### 3. Save Role Info (Step 4)
```http
POST /onboarding/role-info
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "role": "Project Manager",
  "functions": ["Planning", "Execution"],
  "useCases": ["Team Collaboration", "Task Tracking"]
}
```

#### 4. Save Project Setup (Steps 5-7)
```http
POST /onboarding/project-setup
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "projectName": "My First Project",
  "tasks": [
    { "title": "Task 1", "sectionName": "To Do" },
    { "title": "Task 2", "sectionName": "In Progress" }
  ],
  "sections": [
    { "name": "To Do", "position": 0 },
    { "name": "In Progress", "position": 1 },
    { "name": "Done", "position": 2 }
  ]
}
```

#### 5. Save Layout (Step 8)
```http
POST /onboarding/layout
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "layout": "BOARD"
}
```

**Options:** LIST, BOARD, TIMELINE, CALENDAR

#### 6. Complete Onboarding (Step 9)
```http
POST /onboarding/complete
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "inviteEmails": [
    "teammate1@example.com",
    "teammate2@example.com"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Onboarding completed successfully",
  "data": {
    "tenant": { /* tenant object */ },
    "project": { /* project object */ },
    "invitationsSent": 2
  }
}
```

---

### Tenants (`/tenants`)

**All endpoints require authentication**

#### 1. Get User's Tenants
```http
GET /tenants
Authorization: Bearer {accessToken}
```

#### 2. Get Tenant Settings
```http
GET /tenants/{tenantId}/settings
Authorization: Bearer {accessToken}
```

**Requires:** ADMIN or OWNER role

#### 3. Update Tenant Settings
```http
PATCH /tenants/{tenantId}/settings
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Updated Workspace Name",
  "emailConfig": { /* email configuration */ },
  "messageConfig": { /* message configuration */ },
  "productKey": "product-key"
}
```

**Requires:** ADMIN or OWNER role

---

### Invitations (`/invitations`)

#### 1. Send Invitations
```http
POST /invitations/send
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "tenantId": "tenant-uuid",
  "emails": [
    "user1@example.com",
    "user2@example.com"
  ]
}
```

#### 2. Accept Invitation
```http
GET /invitations/accept/{token}
```

**Note:** Public endpoint (no authentication required)

#### 3. Get Pending Invitations
```http
GET /invitations/pending
Authorization: Bearer {accessToken}
```

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer {accessToken}
```

### Token Expiration

- **Access Token**: 30 days (configurable via JWT_EXPIRE)
- **Refresh Token**: 90 days

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error message here",
  "stack": "Stack trace (development only)"
}
```

### Common Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request / Validation Error
- **401** - Unauthorized / Invalid Token
- **403** - Forbidden / Insufficient Permissions
- **404** - Not Found
- **409** - Conflict / Duplicate Entry
- **500** - Internal Server Error

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskcrm
DB_USER=postgres
DB_PASSWORD=your_password

# Prisma Database URL
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/taskcrm?schema=public

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Client URL (for CORS)
CLIENT_URL=http://localhost:4200

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values.

### 3. Run Prisma Migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3001`

### 5. Test API

Health check endpoint:
```bash
curl http://localhost:3001/api/v1/health
```

---

## Testing the API

### Example Flow

1. **Register a user:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

2. **Check console for OTP code** (simulated email)

3. **Verify OTP:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'
```

4. **Use the returned token for authenticated requests:**
```bash
curl http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer {accessToken}"
```

---

## Database Management

### View Database

```bash
npx prisma studio
```

### Reset Database

```bash
npx prisma migrate reset
```

### Create New Migration

```bash
npx prisma migrate dev --name migration_name
```

---

## Security Features

1. **Helmet.js** - Security headers
2. **CORS** - Cross-origin resource sharing
3. **bcrypt** - Password hashing (10 rounds)
4. **JWT** - Stateless authentication
5. **Input Validation** - Joi schemas
6. **SQL Injection Prevention** - Prisma ORM
7. **Error Handling** - Centralized error middleware

---

## Future Enhancements

1. **Email Service** - Integrate SMTP (SendGrid/AWS SES)
2. **Rate Limiting** - Add express-rate-limit
3. **Refresh Token** - Implement token refresh endpoint
4. **2FA** - Two-factor authentication
5. **File Upload** - Avatar and attachment support
6. **WebSockets** - Real-time updates
7. **Search** - Full-text search functionality
8. **Audit Logs** - Track user actions
9. **Notifications** - In-app notifications system
10. **Tests** - Unit and integration tests

---

## Support

For issues or questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ using Node.js, Express, PostgreSQL, and Prisma**
