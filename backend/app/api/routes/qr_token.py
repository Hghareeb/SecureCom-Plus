"""
QR Token API Routes
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
import json
import qrcode
import io
import base64
from datetime import datetime

from app.db.database import get_db
from app.db.models import QRToken
from app.schemas.qr_token import (
    CreateQRTokenRequest, CreateQRTokenResponse,
    ViewQRTokenResponse, QRTokenStatus
)
from app.core.config import settings

router = APIRouter()


@router.post("/create", response_model=CreateQRTokenResponse)
async def create_qr_token(
    request: CreateQRTokenRequest,
    http_request: Request,
    db: Session = Depends(get_db)
):
    """
    Create a single-use QR token for secure message sharing
    
    - **encrypted_message**: Encrypted message data (dict)
    - **expiry_hours**: Token expiry in hours (1-168)
    """
    try:
        # Generate token
        token = QRToken.generate_token()
        expires_at = QRToken.calculate_expiry(request.expiry_hours)
        
        # Create QR token record
        qr_token = QRToken(
            token=token,
            encrypted_message=json.dumps(request.encrypted_message),
            expires_at=expires_at
        )
        
        db.add(qr_token)
        db.commit()
        db.refresh(qr_token)
        
        # Generate QR code URL - point to frontend, not API
        # Frontend will handle the nice UI for decryption
        qr_url = f"{settings.FRONTEND_URL}/qr/{token}"
        
        # Generate QR code image
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_url)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        img_io = io.BytesIO()
        img.save(img_io, 'PNG')
        img_io.seek(0)
        
        qr_image_b64 = base64.b64encode(img_io.getvalue()).decode('utf-8')
        
        return {
            "success": True,
            "token": token,
            "url": qr_url,
            "qr_image": qr_image_b64,
            "expires_at": expires_at
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"QR token creation failed: {str(e)}")


@router.get("/view/{token}", response_model=ViewQRTokenResponse)
async def view_qr_token(token: str, db: Session = Depends(get_db)):
    """
    View QR token content (single-use only)
    
    - **token**: QR token string
    """
    # Find token
    qr_token = db.query(QRToken).filter(QRToken.token == token).first()
    
    if not qr_token:
        raise HTTPException(status_code=404, detail="Token not found")
    
    # Check if valid
    if not qr_token.is_valid():
        reason = "already viewed" if qr_token.viewed else "expired"
        raise HTTPException(status_code=403, detail=f"Token {reason}")
    
    # Mark as viewed (single-use)
    encrypted_message = json.loads(qr_token.encrypted_message)
    qr_token.mark_as_viewed()
    db.commit()
    
    return {
        "success": True,
        "encrypted_message": encrypted_message,
        "viewed_at": qr_token.viewed_at
    }


@router.get("/status/{token}")
async def get_qr_token_status(token: str, db: Session = Depends(get_db)):
    """
    Get QR token status and encrypted message without marking as viewed
    This allows the UI to load without consuming the one-time token
    
    - **token**: QR token string
    """
    qr_token = db.query(QRToken).filter(QRToken.token == token).first()
    
    if not qr_token:
        raise HTTPException(status_code=404, detail="Token not found")
    
    # Check if valid
    if not qr_token.is_valid():
        reason = "already viewed" if qr_token.viewed else "expired"
        raise HTTPException(status_code=403, detail=f"Token {reason}")
    
    # Return encrypted message WITHOUT marking as viewed yet
    encrypted_message = json.loads(qr_token.encrypted_message)
    
    return {
        "success": True,
        "encrypted_message": encrypted_message,
        "token": token,
        "valid": qr_token.is_valid(),
        "viewed": qr_token.viewed,
        "created_at": qr_token.created_at,
        "expires_at": qr_token.expires_at,
        "viewed_at": qr_token.viewed_at
    }


@router.delete("/{token}")
async def delete_qr_token(token: str, db: Session = Depends(get_db)):
    """
    Delete a QR token (admin operation)
    
    - **token**: QR token string
    """
    qr_token = db.query(QRToken).filter(QRToken.token == token).first()
    
    if not qr_token:
        raise HTTPException(status_code=404, detail="Token not found")
    
    db.delete(qr_token)
    db.commit()
    
    return {"success": True, "message": "Token deleted"}
