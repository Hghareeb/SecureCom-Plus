# ⚡ Quick Reference Guide

Fast reference for common tasks and commands.

---

## 🚀 Quick Start (macOS/Linux)

```bash
# One-line start
./start.sh

# Or manually:
cd backend && source venv/bin/activate && python -m app.main &
cd frontend && npm run dev
```

## 🚀 Quick Start (Windows)

```batch
start.bat
```

---

## 🔧 Common Commands

### Backend

```bash
# Setup
cd backend
python3 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Run server
python -m app.main

# Run tests
pytest tests/ -v

# With coverage
pytest tests/ --cov=app --cov-report=html
```

### Frontend

```bash
# Setup
cd frontend
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

### Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild
docker-compose up -d --build
```

---

## 📡 API Endpoints

### Base URL
```
http://localhost:8000
```

### Health Check
```http
GET /api/health
```

### Encrypt Text
```http
POST /api/encryption/text/encrypt
Content-Type: application/json

{
  "plaintext": "Hello World",
  "password": "SecurePassword123",
  "use_emoji": false
}
```

### Decrypt Text
```http
POST /api/encryption/text/decrypt
Content-Type: application/json

{
  "password": "SecurePassword123",
  "ciphertext": "...",
  "salt": "...",
  "nonce": "...",
  "tag": "...",
  "kdf": "argon2"
}
```

### Create QR Token
```http
POST /api/qr/create
Content-Type: application/json

{
  "encrypted_message": { /* encrypted_data */ },
  "expiry_hours": 24
}
```

### View QR Token
```http
GET /api/qr/view/{token}
```

### Encrypt File
```http
POST /api/encryption/file/encrypt
Content-Type: multipart/form-data

file: [binary]
password: SecurePassword123
```

---

## 🧪 Testing

```bash
# Run all backend tests
cd backend
pytest tests/ -v

# Run specific test file
pytest tests/test_encryption.py -v

# Run with coverage
pytest tests/ --cov=app

# Run specific test
pytest tests/test_api.py::TestHealthEndpoint::test_health_check -v
```

---

## 🐛 Common Issues & Fixes

### Port Already in Use

```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Module Not Found

```bash
# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Database Issues

```bash
# Reset SQLite database
cd backend
rm securecom.db
python -m app.main  # Will recreate tables
```

### CORS Errors

Check `backend/.env`:
```env
CORS_ORIGINS=["http://localhost:5173"]
```

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Required
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./securecom.db

# Optional
ENVIRONMENT=development
DEBUG=True
KDF_ALGORITHM=argon2
QR_TOKEN_EXPIRY_HOURS=24
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
```

---

## 📦 File Locations

```
Backend code:     backend/app/
Frontend code:    frontend/src/
Tests:            backend/tests/
Database:         backend/securecom.db
Logs:             Check terminal output
```

---

## 🎯 Common Use Cases

### Encrypt a Message

1. Go to http://localhost:5173/encrypt
2. Enter message and password
3. Click "Encrypt Message"
4. Copy encrypted data or emoji ciphertext

### Decrypt a Message

1. Go to http://localhost:5173/decrypt
2. Choose JSON or Emoji format
3. Paste encrypted data
4. Enter password
5. Click "Decrypt Message"

### Create QR Token

1. Encrypt a message first
2. Click "Generate QR Token"
3. Share QR code or URL
4. ⚠️ Can only be viewed once!

### Encrypt a File

1. Go to http://localhost:5173/encrypt
2. Switch to "File" tab
3. Select file (TXT, PDF, PNG, JPG)
4. Enter password
5. Click "Encrypt File"
6. Download encrypted JSON

---

## 📚 Documentation Links

- **Full Setup**: See `SETUP.md`
- **Deployment**: See `DEPLOYMENT.md`
- **Project Structure**: See `PROJECT_STRUCTURE.md`
- **API Docs**: http://localhost:8000/api/docs (when running)

---

## 🔑 Password Recommendations

- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Avoid common words
- Use password manager
- Check strength indicator in app

---

## 🧮 Encryption Details

- **Algorithm**: AES-256-GCM
- **Key Size**: 256 bits
- **KDF**: Argon2id (default) or PBKDF2
- **Memory Cost**: 64MB
- **Time Cost**: 2 iterations
- **Mode**: Galois/Counter Mode (authenticated)

---

## 💡 Tips & Tricks

### Development

```bash
# Watch backend changes
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Check API docs
open http://localhost:8000/api/docs

# Test API with curl
curl -X POST http://localhost:8000/api/encryption/text/encrypt \
  -H "Content-Type: application/json" \
  -d '{"plaintext":"test","password":"pass","use_emoji":false}'
```

### Production

```bash
# Run with Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker

# Build frontend
cd frontend
npm run build
# Deploy dist/ folder
```

---

## 📞 Quick Help

**Issue**: Can't start backend
- Check Python version: `python3 --version` (need 3.10+)
- Activate venv: `source venv/bin/activate`
- Install deps: `pip install -r requirements.txt`

**Issue**: Can't start frontend
- Check Node version: `node --version` (need 18+)
- Install deps: `npm install`
- Clear cache: `rm -rf node_modules && npm install`

**Issue**: Encryption fails
- Check password is entered
- Verify API is running on port 8000
- Check browser console for errors

**Issue**: QR token expired
- Tokens expire after 24 hours by default
- Create new token
- Can only be viewed once

---

## 🎓 Learning Resources

- **AES-GCM**: https://en.wikipedia.org/wiki/Galois/Counter_Mode
- **Argon2**: https://github.com/P-H-C/phc-winner-argon2
- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/

---

**Keep this file handy for quick reference! 📌**
