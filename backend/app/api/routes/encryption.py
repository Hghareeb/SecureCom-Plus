"""
Encryption API Routes
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
import base64
import mimetypes

from app.core.encryption import encryption_engine
from app.core.emoji_encoder import emoji_encoder
from app.core.config import settings
from app.schemas.encryption import (
    EncryptTextRequest, EncryptTextResponse,
    DecryptTextRequest, DecryptTextResponse,
    EncryptFileResponse, DecryptFileRequest, DecryptFileResponse,
    EncryptedData, FileMetadata
)

router = APIRouter()


@router.post("/text/encrypt", response_model=EncryptTextResponse)
async def encrypt_text(request: EncryptTextRequest):
    """
    Encrypt text message with password
    
    - **plaintext**: Text to encrypt
    - **password**: Encryption password
    - **use_emoji**: Convert to emoji format (optional)
    """
    try:
        # Encrypt
        encrypted_data = encryption_engine.encrypt(request.plaintext, request.password)
        
        response_data = {
            "success": True,
            "encrypted_data": encrypted_data
        }
        
        # Optionally convert to emoji
        if request.use_emoji:
            emoji_text = emoji_encoder.encode(encrypted_data)
            response_data["emoji"] = emoji_text
            response_data["emoji_stats"] = emoji_encoder.get_emoji_stats(emoji_text)
        
        return response_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Encryption failed: {str(e)}")


@router.post("/text/decrypt", response_model=DecryptTextResponse)
async def decrypt_text(request: DecryptTextRequest):
    """
    Decrypt text message with password
    
    - **password**: Decryption password
    - **emoji**: Emoji-encoded ciphertext (OR provide ciphertext components)
    - **ciphertext**, **salt**, **nonce**, **tag**: Individual components
    """
    try:
        # Determine if emoji format or standard
        if request.emoji:
            encrypted_data = emoji_encoder.decode(request.emoji)
        else:
            if not all([request.ciphertext, request.salt, request.nonce, request.tag]):
                raise HTTPException(
                    status_code=400,
                    detail="Must provide either emoji OR all of (ciphertext, salt, nonce, tag)"
                )
            encrypted_data = {
                "ciphertext": request.ciphertext,
                "salt": request.salt,
                "nonce": request.nonce,
                "tag": request.tag,
                "kdf": request.kdf
            }
        
        # Decrypt
        plaintext = encryption_engine.decrypt(encrypted_data, request.password)
        
        return {
            "success": True,
            "plaintext": plaintext
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decryption failed: {str(e)}")


@router.post("/file/encrypt", response_model=EncryptFileResponse)
async def encrypt_file(
    file: UploadFile = File(...),
    password: str = Form(...)
):
    """
    Encrypt file with password
    
    - **file**: File to encrypt (TXT, PDF, PNG, JPG)
    - **password**: Encryption password
    """
    try:
        # Validate file size
        file_data = await file.read()
        if len(file_data) > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large (max {settings.MAX_FILE_SIZE} bytes)"
            )
        
        # Validate file extension
        file_ext = f".{file.filename.rsplit('.', 1)[-1].lower()}" if '.' in file.filename else ''
        if file_ext not in settings.ALLOWED_EXTENSIONS.split(','):
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed: {settings.ALLOWED_EXTENSIONS}"
            )
        
        # Get file metadata
        metadata = FileMetadata(
            filename=file.filename,
            size=len(file_data),
            mimetype=mimetypes.guess_type(file.filename)[0] or "application/octet-stream"
        )
        
        # Encrypt file data
        encrypted_data = encryption_engine.encrypt_bytes(file_data, password)
        
        # Add metadata to encrypted data for preservation
        encrypted_data["filename"] = file.filename
        encrypted_data["size"] = len(file_data)
        encrypted_data["mimetype"] = metadata.mimetype
        
        return {
            "success": True,
            "encrypted_data": encrypted_data,
            "metadata": metadata
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File encryption failed: {str(e)}")


@router.post("/file/decrypt", response_model=DecryptFileResponse)
async def decrypt_file(request: DecryptFileRequest):
    """
    Decrypt file with password
    
    - **password**: Decryption password
    - **encrypted_data**: Encrypted file data
    """
    try:
        # Extract metadata if present
        metadata_dict = request.encrypted_data.dict() if hasattr(request.encrypted_data, 'dict') else request.encrypted_data
        
        # Extract metadata from encrypted data if available
        filename = metadata_dict.get("filename", "decrypted_file")
        mimetype = metadata_dict.get("mimetype", "application/octet-stream")
        
        # Decrypt file data
        decrypted_data = encryption_engine.decrypt_bytes(
            metadata_dict,
            request.password
        )
        
        # Get metadata
        metadata = FileMetadata(
            filename=filename,
            size=len(decrypted_data),
            mimetype=mimetype
        )
        
        # Return as base64 for JSON response
        return {
            "success": True,
            "file_data": base64.b64encode(decrypted_data).decode('utf-8'),
            "metadata": metadata
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File decryption failed: {str(e)}")
