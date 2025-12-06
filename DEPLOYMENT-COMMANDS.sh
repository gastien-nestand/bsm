# 🚀 Vercel Deployment - Step by Step Commands

# This file contains all the commands you need to deploy to Vercel
# Copy and paste each section as needed

# ============================================
# STEP 1: PUSH TO GITHUB
# ============================================

# Check current status
git status

# Push to GitHub (if you have uncommitted changes, commit them first)
git push origin main

# ============================================
# STEP 2: GENERATE JWT SECRET
# ============================================

# Run this command and copy the output
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output - you'll need it for Vercel environment variables

# ============================================
# STEP 3: VERCEL DEPLOYMENT
# ============================================

# After pushing to GitHub:
# 1. Go to https://vercel.com/dashboard
# 2. Click "Add New Project"
# 3. Import repository: gastien-nestand/bsm
# 4. Configure build settings:
#    - Framework Preset: Other
#    - Root Directory: ./
#    - Build Command: npm install --legacy-peer-deps && npm run build
#    - Output Directory: dist/public
#    - Install Command: npm install --legacy-peer-deps
#    - Node.js Version: 18.x

# ============================================
# STEP 4: ENVIRONMENT VARIABLES
# ============================================

# Add these in Vercel Dashboard → Settings → Environment Variables
# (Replace the placeholder values with your actual values)

# Required:
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
JWT_SECRET=<paste-the-generated-secret-from-step-2>

# Recommended for custom domain:
CUSTOM_DOMAIN=boulangeriesaintmarc.com
ALLOWED_ORIGINS=https://boulangeriesaintmarc.com,https://www.boulangeriesaintmarc.com

# Optional (for full features):
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=bsm-images
R2_PUBLIC_URL=https://...r2.dev

# ============================================
# STEP 5: POST-DEPLOYMENT DATABASE SETUP
# ============================================

# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Link to your project (run in project directory)
vercel link

# Pull production environment variables
vercel env pull .env.production

# Run database migrations
npm run migrate:prod

# Seed initial data
npm run seed:all

# ============================================
# STEP 6: VERIFY DEPLOYMENT
# ============================================

# Visit these URLs to verify (replace with your actual domain):
# https://your-project.vercel.app
# https://your-project.vercel.app/health
# https://boulangeriesaintmarc.com (after DNS setup)

# ============================================
# STEP 7: CUSTOM DOMAIN SETUP
# ============================================

# In Vercel Dashboard → Settings → Domains:
# 1. Add domain: boulangeriesaintmarc.com
# 2. Add domain: www.boulangeriesaintmarc.com

# Update DNS records at your domain registrar:
# A Record:    @    → (Vercel IP shown in dashboard)
# CNAME:       www  → cname.vercel-dns.com

# Wait 24-48 hours for DNS propagation

# ============================================
# STEP 8: STRIPE WEBHOOK (Optional)
# ============================================

# If using Stripe:
# 1. Go to https://dashboard.stripe.com/webhooks
# 2. Click "Add endpoint"
# 3. URL: https://boulangeriesaintmarc.com/api/stripe
# 4. Select events:
#    - checkout.session.completed
#    - checkout.session.expired
#    - payment_intent.payment_failed
# 5. Copy webhook signing secret
# 6. Add to Vercel env vars as STRIPE_WEBHOOK_SECRET
# 7. Redeploy: vercel --prod

# ============================================
# USEFUL COMMANDS
# ============================================

# Deploy from CLI
vercel --prod

# View deployment logs
vercel logs

# List deployments
vercel ls

# Check environment variables
vercel env ls

# Pull environment variables
vercel env pull

# Run production build locally
npm run build && npm start

# Check TypeScript errors
npm run check

# Database operations
npm run db:push          # Push schema changes
npm run db:studio        # Open Drizzle Studio
npm run migrate:prod     # Run production migrations

# ============================================
# TROUBLESHOOTING
# ============================================

# If build fails:
# 1. Check Vercel build logs
# 2. Verify Node.js version is 18.x or higher
# 3. Ensure --legacy-peer-deps is in build command

# If database connection fails:
# 1. Verify DATABASE_URL format
# 2. Ensure ?sslmode=require is in connection string
# 3. Check Neon database is active

# If environment variables don't work:
# 1. Redeploy after adding env vars
# 2. Check for typos in variable names
# 3. Ensure no trailing spaces

# ============================================
# ADMIN ACCESS
# ============================================

# Default admin credentials (CHANGE IMMEDIATELY):
# Email: admin@example.com
# Password: admin123

# ⚠️ CRITICAL: Change admin password after first login!

# ============================================
# DEPLOYMENT CHECKLIST
# ============================================

# Before deploying:
# ✅ All code committed to Git
# ✅ Pushed to GitHub
# ✅ TypeScript compilation passes (npm run check)
# ✅ Environment variables ready
# ✅ Database connection string ready
# ✅ JWT secret generated

# After deploying:
# ✅ Visit deployment URL
# ✅ Check /health endpoint
# ✅ Test user registration
# ✅ Test user login
# ✅ Browse products
# ✅ Test cart functionality
# ✅ Login as admin
# ✅ Change admin password
# ✅ Test admin CRUD operations

# ============================================
# DOCUMENTATION
# ============================================

# For more details, see:
# - READY-TO-DEPLOY.md - Quick action guide
# - VERCEL-CHECKLIST.md - Complete checklist
# - VERCEL-DEPLOY.md - Detailed deployment guide
# - PRODUCTION-READY.md - Production overview
# - .env.example - Environment variables template

# ============================================
# SUPPORT
# ============================================

# Vercel Docs: https://vercel.com/docs
# Neon Docs: https://neon.tech/docs
# Repository: https://github.com/gastien-nestand/bsm
