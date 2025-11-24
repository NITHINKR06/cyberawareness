# Deploying Backend to Render - Production Guide

This guide walks you through deploying the Cyber Awareness backend API to Render with production-grade security and configuration.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Environment Variables](#environment-variables)
- [MongoDB Setup](#mongodb-setup)
- [Security Configuration](#security-configuration)
- [Troubleshooting](#troubleshooting)
- [Post-Deployment](#post-deployment)

---

## Prerequisites

### Required
- ✅ Render account (free tier works): https://render.com
- ✅ MongoDB Atlas account (free tier works): https://mongodb.com/cloud/atlas
- ✅ GitHub repository with your code
- ✅ Frontend deployed URL (e.g., Vercel URL)

### Recommended
- 🔑 Gemini API key (for AI analysis): https://makersuite.google.com/app/apikey
- 🔑 Google Safe Browsing API key: https://console.cloud.google.com/apis/credentials

---

## Quick Start

### 1. Fork/Push Code to GitHub
Ensure your code is in a GitHub repository that Render can access.

### 2. Create New Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository containing this code

### 3. Configure Service

**Basic Settings:**
- **Name**: `cyberawareness-backend` (or your choice)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave blank (or specify if backend is in subdirectory)
- **Environment**: `Node`
- **Build Command**:
  ```bash
  npm install && apt-get update && apt-get install -y chromium chromium-sandbox libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi6 libxtst6 libnss3 libcups2 libxss1 libxrandr2 libasound2 libpangocairo-1.0-0 libatk1.0-0 libatk-bridge2.0-0 libgtk-3-0 || true
  ```
- **Start Command**: `npm run server`
- **Plan**: Free (or Starter for better performance)

### 4. Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add the following:

#### Required Variables

| Variable | Value | How to Get |
|----------|-------|------------|
| `NODE_ENV` | `production` | Fixed value |
| `PORT` | `5000` | Fixed value |
| `MONGODB_URI` | Your MongoDB connection string | [See MongoDB Setup](#mongodb-setup) |
| `JWT_SECRET` | Random 64-char string | Generate: `openssl rand -base64 64` |
| `SESSION_SECRET` | Random 64-char string | Generate: `openssl rand -base64 64` |
| `FRONTEND_URL` | Your frontend URL | e.g., `https://cyberawareness-iota.vercel.app` |

#### Puppeteer Configuration (Required for URL scanning)

| Variable | Value |
|----------|-------|
| `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` | `true` |
| `PUPPETEER_EXECUTABLE_PATH` | `/usr/bin/chromium` |

#### Optional AI Services

| Variable | How to Get | Purpose |
|----------|------------|---------|
| `GEMINI_API_KEY` | https://makersuite.google.com/app/apikey | AI-powered scam analysis |
| `GOOGLE_SAFE_BROWSING_API_KEY` | https://console.cloud.google.com/apis/credentials | URL threat detection |
| `HUGGINGFACE_API_KEY` | https://huggingface.co/settings/tokens | Alternative AI analysis |

### 5. Deploy

Click **"Create Web Service"** and wait for deployment (5-10 minutes).

---

## Detailed Setup

### MongoDB Setup

#### 1. Create MongoDB Atlas Cluster

1. Go to https://mongodb.com/cloud/atlas
2. Sign up/Login
3. Create a **FREE** M0 cluster
4. Choose a cloud provider and region (preferably same as Render)
5. Click **"Create Cluster"**

#### 2. Create Database User

1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `cyberawareness` (or your choice)
5. Password: Generate a strong password (save it!)
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

#### 3. Whitelist Render IPs

1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ This is required for Render's dynamic IPs
   - Security is maintained through authentication
4. Click **"Confirm"**

#### 4. Get Connection String

1. Go to **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string:
   ```
   mongodb+srv://cyberawareness:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name after `.net/`: `mongodb+srv://...mongodb.net/cyberawareness?retryWrites=true&w=majority`

#### 5. URL-Encode Special Characters

If your password contains special characters, URL-encode them:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`
- `&` → `%26`

Use: https://www.urlencoder.org/

**Example:**
- Password: `p@ss:w0rd`
- Encoded: `p%40ss%3Aw0rd`
- Final URI: `mongodb+srv://user:p%40ss%3Aw0rd@cluster.mongodb.net/dbname`

---

## Environment Variables Reference

### Core Application

```bash
# Environment
NODE_ENV=production

# Server Port (Render sets this automatically, but 5000 is default)
PORT=5000

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cyberawareness?retryWrites=true&w=majority

# Security Secrets (Generate with: openssl rand -base64 64)
JWT_SECRET=your_64_character_random_string_here
SESSION_SECRET=your_64_character_random_string_here

# Frontend URL for CORS (CRITICAL - Set to your actual frontend URL)
FRONTEND_URL=https://cyberawareness-iota.vercel.app
```

### Puppeteer Configuration

```bash
# Puppeteer (Required for URL scanning feature)
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

### Optional AI Services

```bash
# Gemini AI (Recommended for best AI analysis)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

# Google Safe Browsing (Recommended for URL safety)
GOOGLE_SAFE_BROWSING_API_KEY=your_google_api_key

# Hugging Face (Alternative AI provider)
HUGGINGFACE_API_KEY=your_huggingface_api_key

# LLM Provider Selection (gemini or chatgpt)
LLM_PROVIDER=gemini
```

### Optional Threat Intelligence

```bash
# VirusTotal API
VIRUSTOTAL_API_KEY=your_virustotal_api_key

# PhishTank API
PHISHTANK_API_KEY=your_phishtank_api_key
```

---

## Security Configuration

### 1. CORS Setup

The backend is configured to accept requests from:
- Your `FRONTEND_URL` environment variable
- `localhost` (development only)

**Important:** Set `FRONTEND_URL` to your exact frontend URL without trailing slash:
```
✅ Correct: https://cyberawareness-iota.vercel.app
❌ Wrong: https://cyberawareness-iota.vercel.app/
```

### 2. Session Security

Sessions are configured with:
- ✅ `httpOnly: true` - Prevents XSS attacks
- ✅ `secure: true` - HTTPS only in production
- ✅ `sameSite: 'strict'` - CSRF protection
- ✅ 30-day expiration

### 3. Rate Limiting

API endpoints are rate-limited:
- **General API**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 requests per 15 minutes per IP
- **Analyzer**: 20 requests per 15 minutes per IP

### 4. Security Headers

Automatically applied via Helmet.js:
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)
- X-XSS-Protection

---

## Troubleshooting

### Build Fails

**Error: "Cannot find module 'puppeteer'"**
- **Solution**: Ensure build command includes `npm install`

**Error: "Chromium not found"**
- **Solution**: Verify build command includes Chromium installation
- Check `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium`

### Deployment Fails

**Error: "Application failed to respond"**
- **Solution**: Check logs in Render dashboard
- Verify `PORT` environment variable is set
- Ensure start command is `npm run server`

### MongoDB Connection Fails

**Error: "MongoServerError: bad auth"**
- **Solution**: 
  1. Verify username and password are correct
  2. URL-encode special characters in password
  3. Check database user has read/write permissions

**Error: "ENOTFOUND cluster.mongodb.net"**
- **Solution**:
  1. Verify connection string is correct
  2. Check MongoDB cluster is not paused
  3. Ensure network access allows 0.0.0.0/0

**Error: "IP not whitelisted"**
- **Solution**: Add 0.0.0.0/0 to MongoDB Network Access

### CORS Errors

**Error: "Access-Control-Allow-Origin"**
- **Solution**:
  1. Verify `FRONTEND_URL` is set correctly
  2. Remove trailing slash from URL
  3. Check frontend is using correct backend URL

### Puppeteer Errors

**Error: "Failed to launch browser"**
- **Solution**:
  1. Verify Chromium installation in build command
  2. Check `PUPPETEER_EXECUTABLE_PATH` is set
  3. Ensure `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`

---

## Post-Deployment

### 1. Verify Deployment

Test the health endpoint:
```bash
curl https://your-service.onrender.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Update Frontend

Update your frontend's API base URL to point to Render:

```javascript
// In your frontend .env or config
VITE_API_URL=https://your-service.onrender.com
```

### 3. Test Key Features

1. **Authentication**: Test login/signup
2. **Scam Analyzer**: Submit text and URL for analysis
3. **Reports**: Create and view scam reports
4. **Admin Panel**: Access admin features (if applicable)

### 4. Monitor Logs

In Render Dashboard:
1. Go to your service
2. Click **"Logs"** tab
3. Monitor for errors or warnings

### 5. Set Up Alerts (Optional)

In Render Dashboard:
1. Go to **"Settings"** → **"Notifications"**
2. Add email for deployment failures
3. Set up health check alerts

### 6. Performance Monitoring

Monitor in Render Dashboard:
- **Metrics** tab: CPU, Memory, Response times
- **Events** tab: Deployments, restarts
- **Logs** tab: Application logs

---

## Maintenance

### Updating the Application

1. Push changes to GitHub
2. Render auto-deploys (if enabled)
3. Monitor deployment in dashboard
4. Verify health endpoint after deployment

### Scaling

Free tier limitations:
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ 750 hours/month free
- ⚠️ Slower cold starts

Upgrade to **Starter** plan ($7/month) for:
- ✅ Always-on service
- ✅ Faster performance
- ✅ More resources

### Backup

MongoDB Atlas automatically backs up your data:
- Free tier: 1 day retention
- Paid tier: Configurable retention

---

## Security Checklist

Before going live:

- [ ] `MONGODB_URI` uses strong password
- [ ] `JWT_SECRET` is 64+ random characters
- [ ] `SESSION_SECRET` is 64+ random characters
- [ ] `FRONTEND_URL` is set to exact frontend URL
- [ ] MongoDB Network Access allows Render IPs
- [ ] MongoDB user has minimal required permissions
- [ ] All API keys are kept secret (not in code)
- [ ] HTTPS is enforced (automatic on Render)
- [ ] Rate limiting is enabled (automatic)
- [ ] Security headers are set (automatic)

---

## Support

### Render Support
- Documentation: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

### MongoDB Support
- Documentation: https://docs.mongodb.com
- Community: https://community.mongodb.com
- University: https://university.mongodb.com

---

## Cost Estimate

### Free Tier (Recommended for testing)
- Render: Free (750 hours/month, spins down after 15min inactivity)
- MongoDB Atlas: Free (512MB storage, shared cluster)
- **Total: $0/month**

### Production Tier
- Render Starter: $7/month (always-on, better performance)
- MongoDB M10: $0.08/hour (~$57/month) or stick with free M0
- **Total: $7-64/month**

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Configure environment variables
3. ✅ Connect MongoDB Atlas
4. ✅ Update frontend API URL
5. ✅ Test all features
6. ✅ Monitor logs and metrics
7. 🎉 Go live!

---

**Need help?** Check the troubleshooting section or review Render logs for specific error messages.
