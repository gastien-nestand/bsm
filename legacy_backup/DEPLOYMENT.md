# Deployment Guide - Boulangerie Saint Marc

This guide will help you deploy the Boulangerie Saint Marc website to production with a custom domain.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (we recommend [Neon](https://neon.tech) for serverless PostgreSQL)
- A hosting platform account (Vercel, Railway, Render, or VPS)
- Custom domain (optional but recommended)

## Environment Setup

### 1. Create Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### 2. Required Environment Variables

**Critical variables you MUST set:**

- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `NODE_ENV=production`

**Optional but recommended:**

- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` - For payment processing
- `CUSTOM_DOMAIN` - Your custom domain name
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins for CORS

## Database Setup

### 1. Create Neon Database

1. Go to [Neon](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string
4. Add it to your `.env` as `DATABASE_URL`

### 2. Run Migrations

```bash
npm run db:push
```

### 3. Seed Initial Data

```bash
# Seed products
npx tsx seed-products.ts

# Seed drinks
npx tsx seed-drinks.ts

# Create admin user
npx tsx seed-admin.ts
```

## Build for Production

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Build the Application

```bash
npm run build
```

This will:
- Build the client-side React app with Vite
- Bundle the server-side code with esbuild
- Output everything to the `dist` folder

### 3. Test Production Build Locally

```bash
npm start
```

Visit `http://localhost:3000` to verify everything works.

## Deployment Options

### Option 1: Vercel (Recommended for ease)

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts
4. Add environment variables in Vercel dashboard
5. Deploy: `vercel --prod`

**Note:** Vercel is primarily for frontend. You'll need to deploy the backend separately or use Vercel's serverless functions.

### Option 2: Railway

1. Go to [Railway](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Add environment variables in Railway dashboard
5. Railway will auto-deploy on push

### Option 3: Render

1. Go to [Render](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set build command: `npm install --legacy-peer-deps && npm run build`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy

### Option 4: VPS (DigitalOcean, Linode, etc.)

1. SSH into your server
2. Install Node.js 18+
3. Clone your repository
4. Install dependencies: `npm install --legacy-peer-deps`
5. Create `.env` file with production values
6. Build: `npm run build`
7. Use PM2 to run the app:
   ```bash
   npm install -g pm2
   pm2 start npm --name "boulangerie" -- start
   pm2 save
   pm2 startup
   ```
8. Set up Nginx as reverse proxy (see below)

## Custom Domain Setup

### 1. DNS Configuration

Add these DNS records to your domain:

**For Vercel/Railway/Render:**
- Follow their specific DNS instructions in the dashboard

**For VPS:**
- A record: `@` → Your server IP
- A record: `www` → Your server IP

### 2. SSL Certificate

**Vercel/Railway/Render:** SSL is automatic

**VPS with Nginx:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 3. Update Environment Variables

Set `CUSTOM_DOMAIN` in your `.env`:
```
CUSTOM_DOMAIN=yourdomain.com
```

Update `ALLOWED_ORIGINS`:
```
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Nginx Configuration (VPS Only)

Create `/etc/nginx/sites-available/boulangerie`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
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

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/boulangerie /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Post-Deployment

### 1. Create Admin Account

SSH into your server or use your platform's console:
```bash
npx tsx seed-admin.ts
```

Default admin credentials:
- Email: admin@example.com
- Password: admin123

**⚠️ IMPORTANT:** Change the admin password immediately after first login!

### 2. Test the Application

1. Visit your domain
2. Test user registration and login
3. Test adding products to cart
4. Log in as admin and test CRUD operations
5. Test checkout flow (if Stripe is configured)

### 3. Monitor

- Check application logs regularly
- Monitor database usage
- Set up uptime monitoring (e.g., UptimeRobot)

## Troubleshooting

### Build Fails

- Ensure all dependencies are installed: `npm install --legacy-peer-deps`
- Check Node.js version: `node --version` (should be 18+)
- Clear cache: `rm -rf node_modules dist && npm install --legacy-peer-deps`

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check if database allows connections from your server IP
- For Neon, ensure SSL mode is enabled: `?sslmode=require`

### Cookie/Session Issues

- Ensure `JWT_SECRET` is set
- Check `sameSite` and `secure` cookie settings
- Verify `CUSTOM_DOMAIN` matches your actual domain

### CORS Errors

- Add your domain to `ALLOWED_ORIGINS`
- Ensure protocol (http/https) matches

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong `JWT_SECRET` (32+ random characters)
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set `NODE_ENV=production`
- [ ] Configure `ALLOWED_ORIGINS` properly
- [ ] Keep dependencies updated
- [ ] Regular database backups
- [ ] Monitor error logs

## Support

For issues or questions:
- Check the logs first
- Review this deployment guide
- Check environment variables are set correctly

## Updating the Application

```bash
git pull origin main
npm install --legacy-peer-deps
npm run build
pm2 restart boulangerie  # if using PM2
```

---

**Last Updated:** 2025-01-22
