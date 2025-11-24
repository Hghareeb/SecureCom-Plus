"""
Database Models
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from datetime import datetime, timedelta
import secrets

from app.db.database import Base
from app.core.config import settings


class QRToken(Base):
    """QR Token model for single-use secure message viewing"""
    
    __tablename__ = "qr_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(64), unique=True, nullable=False, index=True)
    encrypted_message = Column(Text, nullable=False)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    viewed = Column(Boolean, default=False, nullable=False)
    viewed_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=False)
    
    @staticmethod
    def generate_token() -> str:
        """Generate a secure random token"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def calculate_expiry(hours: int = None) -> datetime:
        """Calculate expiry datetime"""
        hours = hours or settings.QR_TOKEN_EXPIRY_HOURS
        return datetime.utcnow() + timedelta(hours=hours)
    
    def mark_as_viewed(self) -> None:
        """Mark token as viewed (single-use)"""
        self.viewed = True
        self.viewed_at = datetime.utcnow()
    
    def is_valid(self) -> bool:
        """Check if token is still valid"""
        if self.viewed:
            return False
        if datetime.utcnow() > self.expires_at:
            return False
        return True
    
    def __repr__(self):
        return f"<QRToken {self.token[:8]}... viewed={self.viewed}>"
