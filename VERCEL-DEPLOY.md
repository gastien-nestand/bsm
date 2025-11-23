# Vercel Deployment Guide - Boulangerie Saint-Marc

## Quick Deployment Steps

### 1. Push to GitHub

```bash
# Add all files
git add .

# Commit changes
git commit -m "Production ready deployment"

# Add remote (if not already added)
git remote add origin https://github.com/gastien-nestand/bsm.git

# Push to GitHub
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository: `gastien-nestand/bsm`
4. Configure project:
   - **Framework Preset**: Other
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install --legacy-peer-deps`

### 3. Configure Environment Variables

Add these environment variables in Vercel dashboard (Settings → Environment Variables):

#### Required Variables

```bash
NODE_ENV=production
DATABASE_URL=your_neon_postgresql_connection_string
JWT_SECRET=your_secure_random_32_char_string
CUSTOM_DOMAIN=boulangeriesaintmarc.com
ALLOWED_ORIGINS=https://boulangeriesaintmarc.com,https://www.boulangeriesaintmarc.com
```

#### Stripe Configuration (for payments)

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Cloudflare R2 (for image uploads)

```bash
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

### 4. Configure Custom Domain

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add domain: `boulangeriesaintmarc.com`
4. Add domain: `www.boulangeriesaintmarc.com`
5. Follow Vercel's DNS configuration instructions
6. Update your domain's DNS records:
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Add A record: `@` → Vercel's IP address (shown in dashboard)

### 5. Run Database Migrations

After deployment, run migrations using Vercel CLI or dashboard:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Run migration
vercel env pull .env.production
npm run migrate:prod
```

### 6. Seed Initial Data

```bash
# Seed products
npx tsx seed-products.ts

# Seed drinks
npx tsx seed-drinks.ts

# Create admin user
npx tsx seed-admin.ts
```

**Default admin credentials:**
- Email: admin@example.com
- Password: admin123

⚠️ **IMPORTANT**: Change the admin password immediately after first login!

### 7. Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Endpoint URL: `https://boulangeriesaintmarc.com/api/stripe`
4. Select events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret
6. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

## Verification Checklist

After deployment:

- [ ] Visit https://boulangeriesaintmarc.com
- [ ] Check health endpoint: https://boulangeriesaintmarc.com/health
- [ ] Test user registration
- [ ] Test user login
- [ ] Browse products
- [ ] Add items to cart
- [ ] Test checkout flow
- [ ] Login as admin
- [ ] Test admin CRUD operations
- [ ] Verify Stripe payments work
- [ ] Test image uploads (if R2 configured)

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all dependencies are in package.json
- Ensure build command includes `--legacy-peer-deps`

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Neon database allows connections
- Ensure SSL mode is enabled in connection string

### Environment Variables Not Working
- Redeploy after adding environment variables
- Check variable names match exactly
- Verify no trailing spaces in values

### Custom Domain Not Working
- Wait 24-48 hours for DNS propagation
- Verify DNS records are correct
- Check domain configuration in Vercel dashboard

## Support

For issues:
1. Check Vercel deployment logs
2. Review environment variables
3. Check database connectivity
4. Verify Stripe configuration

---

**Deployment Date**: 2025-11-23
**Domain**: boulangeriesaintmarc.com
**Repository**: https://github.com/gastien-nestand/bsm
