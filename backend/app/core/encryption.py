"""
Core AES-256-GCM Encryption Engine with Argon2/PBKDF2 KDF
"""

import os
import base64
from typing import Dict
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from argon2 import PasswordHasher
from argon2.low_level import hash_secret_raw, Type

from app.core.config import settings


class EncryptionEngine:
    """AES-256-GCM encryption with password-based key derivation"""
    
    def __init__(self, kdf_algorithm: str = None):
        self.kdf_algorithm = kdf_algorithm or settings.KDF_ALGORITHM
        self.key_size = 32  # 256 bits
        
    def derive_key(self, password: str, salt: bytes) -> bytes:
        """
        Derive encryption key from password using Argon2id or PBKDF2
        
        Args:
            password: User password
            salt: Random salt (16 bytes)
            
        Returns:
            Derived key (32 bytes)
        """
        if self.kdf_algorithm == "argon2":
            return hash_secret_raw(
                secret=password.encode('utf-8'),
                salt=salt,
                time_cost=settings.ARGON2_TIME_COST,
                memory_cost=settings.ARGON2_MEMORY_COST,
                parallelism=settings.ARGON2_PARALLELISM,
                hash_len=self.key_size,
                type=Type.ID
            )
        else:  # PBKDF2
            return PBKDF2(
                password,
                salt,
                dkLen=self.key_size,
                count=100000
            )
    
    def encrypt(self, plaintext: str, password: str) -> Dict[str, str]:
        """
        Encrypt plaintext with password using AES-256-GCM
        
        Args:
            plaintext: Text to encrypt
            password: Encryption password
            
        Returns:
            Dictionary with base64-encoded ciphertext, salt, nonce, tag, kdf
        """
        # Generate random salt and nonce
        salt = os.urandom(16)
        nonce = os.urandom(16)
        
        # Derive key from password
        key = self.derive_key(password, salt)
        
        # Create cipher and encrypt
        cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
        ciphertext, tag = cipher.encrypt_and_digest(plaintext.encode('utf-8'))
        
        return {
            "ciphertext": base64.b64encode(ciphertext).decode('utf-8'),
            "salt": base64.b64encode(salt).decode('utf-8'),
            "nonce": base64.b64encode(nonce).decode('utf-8'),
            "tag": base64.b64encode(tag).decode('utf-8'),
            "kdf": self.kdf_algorithm
        }
    
    def decrypt(self, encrypted_data: Dict[str, str], password: str) -> str:
        """
        Decrypt ciphertext with password
        
        Args:
            encrypted_data: Dict with ciphertext, salt, nonce, tag (base64)
            password: Decryption password
            
        Returns:
            Decrypted plaintext string
            
        Raises:
            ValueError: If decryption fails (wrong password or corrupted data)
        """
        try:
            # Decode base64 components
            try:
                ciphertext = base64.b64decode(encrypted_data["ciphertext"])
                salt = base64.b64decode(encrypted_data["salt"])
                nonce = base64.b64decode(encrypted_data["nonce"])
                tag = base64.b64decode(encrypted_data["tag"])
            except Exception as e:
                raise ValueError(f"Invalid encrypted data format - data may be corrupted or incomplete. If using emoji format, ensure you copied the entire string including 🔥 separators. Error: {str(e)}")
            
            # Derive key from password
            key = self.derive_key(password, salt)
            
            # Create cipher and decrypt
            cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
            plaintext = cipher.decrypt_and_verify(ciphertext, tag)
            
            # Decode to UTF-8 (for text data only)
            try:
                return plaintext.decode('utf-8')
            except UnicodeDecodeError:
                raise ValueError("Decryption failed - this appears to be binary data (file). Use file decryption endpoint instead of text decryption.")
            
        except ValueError as e:
            # Re-raise ValueError with original message
            raise e
        except Exception as e:
            error_msg = str(e).lower()
            if "mac check failed" in error_msg or "verify" in error_msg:
                raise ValueError("Decryption failed - wrong password")
            else:
                raise ValueError(f"Decryption failed: {str(e)}")
    
    def encrypt_bytes(self, data: bytes, password: str) -> Dict[str, str]:
        """
        Encrypt binary data (for files)
        
        Args:
            data: Binary data to encrypt
            password: Encryption password
            
        Returns:
            Dictionary with base64-encoded encrypted components
        """
        salt = os.urandom(16)
        nonce = os.urandom(16)
        key = self.derive_key(password, salt)
        
        cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
        ciphertext, tag = cipher.encrypt_and_digest(data)
        
        return {
            "ciphertext": base64.b64encode(ciphertext).decode('utf-8'),
            "salt": base64.b64encode(salt).decode('utf-8'),
            "nonce": base64.b64encode(nonce).decode('utf-8'),
            "tag": base64.b64encode(tag).decode('utf-8'),
            "kdf": self.kdf_algorithm
        }
    
    def decrypt_bytes(self, encrypted_data: Dict[str, str], password: str) -> bytes:
        """
        Decrypt binary data (for files)
        
        Args:
            encrypted_data: Dict with encrypted components
            password: Decryption password
            
        Returns:
            Decrypted binary data
            
        Raises:
            ValueError: If decryption fails
        """
        try:
            ciphertext = base64.b64decode(encrypted_data["ciphertext"])
            salt = base64.b64decode(encrypted_data["salt"])
            nonce = base64.b64decode(encrypted_data["nonce"])
            tag = base64.b64decode(encrypted_data["tag"])
            
            key = self.derive_key(password, salt)
            cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
            
            return cipher.decrypt_and_verify(ciphertext, tag)
            
        except Exception as e:
            raise ValueError(f"Decryption failed: {str(e)}")


# Singleton instance
encryption_engine = EncryptionEngine()
