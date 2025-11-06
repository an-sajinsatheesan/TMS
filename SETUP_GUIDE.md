# TMS - Task Management System Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install --legacy-peer-deps
```

### 2. Database Setup

#### Create PostgreSQL Database

```sql
CREATE DATABASE tms_db;
CREATE USER tms_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE tms_db TO tms_user;
```

#### Configure Environment Variables

Create `backend/.env` file:

```env
# Database
DATABASE_URL="postgresql://tms_user:your_password@localhost:5432/tms_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"

# Email Configuration (Optional - for invitations)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="TMS <noreply@tms.com>"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

You can use `backend/.env.example` as a template.

### 3. Run Database Migrations & Seeds

```bash
cd backend

# Run migrations and seed data (all in one)
npm run db:setup

# Or run separately:
npm run db:migrate  # Run migrations
npm run db:seed     # Seed initial data
```

This will:
- Create all database tables
- Seed onboarding options (app usage, industries, team sizes, roles)
- Seed task status options (On Track, At Risk, Off Track, etc.)
- Seed task priority options (High, Medium, Low)
- Seed subscription plans (Free Trial, Starter, Professional, Enterprise)

### 4. Start Development Servers

#### Backend (Terminal 1)
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

#### Frontend (Terminal 2)
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

## 🎉 Your App is Ready!

Visit: http://localhost:5173

## Quick Test

1. **Sign Up**: Create a new account
2. **Onboarding**: Complete the 9-step onboarding wizard
3. **Dashboard**: You'll be redirected to your first project
4. **Create Tasks**: Start managing tasks!

## Recent Updates

### ✅ Database Consolidation (Latest)

- **Unified Onboarding Options**: 4 tables → 1 table with categories
- **Dynamic Status/Priority**: No more hardcoded values!
- **Multiple Subscription Plans**: 4 tiers ready
- **Enhanced Onboarding Flow**: Redirects to first project

### ✅ UI Library Migration (Latest)

- **Replaced**: PrimeReact ❌ → shadcn/ui ✅
- **Modern Components**: Built on Radix UI + Tailwind CSS
- **Better Performance**: Smaller bundle size
- **Fully Customizable**: Components in your codebase

## Project Structure

```
TMS/
├── backend/
│   ├── controllers/       # Route handlers
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   ├── seeds/         # Database seed files
│   │   └── migrations/    # Migration files
│   ├── scripts/           # Setup scripts
│   ├── validators/        # Request validation
│   └── server.js          # Express server
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   └── ...        # App components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── api/           # API services
│   │   └── lib/           # Utilities
│   └── vite.config.js
│
├── IMPLEMENTATION_SUMMARY.md           # Recent changes
├── DATABASE_MIGRATION_GUIDE.md         # Migration guide
└── PRIMEREACT_TO_SHADCN_MIGRATION.md  # UI migration guide
```

## Available Scripts

### Backend

```bash
npm run dev        # Start development server
npm start          # Start production server
npm run db:setup   # Run migrations + seeds
npm run db:migrate # Run migrations only
npm run db:seed    # Run seeds only
```

### Frontend

```bash
npm run dev     # Start dev server
npm run build   # Build for production
npm run preview # Preview production build
```

## Common Issues & Solutions

### Issue: Database connection failed

**Solution**: Check your DATABASE_URL in `.env` and ensure PostgreSQL is running

```bash
# Check if PostgreSQL is running (Mac)
brew services list

# Start PostgreSQL (Mac)
brew services start postgresql

# Check if PostgreSQL is running (Windows)
# Services → PostgreSQL → Start

# Check if PostgreSQL is running (Linux)
sudo systemctl status postgresql
```

### Issue: Port already in use

**Solution**: Change the port in backend `.env`:

```env
PORT=5001  # or any available port
```

### Issue: npm install fails with peer dependency errors

**Solution**: Use legacy peer deps flag:

```bash
npm install --legacy-peer-deps
```

### Issue: Prisma migration fails

**Solution**: Reset database and re-run setup:

```bash
# WARNING: This deletes all data
npx prisma migrate reset
npm run db:setup
```

## Environment Setup

### Development
- Backend: http://localhost:5000
- Frontend: http://localhost:5173
- Database: PostgreSQL on localhost:5432

### Production Checklist
- [ ] Update JWT_SECRET with strong random string
- [ ] Set NODE_ENV=production
- [ ] Configure production DATABASE_URL
- [ ] Set up SMTP for emails
- [ ] Configure CORS for your domain
- [ ] Set up SSL/HTTPS
- [ ] Configure environment variables on hosting platform

## Testing

### Manual Testing Checklist
- [ ] User registration works
- [ ] Email verification (if enabled)
- [ ] Login/logout
- [ ] Complete onboarding flow
- [ ] Create project
- [ ] Create tasks
- [ ] Invite team members
- [ ] Project layouts (List, Board, Timeline, Calendar)

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT Authentication
- Bcrypt for passwords
- Nodemailer for emails

### Frontend
- React 19
- Vite
- Tailwind CSS
- shadcn/ui (Radix UI + Lucide Icons)
- React Router
- Axios
- Sonner (toasts)

## Support & Documentation

- **Backend API Docs**: See `backend/PHASE1_API_SUMMARY.md` and `PHASE2_API_SUMMARY.md`
- **Database Changes**: See `backend/DATABASE_MIGRATION_GUIDE.md`
- **UI Migration**: See `frontend/PRIMEREACT_TO_SHADCN_MIGRATION.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`

## Next Steps

1. ✅ Complete the remaining PrimeReact → shadcn/ui migrations
2. ✅ Add unit tests
3. ✅ Set up CI/CD pipeline
4. ✅ Configure production deployment
5. ✅ Add E2E tests with Playwright/Cypress

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create PR

---

**Happy Coding! 🚀**
