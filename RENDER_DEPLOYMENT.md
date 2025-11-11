# Render Deployment Guide

This guide will help you deploy the Cyber Awareness application to Render and configure MongoDB Atlas.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. A MongoDB Atlas account (sign up at https://www.mongodb.com/cloud/atlas)
3. Your GitHub repository connected to Render

## Step 1: Set Up MongoDB Atlas

### 1.1 Create a MongoDB Atlas Cluster

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Build a Database"
3. Choose a free tier (M0) cluster
4. Select a cloud provider and region (choose one close to your Render region)
5. Name your cluster and click "Create"

### 1.2 Create a Database User

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter a username and generate a secure password (save this!)
5. Set user privileges to "Atlas admin" or create a custom role with read/write access
6. Click "Add User"

### 1.3 Configure Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For Render deployment, click "Allow Access from Anywhere" (0.0.0.0/0)
   - **Note:** For production, consider using Render's static IPs if available
4. Click "Confirm"

### 1.4 Get Your Connection String

1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "5.5 or later"
5. Copy the connection string
   - It should look like: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`
6. Replace `<password>` with your database user password
7. Replace `<dbname>` with your database name (e.g., `walrus_db`)

**Example connection string:**
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/walrus_db?retryWrites=true&w=majority
```

## Step 2: Deploy to Render

### 2.1 Create a New Web Service

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository: `NITHINKR06/cyberawareness`
5. Click "Connect"

### 2.2 Configure the Service

1. **Name:** Choose a name for your service (e.g., `cyberawareness`)
2. **Region:** Select a region close to your users
3. **Branch:** `main` (or your default branch)
4. **Root Directory:** Leave empty (or `./` if needed)
5. **Runtime:** `Node`
6. **Build Command:** `npm install`
7. **Start Command:** `node server/server.js`
8. **Instance Type:** Free tier is fine to start

### 2.3 Set Environment Variables

Click on "Environment" tab and add the following variables:

#### Required Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` | Your MongoDB Atlas connection string |
| `SESSION_SECRET` | `your-random-secret-key-here` | A random secret for session encryption (generate with `openssl rand -base64 64`) |
| `JWT_SECRET` | `your-random-jwt-secret-here` | A random secret for JWT tokens (generate with `openssl rand -base64 64`) |
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `10000` | Port (Render sets this automatically, but you can override) |

#### Optional Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_DBNAME` | `walrus_db` | Database name (optional, usually in connection string) |
| `HUGGINGFACE_API_KEY` | `your-api-key` | For AI text analysis (optional) |
| `GOOGLE_SAFE_BROWSING_API_KEY` | `your-api-key` | For URL safety checking (optional) |
| `GEMINI_API_KEY` | `your-api-key` | For AI summaries (optional) |
| `FRONTEND_URL` | `https://your-frontend-url.vercel.app` | Frontend URL for CORS (if deployed separately) |

### 2.4 Generate Secrets

To generate secure secrets for `SESSION_SECRET` and `JWT_SECRET`, run:

```bash
# Generate SESSION_SECRET
openssl rand -base64 64

# Generate JWT_SECRET
openssl rand -base64 64
```

Or use an online generator: https://www.lastpass.com/features/password-generator

### 2.5 Deploy

1. Click "Create Web Service"
2. Render will start building and deploying your application
3. Monitor the logs for any errors

## Step 3: Verify Deployment

### 3.1 Check Logs

1. Go to your service in Render dashboard
2. Click on "Logs" tab
3. Look for:
   - ✅ `Connected to MongoDB: host=... db=...`
   - ✅ `Server running on port 10000`
   - ❌ Any error messages

### 3.2 Test the Health Endpoint

Visit: `https://your-service-name.onrender.com/api/health`

You should see:
```json
{
  "status": "OK",
  "timestamp": "2025-01-11T..."
}
```

### 3.3 Common Issues

#### MongoDB Connection Failed

**Error:** `MongoServerError: bad auth : authentication failed`

**Solutions:**
1. Verify your `MONGODB_URI` is correct in Render environment variables
2. Check that the password in the connection string is URL-encoded (replace special characters)
3. Verify the database user has proper permissions
4. Check that your IP is whitelisted in MongoDB Atlas (or use 0.0.0.0/0)

#### Port Already in Use

**Error:** `Port 10000 is already in use`

**Solution:** Render automatically sets the `PORT` environment variable. Make sure your code uses `process.env.PORT` (which it does).

#### Session Secret Missing

**Error:** `SESSION_SECRET environment variable is required for security`

**Solution:** Add `SESSION_SECRET` to your Render environment variables.

## Step 4: Update Frontend (if applicable)

If your frontend is deployed separately (e.g., on Vercel), update the API URL:

1. Set `VITE_API_URL` environment variable in your frontend deployment
2. Update it to point to your Render service: `https://your-service-name.onrender.com`

## Step 5: Monitor and Maintain

### 5.1 View Logs

- Render provides real-time logs in the dashboard
- Check logs regularly for errors or warnings

### 5.2 Database Maintenance

- Monitor your MongoDB Atlas dashboard for usage
- Set up alerts for storage limits
- Regularly backup your database

### 5.3 Updates

- Push changes to your GitHub repository
- Render will automatically rebuild and redeploy
- Monitor logs after deployment

## Troubleshooting

### Service Won't Start

1. Check logs for specific error messages
2. Verify all required environment variables are set
3. Ensure MongoDB Atlas cluster is running
4. Check that connection string is correct

### Database Connection Issues

1. Verify MongoDB Atlas cluster is accessible
2. Check network access settings (IP whitelist)
3. Verify database user credentials
4. Test connection string locally first

### Performance Issues

1. Upgrade to a paid Render plan for better performance
2. Optimize MongoDB queries
3. Enable MongoDB Atlas indexes
4. Consider using connection pooling (already configured)

## Support

- Render Documentation: https://render.com/docs
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com
- Project Issues: https://github.com/NITHINKR06/cyberawareness/issues

## Security Best Practices

1. ✅ Never commit `.env` files to git
2. ✅ Use strong, randomly generated secrets
3. ✅ Regularly rotate API keys and secrets
4. ✅ Use MongoDB Atlas IP whitelisting (restrict to Render IPs if possible)
5. ✅ Enable MongoDB Atlas encryption at rest
6. ✅ Use HTTPS (Render provides this automatically)
7. ✅ Keep dependencies updated
8. ✅ Monitor logs for suspicious activity

