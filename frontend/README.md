# StackFlow Frontend - Task Management Application

A modern React application built with Vite and Tailwind CSS for managing tasks, projects, and team collaboration.

## Tech Stack

- **React** - UI Library
- **Vite** - Build Tool & Dev Server
- **Tailwind CSS** - Utility-first CSS Framework
- **React Router** - Client-side Routing
- **Axios** - HTTP Client
- **Context API** - State Management

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── api/               # API service layer
│   │   ├── axios.instance.js
│   │   ├── auth.service.js
│   │   ├── onboarding.service.js
│   │   ├── tenant.service.js
│   │   └── invitation.service.js
│   ├── components/        # Reusable components
│   │   ├── auth/
│   │   ├── common/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── dashboard/
│   │   └── onboarding/
│   ├── config/            # Configuration files
│   │   └── api.config.js
│   ├── contexts/          # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── OnboardingContext.jsx
│   ├── pages/             # Page components
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── VerifyOtp.jsx
│   │   ├── onboarding/
│   │   │   ├── OnboardingLayout.jsx
│   │   │   ├── Step1Welcome.jsx
│   │   │   ├── Step2CreateWorkspace.jsx
│   │   │   ├── Step3Profile.jsx
│   │   │   ├── Step4RoleInfo.jsx
│   │   │   ├── Step5ProjectName.jsx
│   │   │   ├── Step6Sections.jsx
│   │   │   ├── Step7Tasks.jsx
│   │   │   ├── Step8Layout.jsx
│   │   │   └── Step9Invite.jsx
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   └── Workspace.jsx
│   │   └── InvitationAccept.jsx
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── constants/         # Constants and enums
│   ├── App.jsx            # Main App component with routes
│   ├── main.jsx           # Application entry point
│   └── index.css          # Global styles
├── .env                   # Environment variables
├── .env.example           # Example environment variables
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Features

### Authentication
- Email-based registration with OTP verification
- Password-based login
- JWT token authentication
- Protected routes
- Auto-redirect on unauthorized access

### Onboarding Flow (9 Steps)
1. **Welcome** - Introduction to the platform
2. **Create Workspace** - Set up workspace name
3. **Profile Setup** - User profile with name and password
4. **Role Information** - User role, functions, and use cases
5. **Project Name** - Create first project
6. **Project Sections** - Define project sections (To Do, In Progress, Done)
7. **Add Tasks** - Add initial tasks to sections
8. **Choose Layout** - Select project view (List, Board, Timeline, Calendar)
9. **Invite Team** - Invite team members via email

### Dashboard
- View all workspaces
- Workspace overview
- Navigation to projects and tasks

### Team Collaboration
- Accept workspace invitations
- Multi-tenant support

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:3001`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and update the API base URL if needed:
```
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

3. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## API Integration

The application connects to the backend API with the following endpoints:

### Authentication
- `POST /auth/register` - Register with email
- `POST /auth/verify-otp` - Verify email with OTP code
- `POST /auth/login` - Login with email/password
- `GET /auth/me` - Get current user

### Onboarding
- `GET /onboarding/progress` - Get onboarding progress
- `POST /onboarding/profile` - Save profile (Step 3)
- `POST /onboarding/role-info` - Save role info (Step 4)
- `POST /onboarding/project-setup` - Save project setup (Steps 5-7)
- `POST /onboarding/layout` - Save layout preference (Step 8)
- `POST /onboarding/complete` - Complete onboarding (Step 9)

### Tenants
- `GET /tenants` - Get user's workspaces
- `GET /tenants/:id/settings` - Get workspace settings
- `PATCH /tenants/:id/settings` - Update workspace settings

### Invitations
- `POST /invitations/send` - Send team invitations
- `GET /invitations/accept/:token` - Accept invitation
- `GET /invitations/pending` - Get pending invitations

## State Management

### AuthContext
Manages user authentication state:
- `user` - Current user object
- `loading` - Loading state
- `login(email, password)` - Login user
- `register(email)` - Register new user
- `verifyOtp(email, code)` - Verify OTP
- `logout()` - Logout user
- `checkAuth()` - Check authentication status

### OnboardingContext
Manages onboarding flow state:
- `currentStep` - Current onboarding step (1-9)
- `onboardingData` - Collected onboarding data
- `nextStep()` - Move to next step
- `prevStep()` - Move to previous step
- `saveProfile(data)` - Save profile data
- `saveRoleInfo(data)` - Save role information
- `saveProjectSetup(data)` - Save project setup
- `saveLayout(data)` - Save layout preference
- `completeOnboarding(data)` - Complete onboarding

## Routing

### Public Routes
- `/` - Redirects to `/login`
- `/login` - Login page
- `/register` - Registration page
- `/verify-otp` - OTP verification page
- `/invitation/accept/:token` - Accept invitation (public)

### Protected Routes (require authentication)
- `/onboarding` - Onboarding flow (Steps 1-9)
- `/dashboard` - Main dashboard
- `/workspace/:tenantId` - Workspace view

## Styling

The application uses Tailwind CSS for styling with a minimal, clean design:

- Gray-based color scheme
- Blue accent color for primary actions
- Responsive design
- Shadow and border utilities
- Focus states for accessibility

### Customization

To customize the theme, edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      // Add custom colors
    },
  },
}
```

## Development Guidelines

### Adding New Pages
1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Import required contexts if needed

### Adding New API Endpoints
1. Add endpoint to `src/config/api.config.js`
2. Create or update service in `src/api/`
3. Use service in components/pages

### Creating Reusable Components
1. Create component in appropriate `src/components/` subdirectory
2. Export component
3. Import and use in pages

## Error Handling

- API errors are caught and displayed in UI
- 401 errors trigger automatic logout and redirect to login
- Form validation errors shown inline
- Network errors display user-friendly messages

## Security

- JWT tokens stored in localStorage
- Authorization header added automatically to requests
- Protected routes check authentication
- Automatic token refresh on API errors (401)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features
- CSS Grid and Flexbox

## Troubleshooting

### Common Issues

1. **API connection failed**
   - Ensure backend is running on `http://localhost:3001`
   - Check `.env` file has correct `VITE_API_BASE_URL`

2. **Routes not working**
   - Check React Router configuration
   - Ensure all imports are correct

3. **Tailwind styles not applying**
   - Check `tailwind.config.js` content paths
   - Ensure `@tailwind` directives are in `index.css`

4. **Build errors**
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Clear Vite cache: `rm -rf .vite`

## License

MIT
