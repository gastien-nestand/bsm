# 🚀 Vercel Deployment Checklist

## Pre-Deployment Verification

### ✅ Code Quality
- [x] TypeScript compilation passes (`npm run check`)
- [x] No build errors
- [x] All environment variables documented in `.env.example`
- [x] Git repository initialized and committed
- [x] Remote repository configured (gastien-nestand/bsm)

### ✅ Configuration Files
- [x] `vercel.json` configured
- [x] `.gitignore` properly set up
- [x] `.env.example` template created
- [x] Build scripts in `package.json`

### ✅ Documentation
- [x] Deployment guide (`VERCEL-DEPLOY.md`)
- [x] Quick start guide (`DEPLOY-NOW.md`)
- [x] Production checklist (`PRODUCTION-READY.md`)

---

## Deployment Steps

### Step 1: Commit and Push to GitHub ✨

```bash
# Add the new deployment checklist
git add DEPLOY-NOW.md VERCEL-CHECKLIST.md

# Commit
git commit -m "Add deployment documentation"

# Push to GitHub
git push origin main
```

### Step 2: Create Vercel Project 🌐

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import repository: `gastien-nestand/bsm`
4. Configure settings:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install --legacy-peer-deps`
   - **Node.js Version**: 18.x or higher

### Step 3: Environment Variables 🔐

Add these in Vercel Dashboard → Settings → Environment Variables:

#### Required (Production)
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
JWT_SECRET=<generate-with-command-below>
CUSTOM_DOMAIN=boulangeriesaintmarc.com
ALLOWED_ORIGINS=https://boulangeriesaintmarc.com,https://www.boulangeriesaintmarc.com
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Optional (For Full Features)
```env
# Stripe Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudflare R2 (Image Uploads)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=bsm-images
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

### Step 4: Deploy 🚀

1. Click **"Deploy"** in Vercel
2. Wait for build to complete (~2-3 minutes)
3. Visit your deployment URL (e.g., `bsm.vercel.app`)

### Step 5: Configure Custom Domain 🌍

1. In Vercel → Settings → Domains
2. Add `boulangeriesaintmarc.com`
3. Add `www.boulangeriesaintmarc.com`
4. Update DNS records at your domain registrar:
   - **A Record**: `@` → Vercel IP (shown in dashboard)
   - **CNAME**: `www` → `cname.vercel-dns.com`

### Step 6: Database Setup 🗄️

After successful deployment, set up your database:

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.production

# Run migrations
npm run migrate:prod

# Seed initial data
npm run seed:all
```

### Step 7: Configure Stripe Webhooks 💳

If using Stripe:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. URL: `https://boulangeriesaintmarc.com/api/stripe`
4. Select events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
5. Copy webhook signing secret
6. Add to Vercel env vars as `STRIPE_WEBHOOK_SECRET`
7. Redeploy to apply changes

---

## Post-Deployment Verification ✅

### Automated Tests
- [ ] Visit: https://boulangeriesaintmarc.com
- [ ] Health check: https://boulangeriesaintmarc.com/health
- [ ] API responds correctly
- [ ] Static assets load (images, CSS, JS)

### User Flow Testing
- [ ] User registration works
- [ ] User login works
- [ ] Browse products page
- [ ] Add items to cart
- [ ] Cart persists across sessions
- [ ] Checkout flow (if Stripe configured)

### Admin Testing
- [ ] Login as admin (admin@example.com / admin123)
- [ ] **IMMEDIATELY change admin password**
- [ ] Create new product
- [ ] Edit existing product
- [ ] Delete product
- [ ] Upload images (if R2 configured)

### Performance
- [ ] Page load time < 3 seconds
- [ ] Images load properly
- [ ] No console errors
- [ ] Mobile responsive

---

## Troubleshooting 🔧

### Build Fails
**Symptom**: Deployment fails during build
**Solution**:
1. Check Vercel build logs
2. Verify `package.json` scripts
3. Ensure `--legacy-peer-deps` is in build command
4. Check Node.js version (18.x+)

### Database Connection Error
**Symptom**: 500 errors, "Cannot connect to database"
**Solution**:
1. Verify `DATABASE_URL` in Vercel env vars
2. Check Neon database is active
3. Ensure connection string includes `?sslmode=require`
4. Test connection from local with production env

### Environment Variables Not Working
**Symptom**: Features not working, undefined errors
**Solution**:
1. Verify all required env vars are set
2. Check for typos in variable names
3. Redeploy after adding env vars
4. No trailing spaces in values

### Custom Domain Not Working
**Symptom**: Domain doesn't resolve
**Solution**:
1. Wait 24-48 hours for DNS propagation
2. Verify DNS records at registrar
3. Check domain status in Vercel dashboard
4. Try `dig boulangeriesaintmarc.com` to verify DNS

### 404 Errors on Routes
**Symptom**: Direct URLs return 404
**Solution**:
1. Verify `vercel.json` routing configuration
2. Check output directory is `dist/public`
3. Ensure SPA fallback is configured

---

## Monitoring & Maintenance 📊

### Regular Checks
- Monitor Vercel analytics
- Check error logs weekly
- Review database usage
- Update dependencies monthly

### Security
- Rotate JWT_SECRET quarterly
- Update admin password regularly
- Review Stripe webhook logs
- Monitor for suspicious activity

### Backups
- Neon provides automatic backups
- Export data monthly for safety
- Keep local development database synced

---

## Quick Commands Reference 📝

```bash
# Deploy from CLI
vercel --prod

# View logs
vercel logs

# Pull environment variables
vercel env pull

# Run production build locally
npm run build && npm start

# Database operations
npm run db:push          # Push schema changes
npm run migrate:prod     # Run production migrations
npm run seed:all         # Seed all data
```

---

## Support Resources 📚

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Stripe Docs**: https://stripe.com/docs
- **Project Docs**: See `VERCEL-DEPLOY.md` for detailed guide

---

## Success Criteria ✨

Your deployment is successful when:
- ✅ Website loads at custom domain
- ✅ Health endpoint returns 200
- ✅ Users can register and login
- ✅ Products display correctly
- ✅ Cart functionality works
- ✅ Admin panel accessible
- ✅ No console errors
- ✅ Mobile responsive
- ✅ SSL certificate active (HTTPS)

---

**Ready to deploy? Follow the steps above and you'll be live in ~15 minutes! 🎉**

**Last Updated**: 2025-12-06
**Repository**: https://github.com/gastien-nestand/bsm
**Target Domain**: boulangeriesaintmarc.com
