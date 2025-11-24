# 🚀 Deploy Your Full App - 5 Minutes

## Your app is 50% deployed!
✅ Frontend: https://securecom-plus.netlify.app (LIVE)  
❌ Backend: Not deployed yet

## Deploy Backend NOW (2 options)

### OPTION A: Render (Recommended - 100% Free)

1. Go to: https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect to GitHub: `Hghareeb/SecureCom-Plus`
4. Settings:
   - **Name**: `securecom-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
5. Click "Create Web Service"
6. Wait 5 minutes, copy your URL (e.g., `https://securecom-backend.onrender.com`)

### OPTION B: Railway (Also Free)

1. Go to: https://railway.app/new
2. "Deploy from GitHub repo"
3. Select `Hghareeb/SecureCom-Plus`
4. Add these settings:
   - **Root Directory**: `/backend`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Deploy - Railway gives you a URL automatically

---

## After Backend is Deployed

### Update Frontend (I'll do this for you)
Once you have the backend URL, tell me and I'll:
1. Update frontend to use your backend URL
2. Redeploy frontend
3. Everything works! 🎉

---

## OR: Deploy Both Locally with Docker

If you want to test locally first:
```bash
docker-compose up
```
Then visit:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
