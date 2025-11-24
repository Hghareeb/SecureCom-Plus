"""
SecureCom+ FastAPI Application
Multi-Feature User-Friendly Encryption Toolkit
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.api.routes import encryption, qr_token, health
from app.db.database import engine, Base

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("🚀 Starting SecureCom+ application...")
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables created")
    yield
    # Shutdown
    logger.info("👋 Shutting down SecureCom+ application...")


# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Multi-Feature User-Friendly Encryption Toolkit",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when allow_origins is ["*"]
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Include routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(encryption.router, prefix="/api/encryption", tags=["Encryption"])
app.include_router(qr_token.router, prefix="/api/qr", tags=["QR Tokens"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to SecureCom+ API",
        "docs": "/api/docs",
        "health": "/api/health"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
