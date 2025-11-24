"""
Tests for encryption engine
"""

import pytest
from app.core.encryption import EncryptionEngine


class TestEncryptionEngine:
    """Test AES-256-GCM encryption engine"""

    def test_encrypt_decrypt_text(self):
        """Test basic text encryption and decryption"""
        engine = EncryptionEngine()
        plaintext = "Hello, SecureCom+!"
        password = "TestPassword123"

        # Encrypt
        encrypted = engine.encrypt(plaintext, password)
        
        assert "ciphertext" in encrypted
        assert "salt" in encrypted
        assert "nonce" in encrypted
        assert "tag" in encrypted
        assert encrypted["kdf"] == "argon2"

        # Decrypt
        decrypted = engine.decrypt(encrypted, password)
        assert decrypted == plaintext

    def test_decrypt_wrong_password(self):
        """Test decryption with wrong password fails"""
        engine = EncryptionEngine()
        plaintext = "Secret message"
        password = "CorrectPassword"

        encrypted = engine.encrypt(plaintext, password)

        with pytest.raises(ValueError):
            engine.decrypt(encrypted, "WrongPassword")

    def test_encrypt_decrypt_bytes(self):
        """Test binary data encryption"""
        engine = EncryptionEngine()
        data = b"Binary data content"
        password = "TestPassword123"

        # Encrypt
        encrypted = engine.encrypt_bytes(data, password)
        
        # Decrypt
        decrypted = engine.decrypt_bytes(encrypted, password)
        assert decrypted == data

    def test_different_salts_nonces(self):
        """Test that each encryption uses unique salt and nonce"""
        engine = EncryptionEngine()
        plaintext = "Same message"
        password = "SamePassword"

        encrypted1 = engine.encrypt(plaintext, password)
        encrypted2 = engine.encrypt(plaintext, password)

        # Different salts and nonces
        assert encrypted1["salt"] != encrypted2["salt"]
        assert encrypted1["nonce"] != encrypted2["nonce"]
        # But both should decrypt correctly
        assert engine.decrypt(encrypted1, password) == plaintext
        assert engine.decrypt(encrypted2, password) == plaintext

    def test_pbkdf2_kdf(self):
        """Test PBKDF2 key derivation"""
        engine = EncryptionEngine(kdf_algorithm="pbkdf2")
        plaintext = "Test with PBKDF2"
        password = "TestPassword"

        encrypted = engine.encrypt(plaintext, password)
        assert encrypted["kdf"] == "pbkdf2"
        
        decrypted = engine.decrypt(encrypted, password)
        assert decrypted == plaintext
