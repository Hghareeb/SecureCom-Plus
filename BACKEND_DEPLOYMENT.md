# Backend Deployment Guide

## Deploy to Render (Recommended - Free Tier)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with your GitHub account

### Step 2: Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `Hghareeb/SecureCom-Plus`
3. Configure:
   - **Name**: `securecom-plus-api`
   - **Region**: Choose closest to you
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`

4. Add Environment Variables:
   - `PYTHON_VERSION` = `3.11.0`
   - `ENVIRONMENT` = `production`
   - `DEBUG` = `false`

5. Click "Create Web Service"
6. Wait 3-5 minutes for deployment
7. Copy your backend URL (e.g., `https://securecom-plus-api.onrender.com`)

### Step 3: Update Frontend
After backend is deployed, update frontend environment variable:

1. Go to Netlify dashboard
2. Site settings → Environment variables
3. Add: `VITE_API_URL` = `https://your-backend-url.onrender.com`
4. Redeploy frontend

---

## Alternative: Deploy to Railway

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub

### Step 2: Deploy
1. Click "New Project" → "Deploy from GitHub repo"
2. Select `Hghareeb/SecureCom-Plus`
3. Configure:
   - **Root Directory**: `/backend`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. Add Environment Variables:
   - `ENVIRONMENT` = `production`
   - `DEBUG` = `false`

5. Railway will auto-assign a domain
6. Copy the URL and update frontend

---

## After Deployment

Your backend will be live at:
- Render: `https://securecom-plus-api.onrender.com`
- Railway: `https://securecom-plus-api.railway.app`

Test it:
```bash
curl https://your-backend-url.onrender.com/api/health
```

Then update frontend and redeploy!
