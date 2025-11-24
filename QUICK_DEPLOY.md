# Quick Deployment Guide - Render

## 🚀 Quick Start (5 minutes)

### 1. Prerequisites
- ✅ Render account: https://render.com
- ✅ MongoDB Atlas account: https://mongodb.com/cloud/atlas
- ✅ Code pushed to GitHub

### 2. Deploy to Render

**Option A: Using Blueprint (Recommended)**
1. Push code to GitHub
2. Go to https://dashboard.render.com
3. Click "New" → "Blueprint"
4. Connect repository
5. Render will read `render.yaml` automatically
6. Add environment variables (see below)
7. Click "Apply"

**Option B: Manual Setup**
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Build Command**: `npm install && apt-get update && apt-get install -y chromium chromium-sandbox libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi6 libxtst6 libnss3 libcups2 libxss1 libxrandr2 libasound2 libpangocairo-1.0-0 libatk1.0-0 libatk-bridge2.0-0 libgtk-3-0 || true`
   - **Start Command**: `npm run server`
   - **Environment**: Node
5. Add environment variables (see below)
6. Click "Create Web Service"

### 3. Required Environment Variables

Add these in Render Dashboard → Environment:

```bash
# Core (REQUIRED)
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
JWT_SECRET=<generate with: openssl rand -base64 64>
SESSION_SECRET=<generate with: openssl rand -base64 64>
FRONTEND_URL=https://your-frontend.vercel.app

# Puppeteer (REQUIRED for URL scanning)
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# AI Services (RECOMMENDED)
GEMINI_API_KEY=your_gemini_api_key
```

### 4. MongoDB Atlas Setup

1. Create free cluster at https://mongodb.com/cloud/atlas
2. Create database user (save password!)
3. Network Access → Add IP → "Allow Access from Anywhere" (0.0.0.0/0)
4. Get connection string → Replace `<password>` with actual password
5. Add database name: `...mongodb.net/cyberawareness?retryWrites=true...`

**Special characters in password?** URL-encode them:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`

### 5. Update Frontend

Update your frontend's API URL:
```javascript
// .env or config
VITE_API_URL=https://your-service.onrender.com
```

### 6. Verify Deployment

```bash
# Test health endpoint
curl https://your-service.onrender.com/api/health

# Expected response:
{"status":"OK","timestamp":"..."}
```

---

## 📚 Full Documentation

For detailed setup, troubleshooting, and security configuration:
- **Full Guide**: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
- **Environment Template**: [.env.production.example](./.env.production.example)
- **Configuration**: [render.yaml](./render.yaml)

---

## ⚠️ Common Issues

### Build Fails
- Ensure build command includes Chromium installation
- Check Render build logs for specific errors

### MongoDB Connection Fails
- Verify connection string is correct
- URL-encode special characters in password
- Check MongoDB Network Access allows 0.0.0.0/0
- Ensure database user has read/write permissions

### CORS Errors
- Set `FRONTEND_URL` to exact frontend URL (no trailing slash)
- Verify frontend is using correct backend URL

### Puppeteer Errors
- Ensure `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium`
- Verify Chromium installation in build command

---

## 💰 Cost

**Free Tier** (Perfect for testing):
- Render: Free (spins down after 15min inactivity)
- MongoDB: Free (512MB storage)
- **Total: $0/month**

**Production Tier**:
- Render Starter: $7/month (always-on)
- MongoDB: Free or $57/month for M10
- **Total: $7-64/month**

---

## 🔒 Security Checklist

Before going live:
- [ ] Strong MongoDB password (URL-encoded if needed)
- [ ] JWT_SECRET is 64+ random characters
- [ ] SESSION_SECRET is 64+ random characters
- [ ] FRONTEND_URL set correctly
- [ ] MongoDB Network Access configured
- [ ] All API keys kept secret
- [ ] HTTPS enforced (automatic on Render)

---

## 🎉 You're Done!

Your backend is now deployed and production-ready!

**Next Steps**:
1. Monitor logs in Render dashboard
2. Test all features (auth, analyzer, reports)
3. Set up alerts for failures
4. Consider upgrading to Starter plan for production

**Need Help?** See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed troubleshooting.
