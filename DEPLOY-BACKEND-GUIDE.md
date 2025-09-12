# Backend Deployment Guide for Render.com

## Quick Deployment Steps:

### 1. Push Code to GitHub

First, create a GitHub repository:
1. Go to https://github.com/new
2. Name it: `sih-disaster-app`
3. Make it public
4. Don't initialize with README (we already have files)
5. Click "Create repository"

Then push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/sih-disaster-app.git
git branch -M main
git push -u origin main
```

### 2. Deploy Backend on Render.com

1. Go to https://render.com and sign up/login with GitHub
2. Click "New +" → "Web Service"
3. Connect your GitHub account if not already connected
4. Select your `sih-disaster-app` repository
5. Fill in the following settings:

   **Basic Settings:**
   - Name: `sih-disaster-backend`
   - Region: Oregon (US West)
   - Branch: main
   - Root Directory: `backend`
   - Runtime: Node

   **Build & Deploy:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

   **Environment Variables (Click "Advanced" → "Add Environment Variable"):**
   ```
   NODE_ENV = production
   PORT = 10000
   JWT_SECRET = (click "Generate" for a random value)
   CORS_ORIGIN = https://frontend-hgq0wsbob-omkars-projects-9693e6b0.vercel.app
   MONGODB_URI = (see MongoDB Atlas setup below)
   ```

6. Click "Create Web Service"

### 3. Set up MongoDB Atlas (Free Database)

1. Go to https://www.mongodb.com/atlas
2. Sign up for free account
3. Create a new cluster (choose free tier)
4. In "Security" → "Database Access": Create a database user
5. In "Security" → "Network Access": Add IP Address → Allow from anywhere (0.0.0.0/0)
6. In "Deployment" → "Database": Click "Connect" → "Connect your application"
7. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/myFirstDatabase`)
8. Replace `<password>` with your actual password and `myFirstDatabase` with `disaster-app`
9. Go back to Render.com and add this as the `MONGODB_URI` environment variable

### 4. Wait for Deployment

- Render will take 5-10 minutes to build and deploy
- Once complete, you'll get a URL like: `https://sih-disaster-backend.onrender.com`
- Test it by visiting: `https://sih-disaster-backend.onrender.com/api/health`

### 5. Update Frontend

The frontend is already configured to use the backend URL from the `.env.production` file.

## Alternative Free Hosting Options:

### Option A: Cyclic.sh (Simpler than Render)
1. Go to https://cyclic.sh
2. Sign in with GitHub
3. Select your repository
4. It auto-deploys!

### Option B: Railway.app
1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Add environment variables
6. Deploy!

### Option C: Fly.io
1. Install flyctl: https://fly.io/docs/hands-on/install-flyctl/
2. Run: `fly launch` in backend directory
3. Follow prompts
4. Run: `fly deploy`

## Troubleshooting:

### If CORS errors occur:
- Make sure the `CORS_ORIGIN` environment variable matches your frontend URL exactly
- The backend is configured to accept the Vercel frontend URL

### If database connection fails:
- Check MongoDB Atlas network access settings
- Verify the connection string is correct
- Make sure the database user has read/write permissions

### If build fails on Render:
- Check the build logs for specific errors
- Ensure all dependencies are in package.json
- Try building locally first with `npm run build`

## Testing the Deployment:

Once deployed, test these endpoints:
- Health check: `https://YOUR-BACKEND-URL/api/health`
- Modules: `https://YOUR-BACKEND-URL/api/modules`

## Support:

If you need help:
- Render.com docs: https://render.com/docs
- MongoDB Atlas docs: https://docs.atlas.mongodb.com/
- Check the logs in your Render dashboard for errors
