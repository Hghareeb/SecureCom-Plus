# 📂 Project Structure

Complete directory structure of SecureCom+ encryption toolkit.

```
SecureCom-Plus/
│
├── 📄 README.md                    # Project overview and documentation
├── 📄 SETUP.md                     # Setup instructions
├── 📄 DEPLOYMENT.md                # Deployment guide
├── 📄 PROJECT_STRUCTURE.md         # This file
├── 📄 .gitignore                   # Git ignore rules
├── 📄 docker-compose.yml           # Docker orchestration
├── 🔧 start.sh                     # Quick start script (macOS/Linux)
├── 🔧 start.bat                    # Quick start script (Windows)
│
├── 🐍 backend/                     # Python FastAPI Backend
│   ├── 📄 requirements.txt         # Python dependencies
│   ├── 📄 Dockerfile               # Docker configuration
│   ├── 📄 .env.example             # Environment variables template
│   │
│   ├── app/                        # Main application package
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application entry point
│   │   │
│   │   ├── core/                   # Core business logic
│   │   │   ├── __init__.py
│   │   │   ├── config.py           # Application configuration
│   │   │   ├── encryption.py       # AES-256-GCM encryption engine
│   │   │   └── emoji_encoder.py    # Emoji encoding/decoding
│   │   │
│   │   ├── db/                     # Database layer
│   │   │   ├── __init__.py
│   │   │   ├── database.py         # SQLAlchemy setup
│   │   │   └── models.py           # Database models (QRToken)
│   │   │
│   │   ├── schemas/                # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── encryption.py       # Encryption request/response models
│   │   │   └── qr_token.py         # QR token models
│   │   │
│   │   └── api/                    # API routes
│   │       ├── __init__.py
│   │       └── routes/
│   │           ├── __init__.py
│   │           ├── health.py       # Health check endpoints
│   │           ├── encryption.py   # Encryption endpoints
│   │           └── qr_token.py     # QR token endpoints
│   │
│   └── tests/                      # Test suite
│       ├── __init__.py
│       ├── conftest.py             # Pytest fixtures
│       ├── test_encryption.py      # Encryption tests
│       ├── test_emoji_encoder.py   # Emoji encoder tests
│       └── test_api.py             # API endpoint tests
│
├── ⚛️  frontend/                   # React TypeScript Frontend
│   ├── 📄 package.json             # Node.js dependencies
│   ├── 📄 vite.config.ts           # Vite configuration
│   ├── 📄 tsconfig.json            # TypeScript configuration
│   ├── 📄 tailwind.config.js       # TailwindCSS configuration
│   ├── 📄 postcss.config.js        # PostCSS configuration
│   ├── 📄 Dockerfile               # Docker configuration
│   ├── 📄 .env.example             # Environment variables template
│   ├── 📄 index.html               # HTML entry point
│   │
│   ├── public/                     # Static assets
│   │   └── vite.svg
│   │
│   └── src/                        # Source code
│       ├── main.tsx                # React entry point
│       ├── App.tsx                 # Root component
│       ├── index.css               # Global styles
│       │
│       ├── components/             # Reusable components
│       │   ├── Layout.tsx          # Main layout wrapper
│       │   └── PasswordStrengthIndicator.tsx
│       │
│       ├── pages/                  # Page components
│       │   ├── Home.tsx            # Landing page
│       │   ├── Encrypt.tsx         # Encryption page
│       │   ├── Decrypt.tsx         # Decryption page
│       │   └── QRView.tsx          # QR token view page
│       │
│       └── lib/                    # Utilities and services
│           ├── api.ts              # API client and types
│           └── utils.ts            # Helper functions
│
└── 📊 Database/
    └── securecom.db                # SQLite database (gitignored)
```

---

## 📦 Key Files Explained

### Backend

| File | Purpose |
|------|---------|
| `app/main.py` | FastAPI application initialization, routes, middleware |
| `app/core/encryption.py` | AES-256-GCM encryption engine with Argon2 KDF |
| `app/core/emoji_encoder.py` | Convert base64 ciphertext to emoji sequences |
| `app/core/config.py` | Environment-based configuration management |
| `app/db/models.py` | SQLAlchemy models (QRToken for single-use tokens) |
| `app/schemas/*.py` | Pydantic models for request/response validation |
| `app/api/routes/*.py` | API endpoint handlers |
| `tests/*.py` | Comprehensive test suite using pytest |

### Frontend

| File | Purpose |
|------|---------|
| `src/App.tsx` | Root component with routing |
| `src/components/Layout.tsx` | Header, footer, navigation wrapper |
| `src/pages/Home.tsx` | Landing page with features overview |
| `src/pages/Encrypt.tsx` | Text/file encryption interface |
| `src/pages/Decrypt.tsx` | Decryption interface |
| `src/pages/QRView.tsx` | Single-use QR token viewer |
| `src/lib/api.ts` | Axios API client with TypeScript types |
| `src/lib/utils.ts` | Password strength checker, utilities |

### Configuration

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Multi-container orchestration |
| `.gitignore` | Exclude sensitive/build files from git |
| `start.sh` / `start.bat` | Quick start scripts for dev environment |

---

## 🔄 Data Flow

### Encryption Flow

```
User Input (Frontend)
    ↓
API Request → /api/encryption/text/encrypt
    ↓
EncryptionEngine.encrypt()
    ↓ (Argon2 KDF)
AES-256-GCM Encryption
    ↓
Base64 Encoding
    ↓ (Optional)
Emoji Encoding
    ↓
JSON Response → Frontend Display
```

### QR Token Flow

```
Encrypted Data
    ↓
API Request → /api/qr/create
    ↓
Generate Unique Token
    ↓
Store in Database (viewed=False)
    ↓
Generate QR Code Image
    ↓
Return QR + URL
    ↓
User Scans QR → /qr/{token}
    ↓
Check if viewed=False & not expired
    ↓
Mark as viewed=True (Single-use!)
    ↓
Return encrypted message
```

---

## 🧩 Technology Stack Breakdown

### Backend Stack
- **FastAPI**: Modern Python web framework (async, auto-docs)
- **Pydantic**: Data validation using Python type hints
- **SQLAlchemy**: SQL toolkit and ORM
- **PyCryptodome**: AES-256-GCM implementation
- **Argon2-cffi**: Password hashing and KDF
- **qrcode**: QR code generation
- **pytest**: Testing framework

### Frontend Stack
- **React 18**: UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **zxcvbn**: Password strength estimation
- **Axios**: Promise-based HTTP client
- **React Router**: Client-side routing
- **Lucide React**: Icon library

---

## 📊 Database Schema

### QRToken Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | Integer | Primary key |
| `token` | String(64) | Unique token (URL-safe) |
| `encrypted_message` | Text | JSON-encoded encrypted data |
| `created_at` | DateTime | Token creation timestamp |
| `viewed` | Boolean | Whether token was viewed |
| `viewed_at` | DateTime | When token was viewed |
| `expires_at` | DateTime | Token expiration time |

**Indexes:**
- `token` (unique, indexed for fast lookups)

---

## 🔐 Security Architecture

### Encryption Layer
1. **User Input** → Password + Plaintext
2. **Key Derivation** → Argon2id (64MB memory, 2 iterations)
3. **Encryption** → AES-256-GCM (authenticated encryption)
4. **Output** → Ciphertext + Salt + Nonce + Tag

### API Security
- CORS configuration for allowed origins
- Request validation via Pydantic schemas
- HTTPS in production
- Rate limiting (recommended addition)

### Token Security
- Single-use QR tokens
- Time-based expiration
- Cryptographically secure token generation
- No password stored, only encrypted message

---

## 📈 Scalability Considerations

### Current Architecture
- SQLite for development
- PostgreSQL for production
- Stateless API (horizontally scalable)
- Frontend served as static files (CDN-ready)

### Potential Improvements
- Redis for session/cache management
- Message queue for async tasks
- Load balancer for multiple API instances
- CDN for static assets

---

## 🧪 Testing Strategy

### Backend Tests
- Unit tests for encryption engine
- Unit tests for emoji encoder
- Integration tests for API endpoints
- Database model tests

### Frontend Tests (Future)
- Component tests with React Testing Library
- E2E tests with Playwright
- Accessibility tests

---

**Total Files:** ~50+
**Lines of Code:** ~5,000+
**Languages:** Python, TypeScript, CSS, HTML
