# 🛠️ SecureCom+ Setup Guide

Complete setup instructions for SecureCom+ encryption toolkit.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- ✅ **Python 3.10+** ([Download](https://www.python.org/downloads/))
- ✅ **Node.js 18+** ([Download](https://nodejs.org/))
- ✅ **npm or yarn** (comes with Node.js)
- ✅ **Git** ([Download](https://git-scm.com/))

Optional:
- 🐳 **Docker & Docker Compose** (for containerized deployment)

---

## 🚀 Option 1: Local Development Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd SecureCom-Plus
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# For macOS/Linux:
source venv/bin/activate
# For Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env file with your configuration (optional)
# nano .env  # or use any text editor

# Run database migrations (if needed)
# alembic upgrade head

# Start the backend server
python -m app.main
```

✅ Backend should now be running on **http://localhost:8000**

Test it: http://localhost:8000/api/health

### Step 3: Frontend Setup

Open a **new terminal** window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

✅ Frontend should now be running on **http://localhost:5173**

---

## 🐳 Option 2: Docker Setup (Recommended for Production)

### Step 1: Install Docker

Download and install Docker Desktop:
- **macOS**: https://docs.docker.com/desktop/install/mac-install/
- **Windows**: https://docs.docker.com/desktop/install/windows-install/
- **Linux**: https://docs.docker.com/engine/install/

### Step 2: Run with Docker Compose

```bash
# Clone repository
git clone <repository-url>
cd SecureCom-Plus

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **PostgreSQL**: localhost:5432

---

## ✅ Verify Installation

### 1. Test Backend API

```bash
# Health check
curl http://localhost:8000/api/health

# Expected response:
# {"status":"healthy","app_name":"SecureCom+","environment":"development",...}
```

### 2. Test Frontend

Open browser and navigate to:
- http://localhost:5173

You should see the SecureCom+ homepage.

### 3. Test Encryption

1. Click "Start Encrypting"
2. Enter a message and password
3. Click "Encrypt Message"
4. Copy the encrypted data
5. Go to "Decrypt" page
6. Paste data and password
7. Click "Decrypt Message"

---

## 🧪 Running Tests

### Backend Tests

```bash
cd backend
source venv/bin/activate  # Activate virtual environment
pytest tests/ -v --cov=app
```

### Frontend Tests (if configured)

```bash
cd frontend
npm run test
```

---

## 🔧 Configuration

### Backend Configuration (.env)

```env
# Application
APP_NAME=SecureCom+
ENVIRONMENT=development
DEBUG=True
SECRET_KEY=your-secret-key-here

# Server
HOST=0.0.0.0
PORT=8000

# Database
DATABASE_URL=sqlite:///./securecom.db
# For PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost/securecom

# CORS
CORS_ORIGINS=["http://localhost:5173"]

# Encryption
KDF_ALGORITHM=argon2
ARGON2_TIME_COST=2
ARGON2_MEMORY_COST=65536
ARGON2_PARALLELISM=4

# QR Token
QR_TOKEN_EXPIRY_HOURS=24
```

### Frontend Configuration (.env)

```env
VITE_API_URL=http://localhost:8000
```

---

## 🐛 Troubleshooting

### Backend won't start

**Problem**: `ModuleNotFoundError: No module named 'app'`

**Solution**: Make sure you're in the backend directory and virtual environment is activated.

```bash
cd backend
source venv/bin/activate
python -m app.main
```

---

**Problem**: Database connection error

**Solution**: Check DATABASE_URL in .env file. For SQLite (default), no configuration needed. For PostgreSQL, ensure the database is running.

---

### Frontend won't start

**Problem**: `Cannot find module 'vite'`

**Solution**: Install dependencies

```bash
cd frontend
rm -rf node_modules
npm install
```

---

**Problem**: API calls failing (CORS error)

**Solution**: Check that backend is running and CORS_ORIGINS in backend/.env includes frontend URL

```env
CORS_ORIGINS=["http://localhost:5173"]
```

---

### Port already in use

**Problem**: Port 8000 or 5173 already in use

**Solution**: Kill the process or change port

```bash
# Find process using port 8000
lsof -ti:8000 | xargs kill -9

# Or change port in configuration
# Backend: Edit PORT in .env
# Frontend: npm run dev -- --port 3000
```

---

## 📚 Additional Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **React Documentation**: https://react.dev/
- **Vite Documentation**: https://vitejs.dev/
- **TailwindCSS**: https://tailwindcss.com/

---

## 🆘 Need Help?

If you encounter issues:

1. Check the logs:
   - Backend: Terminal running `python -m app.main`
   - Frontend: Terminal running `npm run dev`

2. Verify all prerequisites are installed

3. Ensure ports 8000 and 5173 are available

4. Check environment variables are set correctly

---

**Happy Encrypting! 🔐**
