"""
Pydantic schemas for QR token endpoints
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict


class CreateQRTokenRequest(BaseModel):
    """Request schema for creating QR token"""
    encrypted_message: Dict[str, str] = Field(..., description="Encrypted message data")
    expiry_hours: int = Field(default=24, ge=1, le=168, description="Token expiry in hours (1-168)")


class CreateQRTokenResponse(BaseModel):
    """Response schema for QR token creation"""
    success: bool = True
    token: str
    url: str
    qr_image: str  # base64 encoded PNG
    expires_at: datetime


class ViewQRTokenResponse(BaseModel):
    """Response schema for viewing QR token"""
    success: bool = True
    encrypted_message: Dict[str, str]
    viewed_at: datetime


class QRTokenStatus(BaseModel):
    """QR token status schema"""
    token: str
    valid: bool
    viewed: bool
    created_at: datetime
    expires_at: datetime
    viewed_at: datetime = None
