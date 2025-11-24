"""
Health Check Routes
"""

from fastapi import APIRouter
from datetime import datetime

from app.core.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint
    
    Returns application status and configuration info
    """
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat(),
        "kdf_algorithm": settings.KDF_ALGORITHM,
        "version": "1.0.0"
    }


@router.get("/ping")
async def ping():
    """Simple ping endpoint"""
    return {"message": "pong"}
