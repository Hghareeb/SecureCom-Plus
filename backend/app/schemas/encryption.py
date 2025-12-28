"""
Pydantic schemas for encryption endpoints
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict


class EncryptTextRequest(BaseModel):
    """Request schema for text encryption"""
    plaintext: str = Field(..., min_length=1, description="Text to encrypt")
    password: str = Field(..., min_length=1, description="Encryption password")
    use_emoji: bool = Field(default=False, description="Convert to emoji format")


class EncryptedData(BaseModel):
    """Encrypted data schema"""
    ciphertext: str
    salt: str
    nonce: str
    tag: str
    kdf: str
    filename: Optional[str] = None
    mimetype: Optional[str] = None
    size: Optional[int] = None


class EncryptTextResponse(BaseModel):
    """Response schema for text encryption"""
    success: bool = True
    encrypted_data: EncryptedData
    emoji: Optional[str] = None
    emoji_stats: Optional[Dict[str, int]] = None


class DecryptTextRequest(BaseModel):
    """Request schema for text decryption"""
    password: str = Field(..., min_length=1, description="Decryption password")
    emoji: Optional[str] = Field(None, description="Emoji-encoded ciphertext")
    ciphertext: Optional[str] = None
    salt: Optional[str] = None
    nonce: Optional[str] = None
    tag: Optional[str] = None
    kdf: Optional[str] = "argon2"


class DecryptTextResponse(BaseModel):
    """Response schema for text decryption"""
    success: bool = True
    plaintext: str


class FileMetadata(BaseModel):
    """File metadata schema"""
    filename: str
    size: int
    mimetype: str


class EncryptFileResponse(BaseModel):
    """Response schema for file encryption"""
    success: bool = True
    encrypted_data: EncryptedData
    metadata: FileMetadata


class DecryptFileRequest(BaseModel):
    """Request schema for file decryption"""
    password: str = Field(..., min_length=1)
    encrypted_data: EncryptedData


class DecryptFileResponse(BaseModel):
    """Response schema for file decryption"""
    success: bool = True
    file_data: str  # base64 encoded
    metadata: FileMetadata
