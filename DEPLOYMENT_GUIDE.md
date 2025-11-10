# TMS Deployment Guide

**Multi-Tenant Task Management System - Production Deployment**

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Architecture Overview](#architecture-overview)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Post-Deployment](#post-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Scaling Strategy](#scaling-strategy)
10. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements (1-100 users)

- **Server:** 2 vCPU, 4GB RAM
- **Database:** PostgreSQL 14+, 20GB storage
- **Node.js:** v18.x or higher
- **OS:** Ubuntu 22.04 LTS or similar

### Recommended Requirements (100-1000 users)

- **Server:** 4 vCPU, 8GB RAM
- **Database:** PostgreSQL 14+, 100GB storage, read replicas
- **Node.js:** v20.x LTS
- **Redis:** 1GB cache
- **OS:** Ubuntu 22.04 LTS

### Enterprise Requirements (1000+ users)

- **Servers:** Load-balanced cluster (3+ instances)
- **Database:** PostgreSQL 14+ with multi-AZ replication
- **Redis:** Redis Cluster (3+ nodes)
- **CDN:** Cloudflare or CloudFront
- **Monitoring:** Datadog, New Relic, or similar

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                          │
│                   (React + TailwindCSS)                     │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   CDN / Load Balancer                        │
│                   (Cloudflare / AWS ELB)                     │
└────────────┬────────────────────────────────┬────────────────┘
             │                                │
             ▼                                ▼
┌──────────────────────┐         ┌──────────────────────┐
│   Frontend Server    │         │   Backend API        │
│   (Vercel / Nginx)   │         │   (Express.js)       │
│   React + Vite       │         │   Node.js 20.x       │
└──────────────────────┘         └──────────┬───────────┘
                                            │
                     ┌──────────────────────┼──────────────────┐
                     │                      │                  │
                     ▼                      ▼                  ▼
            ┌────────────────┐   ┌──────────────────┐  ┌──────────────┐
            │  PostgreSQL    │   │   Redis Cache    │  │  Email       │
            │  (AWS RDS)     │   │   (ElastiCache)  │  │  (SendGrid)  │
            └────────────────┘   └──────────────────┘  └──────────────┘
```

---

## Environment Setup

### 1. Backend Environment Variables

Create `/backend/.env.production`:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-domain.com

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/tms_production?schema=public

# JWT Secrets (MUST BE UNIQUE - GENERATE NEW VALUES)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration (SendGrid)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.your-sendgrid-api-key
EMAIL_FROM=noreply@your-domain.com
EMAIL_FROM_NAME=Task Management System

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Security
BCRYPT_ROUNDS=12
OTP_EXPIRY_MINUTES=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs

# Prisma
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
```

### 2. Frontend Environment Variables

Create `/frontend/.env.production`:

```bash
# API Configuration
VITE_API_BASE_URL=https://api.your-domain.com/api/v1

# Google OAuth (Optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true

# Sentry (Error Tracking)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Environment
VITE_ENV=production
```

### 3. Generate Secure Secrets

```bash
# Generate JWT secrets (run locally, then copy to .env)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

---

## Database Setup

### Option 1: AWS RDS (Recommended for Production)

```bash
# 1. Create RDS PostgreSQL instance
# - Engine: PostgreSQL 14.x
# - Instance class: db.t3.medium (or higher)
# - Storage: 100GB SSD
# - Multi-AZ: Yes (for high availability)
# - Backup retention: 7 days

# 2. Configure security group
# - Allow inbound PostgreSQL (5432) from backend servers only

# 3. Get connection string
# Format: postgresql://username:password@endpoint:5432/database
```

### Option 2: Supabase (Easiest for Small Teams)

```bash
# 1. Create project at https://supabase.com
# 2. Go to Settings > Database
# 3. Copy connection string
# 4. Update DATABASE_URL in .env
```

### Option 3: Self-Hosted PostgreSQL

```bash
# Install PostgreSQL 14
sudo apt update
sudo apt install postgresql-14 postgresql-contrib

# Create database and user
sudo -u postgres psql

CREATE DATABASE tms_production;
CREATE USER tms_user WITH ENCRYPTED PASSWORD 'strong-password';
GRANT ALL PRIVILEGES ON DATABASE tms_production TO tms_user;
\q

# Enable remote connections (if needed)
sudo nano /etc/postgresql/14/main/postgresql.conf
# Set: listen_addresses = '*'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add: host all all 0.0.0.0/0 md5

sudo systemctl restart postgresql
```

### Run Migrations

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
node prisma/seeds/consolidatedOptions.seed.js
node prisma/seeds/globalTemplates.seed.js

# Create first super admin (replace email)
psql $DATABASE_URL -c "UPDATE users SET \"isSuperAdmin\" = true WHERE email = 'admin@company.com';"
```

---

## Backend Deployment

### Option 1: Railway (Easiest)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
cd backend
railway init

# 4. Add PostgreSQL
railway add

# 5. Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your-secret
# ... (add all variables from .env.production)

# 6. Deploy
railway up

# 7. Get URL
railway domain
```

### Option 2: Docker + AWS ECS

Create `/backend/Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

FROM node:20-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["npm", "start"]
```

Build and deploy:

```bash
# Build image
docker build -t tms-backend:latest .

# Test locally
docker run -p 5000:5000 --env-file .env.production tms-backend:latest

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-ecr-url
docker tag tms-backend:latest your-ecr-url/tms-backend:latest
docker push your-ecr-url/tms-backend:latest

# Deploy to ECS (via AWS Console or CLI)
```

### Option 3: VPS with PM2

```bash
# SSH into server
ssh user@your-server-ip

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone https://github.com/your-org/tms.git
cd tms/backend

# Install dependencies
npm ci --only=production

# Setup environment
cp .env.example .env.production
nano .env.production  # Edit with your values

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Start with PM2
pm2 start npm --name "tms-backend" -- start
pm2 save
pm2 startup

# Setup Nginx reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/tms

# Nginx config (see below)
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/tms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
cd frontend
vercel

# 4. Set environment variables in Vercel dashboard
# - VITE_API_BASE_URL=https://api.your-domain.com/api/v1

# 5. Deploy to production
vercel --prod

# 6. Add custom domain in Vercel dashboard
```

### Option 2: Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Build
cd frontend
npm run build

# 4. Deploy
netlify deploy --prod --dir=dist

# 5. Set environment variables in Netlify dashboard
```

### Option 3: AWS S3 + CloudFront

```bash
# Build frontend
cd frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Create CloudFront distribution
# - Origin: S3 bucket
# - Default root object: index.html
# - Error pages: 404 -> /index.html (for SPA routing)
# - SSL certificate: ACM certificate

# Invalidate CloudFront cache after deploy
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

---

## Post-Deployment

### 1. Create Super Admin User

```bash
# Via database (replace email)
psql $DATABASE_URL -c "UPDATE users SET \"isSuperAdmin\" = true WHERE email = 'admin@company.com';"

# Or via API after first admin exists
curl -X PATCH https://api.your-domain.com/api/v1/admin/users/{userId}/super-admin \
  -H "Authorization: Bearer SUPER_ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"isSuperAdmin": true}'
```

### 2. Verify Deployment

```bash
# Health check
curl https://api.your-domain.com/api/v1/health

# Expected response:
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-11-10T..."
}

# Test super admin dashboard
curl https://api.your-domain.com/api/v1/admin/dashboard \
  -H "Authorization: Bearer SUPER_ADMIN_JWT"
```

### 3. Setup Monitoring

**Sentry (Error Tracking):**
```bash
# Backend
npm install @sentry/node

# Add to backend/app.js:
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });

# Frontend
npm install @sentry/react

# Add to frontend/src/main.jsx:
import * as Sentry from '@sentry/react';
Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN });
```

**Uptime Monitoring:**
- UptimeRobot: https://uptimerobot.com
- Pingdom: https://www.pingdom.com
- Monitor: `https://api.your-domain.com/api/v1/health` (every 5 minutes)

### 4. Setup Backups

**Database Backups:**
```bash
# Automated daily backups
crontab -e

# Add:
0 2 * * * pg_dump $DATABASE_URL -F c -b -v -f /backups/tms_$(date +\%Y\%m\%d).dump
0 3 * * * find /backups -name "tms_*.dump" -mtime +7 -delete
```

**AWS RDS:** Enable automated backups (7-35 days retention)

**Supabase:** Backups are automatic

---

## Monitoring & Maintenance

### Key Metrics to Monitor

1. **Application Health**
   - Response time (target: < 200ms p95)
   - Error rate (target: < 0.1%)
   - Uptime (target: 99.9%)

2. **Database**
   - Connection pool usage
   - Query performance (slow queries > 1s)
   - Disk usage
   - Replication lag (if applicable)

3. **Server Resources**
   - CPU usage (alert if > 80%)
   - Memory usage (alert if > 85%)
   - Disk I/O

### Logs

```bash
# PM2 logs
pm2 logs tms-backend

# View error logs
tail -f backend/logs/error.log

# View combined logs
tail -f backend/logs/combined.log

# Search logs
grep "ERROR" backend/logs/combined.log | tail -20
```

### Routine Maintenance

**Weekly:**
- Review error logs
- Check database performance (pg_stat_statements)
- Verify backups are successful

**Monthly:**
- Update dependencies (`npm outdated`, `npm update`)
- Review and optimize slow database queries
- Archive old project activity logs (> 90 days)

**Quarterly:**
- Security audit (npm audit, OWASP check)
- Performance optimization review
- Capacity planning review

---

## Scaling Strategy

### Phase 1: Vertical Scaling (0-1000 users)

- Increase server resources (CPU, RAM)
- Upgrade database instance
- Add Redis cache

### Phase 2: Horizontal Scaling (1000-10,000 users)

```
┌─────────────────────────────────────┐
│        Load Balancer (ALB)          │
└──────┬──────────┬──────────┬────────┘
       │          │          │
       ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Backend  │ │ Backend  │ │ Backend  │
│ Server 1 │ │ Server 2 │ │ Server 3 │
└────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │            │
     └────────────┴────────────┘
                  │
                  ▼
         ┌────────────────┐
         │   PostgreSQL   │
         │   (Primary)    │
         └────────┬───────┘
                  │
         ┌────────┴───────┐
         │   Read Replica │
         └────────────────┘
```

### Phase 3: Microservices (10,000+ users)

- Split into services: Auth, Projects, Tasks, Notifications
- Implement message queue (RabbitMQ, Redis Streams)
- Add Elasticsearch for full-text search
- Implement CDN for static assets

---

## Troubleshooting

### Issue: Application won't start

```bash
# Check logs
pm2 logs tms-backend --err

# Common causes:
# 1. Database connection failed
# 2. Missing environment variables
# 3. Port already in use

# Verify environment
node -e "console.log(require('./backend/config/env'))"

# Test database connection
npx prisma db pull
```

### Issue: High database CPU usage

```sql
-- Find slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Add missing indexes
-- Check COMPREHENSIVE_ANALYSIS_REPORT.md for recommended indexes
```

### Issue: Memory leaks

```bash
# Monitor memory usage
pm2 monit

# Enable heap snapshots
node --inspect=0.0.0.0:9229 server.js

# Use Chrome DevTools to inspect heap
```

---

## Security Checklist

- [ ] HTTPS enabled (SSL/TLS certificate)
- [ ] Environment variables secured (not in git)
- [ ] Database access restricted (IP whitelist)
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled
- [ ] Helmet.js security headers enabled
- [ ] SQL injection protected (Prisma ORM)
- [ ] XSS protected (React auto-escaping)
- [ ] JWT secrets are strong (64+ characters)
- [ ] Passwords hashed with bcrypt (12 rounds)
- [ ] Sentry/error logging configured
- [ ] Backups tested and verified
- [ ] Monitoring and alerts configured

---

## Support

**Documentation:**
- [COMPREHENSIVE_ANALYSIS_REPORT.md](./COMPREHENSIVE_ANALYSIS_REPORT.md)
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

**Contact:**
- System Admin: admin@taskmanagement.system
- GitHub Issues: [Create Issue](https://github.com/your-org/tms/issues)

---

**Deployment Guide Prepared By:** Claude (AI DevOps Engineer)
**Last Updated:** November 10, 2025
**Version:** 2.0.0
