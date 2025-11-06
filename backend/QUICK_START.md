# Quick Start Guide

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Make sure PostgreSQL is running and create a database:

```sql
CREATE DATABASE taskcrm;
```

### 3. Environment Configuration

The `.env` file is already configured. Update if needed:

```env
DATABASE_URL=postgresql://postgres:new_password@localhost:5432/taskcrm?schema=public
JWT_SECRET=stackflow-crm-super-secret-jwt-key-2024-change-in-production
PORT=3001
```

### 4. Run Migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start Server

```bash
npm run dev
```

Server will be available at: `http://localhost:3001`

## Test the API

### 1. Health Check

```bash
curl http://localhost:3001/api/v1/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-10-28T..."
}
```

### 2. Register a User

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "message": "OTP sent to your email",
    "email": "demo@example.com"
  }
}
```

**Check the console for the OTP code** (example: `773316`)

### 3. Verify OTP

```bash
curl -X POST http://localhost:3001/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","code":"773316"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": "...",
      "email": "demo@example.com",
      "isEmailVerified": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

### 4. Use the Token

Copy the `accessToken` from the response above and use it for authenticated requests:

```bash
curl http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## Available Scripts

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests (when configured)
```

## API Endpoints Overview

### Authentication
- `POST /api/v1/auth/register` - Register with email
- `POST /api/v1/auth/verify-otp` - Verify OTP
- `POST /api/v1/auth/google` - Google OAuth login
- `POST /api/v1/auth/login` - Login with password
- `GET /api/v1/auth/me` - Get current user (protected)

### Onboarding
- `GET /api/v1/onboarding/progress` - Get progress
- `POST /api/v1/onboarding/profile` - Save profile
- `POST /api/v1/onboarding/role-info` - Save role info
- `POST /api/v1/onboarding/project-setup` - Save project setup
- `POST /api/v1/onboarding/layout` - Save layout preference
- `POST /api/v1/onboarding/complete` - Complete onboarding

### Tenants
- `GET /api/v1/tenants` - Get user's tenants
- `GET /api/v1/tenants/:id/settings` - Get tenant settings
- `PATCH /api/v1/tenants/:id/settings` - Update tenant settings

### Invitations
- `POST /api/v1/invitations/send` - Send invitations
- `GET /api/v1/invitations/accept/:token` - Accept invitation
- `GET /api/v1/invitations/pending` - Get pending invitations

## Database Management

### View Database in Browser

```bash
npx prisma studio
```

Opens Prisma Studio at `http://localhost:5555`

### Reset Database (Caution!)

```bash
npx prisma migrate reset
```

⚠️ This will delete all data!

## Troubleshooting

### Port Already in Use

If port 3001 is in use, change the `PORT` in `.env`:

```env
PORT=3002
```

### Database Connection Issues

1. Check if PostgreSQL is running
2. Verify database credentials in `.env`
3. Ensure database `taskcrm` exists

### Migration Errors

If you encounter migration errors:

```bash
# Reset migrations
npx prisma migrate reset --force

# Regenerate Prisma Client
npx prisma generate

# Create fresh migration
npx prisma migrate dev --name init
```

## Next Steps

1. Complete the user onboarding flow
2. Create a tenant/workspace
3. Invite team members
4. Create projects and tasks
5. Integrate with your frontend application

## Documentation

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Project Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middlewares/     # Express middlewares
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── validators/      # Request validation schemas
├── prisma/          # Prisma schema and migrations
├── app.js           # Express app setup
└── server.js        # Server entry point
```

## Support

For issues or questions:
- Check the logs in the console
- Review the error messages
- Consult the API documentation
- Contact the development team

---

**Happy coding! 🚀**
