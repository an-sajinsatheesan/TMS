# Quick Start Guide - StackFlow Frontend

## Installation & Setup (5 minutes)

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Configure Environment
The `.env` file is already created with default settings:
```
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

### Step 3: Start Development Server
```bash
npm run dev
```

The app will be available at: **http://localhost:5173**

---

## Application Flow

### 1. Registration & Authentication

**Register New Account:**
1. Navigate to http://localhost:5173/register
2. Enter email address
3. Check console for OTP code (email service is simulated)
4. Enter OTP on verification page
5. You'll be redirected to onboarding

**Login with Existing Account:**
1. Navigate to http://localhost:5173/login
2. Enter email and password
3. Click "Sign In"
4. You'll be redirected to dashboard

---

### 2. Onboarding Flow (9 Steps)

After email verification, you'll go through the onboarding:

**Step 1: Welcome**
- Introduction to the platform
- Click "Let's Get Started"

**Step 2: Create Workspace**
- Enter workspace name (e.g., "Acme Inc.")
- Click "Continue"

**Step 3: Profile Setup**
- Enter full name
- Create password (min 6 characters)
- Confirm password
- Optional: Add avatar URL
- Click "Continue"

**Step 4: Role Information**
- Enter your role (e.g., "Project Manager")
- Select functions you perform (checkboxes)
- Select use cases (checkboxes)
- Click "Continue"

**Step 5: Project Name**
- Enter first project name (e.g., "Website Redesign")
- Click "Continue"

**Step 6: Project Sections**
- Default sections: "To Do", "In Progress", "Done"
- Add/remove sections as needed
- Click "Continue"

**Step 7: Add Tasks**
- Add tasks to your project
- Select section for each task
- Click "Continue"

**Step 8: Choose Layout**
- Select project view: List, Board, Timeline, or Calendar
- Click "Continue"

**Step 9: Invite Team**
- Enter team member emails (optional)
- Click "Complete Setup" or "Skip for now"
- You'll be redirected to dashboard

---

### 3. Dashboard

After completing onboarding:

- View all your workspaces
- Click on a workspace to view details
- Access workspace settings
- Logout from header

---

## Testing the Application

### Test Flow 1: Complete Registration
```
1. Go to /register
2. Enter: test@example.com
3. Check console for OTP (e.g., "123456")
4. Go to /verify-otp
5. Enter OTP
6. Complete all 9 onboarding steps
7. View dashboard
```

### Test Flow 2: Login Existing User
```
1. Go to /login
2. Enter credentials
3. View dashboard
```

### Test Flow 3: Accept Invitation
```
1. Copy invitation token from backend
2. Go to /invitation/accept/{token}
3. Join workspace
```

---

## Backend Connection

**Important:** The backend API must be running on http://localhost:3001

To start the backend:
```bash
cd backend
npm run dev
```

---

## Project Structure Overview

```
src/
├── api/              # API calls to backend
├── pages/            # Page components
│   ├── auth/        # Login, Register, Verify
│   ├── onboarding/  # 9 onboarding steps
│   └── dashboard/   # Dashboard & Workspace
├── contexts/         # Auth & Onboarding state
├── components/       # Reusable components
└── config/          # API configuration
```

---

## Common Commands

```bash
# Development
npm run dev          # Start dev server (port 5173)

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

---

## Key Features

✓ Email-based registration with OTP
✓ Password authentication
✓ JWT token management
✓ Protected routes
✓ 9-step onboarding flow
✓ Multi-tenant workspaces
✓ Team invitations
✓ Responsive design with Tailwind CSS

---

## Troubleshooting

**Problem:** Can't connect to API
- **Solution:** Ensure backend is running on port 3001

**Problem:** OTP not received
- **Solution:** Check browser console - OTP is logged there in development

**Problem:** Routes not working
- **Solution:** Refresh the page, React Router should handle it

**Problem:** Styles not applying
- **Solution:** Ensure Tailwind is properly configured, restart dev server

---

## Next Steps

1. Start backend API server
2. Run `npm run dev` in frontend directory
3. Navigate to http://localhost:5173
4. Register a new account
5. Complete onboarding
6. Explore the dashboard

---

## Support

For detailed documentation, see [README.md](README.md)

For API documentation, refer to the backend README
