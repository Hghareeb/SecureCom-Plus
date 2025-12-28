"""
Application Configuration
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # Application
    APP_NAME: str = "SecureCom+"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key-change-in-production"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str = "sqlite:///./securecom.db"
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]  # Allow all origins in development
    
    # Security
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    
    # Encryption
    KDF_ALGORITHM: str = "argon2"
    ARGON2_TIME_COST: int = 2
    ARGON2_MEMORY_COST: int = 65536
    ARGON2_PARALLELISM: int = 4
    
    # File Upload
    MAX_FILE_SIZE: int = 10485760  # 10MB
    ALLOWED_EXTENSIONS: str = ".txt,.pdf,.png,.jpg,.jpeg"
    
    # QR Token
    QR_TOKEN_EXPIRY_HOURS: int = 24
    
    # Frontend URL (for QR codes)
    FRONTEND_URL: str = "https://securecom.netlify.app"
    
    # OpenAI API
    OPENAI_API_KEY: str = ""  # Set in environment
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
