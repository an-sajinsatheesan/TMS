# TMS Project Setup Guide

## Prerequisites

1. **PostgreSQL** - Make sure PostgreSQL is installed and running
2. **Node.js** - Version 16 or higher

## Setup Steps

### 1. Database Setup

The database configuration is already set in `backend/.env`:
- Database: taskcrm
- User: postgres
- Password: new_password
- Port: 5432

Make sure PostgreSQL is running and the database exists.

### 2. Dependencies

Dependencies have been installed for both frontend and backend.

If you need to reinstall:
```bash
# Frontend
cd frontend
npm install --legacy-peer-deps

# Backend
cd backend
npm install
```

### 3. Prisma Setup

Generate Prisma client (if needed):
```bash
cd backend
npx prisma generate
```

If you encounter file permission errors with Prisma generate, try:
- Close any running backend servers
- Delete the `node_modules/.prisma` folder and try again
- Or restart your computer and try again

Apply database migrations:
```bash
cd backend
npx prisma migrate deploy
```

Or push schema changes:
```bash
cd backend
npx prisma db push
```

### 4. Running the Application

**Option 1: Using batch scripts (Windows)**
- Open TWO separate command prompts
- In first prompt: Run `start-backend.bat`
- In second prompt: Run `start-frontend.bat`

**Option 2: Manual start**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Fixed Issues

1. ✅ Created all missing onboarding pages:
   - OnboardingLayout.jsx
   - Step1Welcome.jsx
   - Step2CreateWorkspace.jsx
   - Step3Profile.jsx
   - Step6Sections.jsx
   - Step7Tasks.jsx
   - Step8Layout.jsx
   - Step9Invite.jsx

2. ✅ Created missing InvitationAccept.jsx page

3. ✅ Installed all dependencies (using --legacy-peer-deps for React 19 compatibility)

## Common Issues

### React Version Conflict
The project uses React 19, but some dependencies (like gantt-task-react) require React 18.
This is resolved by using `--legacy-peer-deps` flag during npm install.

### Prisma Client Generation Fails
If you get EPERM errors:
1. Close all running servers
2. Delete `backend/node_modules/.prisma` folder
3. Run `npx prisma generate` again

### Database Connection Issues
Verify PostgreSQL is running:
```bash
# Check if PostgreSQL service is running
# Windows: Check Services app
# Or try connecting with psql
psql -U postgres -d taskcrm
```

## Project Structure

```
TMS/
├── backend/          # Express + Prisma backend
│   ├── prisma/      # Database schema and migrations
│   ├── routes/      # API routes
│   └── .env         # Environment variables
├── frontend/        # React + Vite frontend
│   ├── src/
│   │   ├── pages/   # Page components
│   │   ├── components/ # Reusable components
│   │   └── contexts/   # React contexts
│   └── package.json
└── README-SETUP.md  # This file
```

## Next Steps

1. Start both servers (backend and frontend)
2. Navigate to http://localhost:5173
3. Register a new account
4. Complete the onboarding flow
5. Start using the task management system!
