# 🔐 SecureCom+: Multi-Feature User-Friendly Encryption Toolkit

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-Educational-blue.svg)

## 📖 Overview

SecureCom+ is a **proof-of-concept encryption toolkit** that demonstrates how secure communication can be both **usable** and **accessible**. Built with modern web technologies, it combines military-grade encryption with an intuitive user interface.

### 🎯 Key Features

- **🔒 AES-256-GCM Encryption** - Military-grade authenticated encryption
- **🔑 Argon2 Key Derivation** - State-of-the-art password-based KDF (winner of Password Hashing Competition)
- **😀 Emoji Encoding** - Visual ciphertext representation for easy sharing
- **📁 File Encryption** - Secure TXT, PDF, PNG, and JPG files
- **📱 QR Token System** - Single-use QR codes for secure message sharing
- **💪 Password Strength Analyzer** - Real-time feedback using zxcvbn algorithm
- **🌐 Modern Web Stack** - FastAPI backend + React TypeScript frontend

---

## 🧰 Technology Stack

### Backend
- **Python FastAPI** - Modern, fast, async web framework
- **PyCryptodome** - Cryptographic library for AES-256-GCM
- **Argon2-cffi** - Password hashing and key derivation
- **SQLAlchemy** - Database ORM
- **PostgreSQL/SQLite** - Database options

### Frontend
- **React + TypeScript** - Type-safe UI development
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **zxcvbn** - Password strength estimation
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **npm/yarn**

### Installation

#### 1️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Run the server
python -m app.main
```

Backend will run on `http://localhost:8000`

#### 2️⃣ Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
echo "VITE_API_URL=http://localhost:8000" > .env

# Run development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 🎉 Access the Application

Open your browser and navigate to:
- **Frontend UI**: http://localhost:5173
- **API Documentation**: http://localhost:8000/api/docs
- **API Health**: http://localhost:8000/api/health

---

## 📚 API Documentation

### Text Encryption

**POST** `/api/encryption/text/encrypt`

```json
{
  "plaintext": "Hello, SecureCom+!",
  "password": "MyStrongPassword123",
  "use_emoji": false
}
```

**Response:**
```json
{
  "success": true,
  "encrypted_data": {
    "ciphertext": "base64_encoded_ciphertext",
    "salt": "base64_encoded_salt",
    "nonce": "base64_encoded_nonce",
    "tag": "base64_encoded_tag",
    "kdf": "argon2"
  }
}
```

### Text Decryption

**POST** `/api/encryption/text/decrypt`

```json
{
  "password": "MyStrongPassword123",
  "ciphertext": "...",
  "salt": "...",
  "nonce": "...",
  "tag": "...",
  "kdf": "argon2"
}
```

### QR Token Creation

**POST** `/api/qr/create`

```json
{
  "encrypted_message": { /* encrypted_data object */ },
  "expiry_hours": 24
}
```

For full API documentation, visit: http://localhost:8000/api/docs

---

## 🔒 Security Features

### Encryption Algorithm
- **AES-256-GCM**: Authenticated encryption with associated data (AEAD)
- **Key Size**: 256 bits
- **Mode**: Galois/Counter Mode (provides both confidentiality and authenticity)

### Key Derivation
- **Algorithm**: Argon2id (default) or PBKDF2
- **Memory Cost**: 64MB
- **Time Cost**: 2 iterations
- **Parallelism**: 4 threads

### Password Strength
- **zxcvbn Algorithm**: Realistic password strength estimation
- **Feedback**: Real-time suggestions for stronger passwords
- **Crack Time Estimates**: Based on modern hardware capabilities

---

## 📅 Project Context

- **Client**: FutureGate Bank (Virtual)
- **Institution**: Bahrain Polytechnic – ICT Department
- **Project Manager**: Hasan A. Ghareeb
- **Advisor**: Abdulla Alsenan
- **Duration**: October – December 2025
- **Deadline**: December 27, 2025

---

## 🎓 Educational Purpose

This project is **for educational use only** and serves as a demonstration of:

✅ Modern encryption standards (AES-256-GCM)  
✅ Secure password-based key derivation (Argon2)  
✅ Full-stack web application development  
✅ RESTful API design  
✅ Type-safe frontend development  
✅ Security best practices  

---

## ⚖️ Legal & Compliance

- **Bahrain PDPL (2018)**: Personal Data Protection Law compliance
- **Bahrain Polytechnic ICT Policy**: Adheres to institutional guidelines
- **No Data Storage**: All encryption performed locally, no persistent user data
- **Educational License**: Not for production use

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v --cov=app
```

### Frontend Tests

```bash
cd frontend
npm run test
```

---

## 📦 Deployment

### Backend (Production)

```bash
# Install production dependencies
pip install -r requirements.txt

# Run with Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend (Production)

```bash
# Build for production
npm run build

# Preview build
npm run preview
```

### Docker (Coming Soon)

```bash
docker-compose up -d
```

---

## 🤝 Contributing

This is an educational project. For suggestions or improvements:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📧 Contact

**Hasan A. Ghareeb**  
Bahrain Polytechnic - ICT Department  
Email: [contact information]

---

## 📄 License

This project is for **educational purposes only**. All rights reserved.

---

## 🙏 Acknowledgments

- **Bahrain Polytechnic** - Academic support
- **Abdulla Alsenan** - Project advisor
- **FastAPI Community** - Excellent framework
- **React Community** - Modern frontend tools

---

**Built with ❤️ for secure communication education**
