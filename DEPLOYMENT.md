# 🚀 Deployment Guide

Production deployment instructions for SecureCom+.

---

## 📋 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database setup complete
- [ ] HTTPS certificates obtained
- [ ] CORS origins configured
- [ ] Security review completed

---

## 🌐 Deployment Options

### Option 1: Render (Recommended for Demo)

#### Backend Deployment

1. **Create a new Web Service** on Render
   - Repository: Your GitHub repo
   - Root Directory: `backend`
   - Environment: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

2. **Environment Variables**
   ```
   ENVIRONMENT=production
   DEBUG=False
   SECRET_KEY=<generate-strong-key>
   DATABASE_URL=<render-postgres-url>
   CORS_ORIGINS=["https://your-frontend-url.onrender.com"]
   ```

3. **Add PostgreSQL Database**
   - Create PostgreSQL instance
   - Copy connection string to DATABASE_URL

#### Frontend Deployment

1. **Create a new Static Site** on Render
   - Repository: Your GitHub repo
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

---

### Option 2: Vercel + Railway

#### Backend on Railway

1. Create Railway project
2. Add PostgreSQL database
3. Deploy backend service
4. Configure environment variables

#### Frontend on Vercel

1. Import project from GitHub
2. Framework Preset: Vite
3. Root Directory: `frontend`
4. Environment Variables:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```

---

### Option 3: DigitalOcean

#### Droplet Setup

```bash
# SSH into droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Python
apt install python3.11 python3.11-venv python3-pip -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install nodejs -y

# Install Nginx
apt install nginx -y

# Install PostgreSQL
apt install postgresql postgresql-contrib -y
```

#### Backend Setup

```bash
# Clone repository
git clone <your-repo>
cd SecureCom-Plus/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure systemd service
sudo nano /etc/systemd/system/securecom.service
```

**securecom.service:**
```ini
[Unit]
Description=SecureCom+ Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/SecureCom-Plus/backend
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000

[Install]
WantedBy=multi-user.target
```

```bash
# Start service
sudo systemctl start securecom
sudo systemctl enable securecom
```

#### Frontend Setup

```bash
cd ../frontend
npm install
npm run build

# Move build to Nginx
sudo cp -r dist/* /var/www/html/
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### Option 4: Docker on VPS

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Clone repository
git clone <your-repo>
cd SecureCom-Plus

# Create production .env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit environment variables
nano backend/.env
nano frontend/.env

# Start with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔒 HTTPS Configuration

### Option A: Let's Encrypt (Recommended)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Obtain certificate
certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
certbot renew --dry-run
```

### Option B: Cloudflare SSL

1. Add your domain to Cloudflare
2. Update nameservers
3. Enable "Full (strict)" SSL mode
4. Origin certificates optional

---

## 🗄️ Database Migration

### PostgreSQL Setup

```bash
# Access PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE securecom;
CREATE USER securecom_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE securecom TO securecom_user;
\q
```

### Run Migrations (if using Alembic)

```bash
cd backend
source venv/bin/activate
alembic upgrade head
```

---

## 📊 Monitoring

### Application Logs

```bash
# Backend logs (systemd)
sudo journalctl -u securecom -f

# Docker logs
docker-compose logs -f backend
```

### Performance Monitoring

Consider integrating:
- **Sentry** - Error tracking
- **New Relic** - APM
- **Prometheus + Grafana** - Metrics

---

## 🔐 Security Hardening

### 1. Environment Variables

```bash
# Generate strong SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2. Database Security

- Use strong passwords
- Enable SSL connections
- Restrict network access
- Regular backups

### 3. API Security

- Rate limiting (e.g., slowapi)
- Request validation
- CORS configuration
- HTTPS only

### 4. Firewall Rules

```bash
# UFW firewall
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 📈 Performance Optimization

### Backend

1. **Use Gunicorn with Uvicorn workers**
   ```bash
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. **Enable caching**
3. **Database connection pooling**
4. **Async database queries**

### Frontend

1. **Build optimization**
   ```bash
   npm run build
   ```

2. **CDN for static assets**
3. **Code splitting**
4. **Image optimization**

---

## 🧪 Pre-Production Testing

```bash
# Run all tests
cd backend
pytest tests/ -v

# Load testing
ab -n 1000 -c 10 http://your-api/api/health
```

---

## 📝 Post-Deployment

- [ ] Verify all endpoints working
- [ ] Test encryption/decryption
- [ ] Test QR token generation
- [ ] Monitor logs for errors
- [ ] Set up backup schedule
- [ ] Configure monitoring alerts

---

## 🆘 Rollback Plan

### Docker

```bash
# Rollback to previous image
docker-compose down
docker-compose up -d --force-recreate
```

### Git-based

```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

---

## 📞 Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test database connectivity
4. Review CORS settings

---

**Deployment Checklist Complete ✅**
