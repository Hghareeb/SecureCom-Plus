"""
Tests for API endpoints
"""

import pytest


class TestHealthEndpoint:
    """Test health check endpoints"""

    def test_health_check(self, client):
        """Test health endpoint"""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data

    def test_ping(self, client):
        """Test ping endpoint"""
        response = client.get("/api/ping")
        assert response.status_code == 200
        assert response.json()["message"] == "pong"


class TestEncryptionEndpoints:
    """Test encryption API endpoints"""

    def test_encrypt_text(self, client):
        """Test text encryption endpoint"""
        response = client.post(
            "/api/encryption/text/encrypt",
            json={
                "plaintext": "Hello World",
                "password": "TestPassword123",
                "use_emoji": False
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "encrypted_data" in data
        assert "ciphertext" in data["encrypted_data"]

    def test_encrypt_with_emoji(self, client):
        """Test text encryption with emoji encoding"""
        response = client.post(
            "/api/encryption/text/encrypt",
            json={
                "plaintext": "Secret message",
                "password": "Password123",
                "use_emoji": True
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "emoji" in data
        assert "emoji_stats" in data

    def test_decrypt_text(self, client):
        """Test text decryption endpoint"""
        # First encrypt
        encrypt_response = client.post(
            "/api/encryption/text/encrypt",
            json={
                "plaintext": "Test message",
                "password": "Password123",
                "use_emoji": False
            }
        )
        encrypted_data = encrypt_response.json()["encrypted_data"]

        # Then decrypt
        decrypt_response = client.post(
            "/api/encryption/text/decrypt",
            json={
                "password": "Password123",
                **encrypted_data
            }
        )
        assert decrypt_response.status_code == 200
        data = decrypt_response.json()
        assert data["success"] is True
        assert data["plaintext"] == "Test message"

    def test_decrypt_wrong_password(self, client):
        """Test decryption with wrong password"""
        # First encrypt
        encrypt_response = client.post(
            "/api/encryption/text/encrypt",
            json={
                "plaintext": "Secret",
                "password": "CorrectPassword",
                "use_emoji": False
            }
        )
        encrypted_data = encrypt_response.json()["encrypted_data"]

        # Try to decrypt with wrong password
        decrypt_response = client.post(
            "/api/encryption/text/decrypt",
            json={
                "password": "WrongPassword",
                **encrypted_data
            }
        )
        assert decrypt_response.status_code == 400


class TestQRTokenEndpoints:
    """Test QR token endpoints"""

    def test_create_qr_token(self, client):
        """Test QR token creation"""
        encrypted_message = {
            "ciphertext": "test_cipher",
            "salt": "test_salt",
            "nonce": "test_nonce",
            "tag": "test_tag",
            "kdf": "argon2"
        }

        response = client.post(
            "/api/qr/create",
            json={
                "encrypted_message": encrypted_message,
                "expiry_hours": 24
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "token" in data
        assert "qr_image" in data
        assert "url" in data

    def test_view_qr_token(self, client):
        """Test viewing QR token (single-use)"""
        # Create token
        encrypted_message = {
            "ciphertext": "test",
            "salt": "test",
            "nonce": "test",
            "tag": "test",
            "kdf": "argon2"
        }
        
        create_response = client.post(
            "/api/qr/create",
            json={
                "encrypted_message": encrypted_message,
                "expiry_hours": 1
            }
        )
        token = create_response.json()["token"]

        # View token (first time - should work)
        view_response = client.get(f"/api/qr/view/{token}")
        assert view_response.status_code == 200
        data = view_response.json()
        assert data["success"] is True
        assert "encrypted_message" in data

        # Try to view again (should fail - single use)
        second_view = client.get(f"/api/qr/view/{token}")
        assert second_view.status_code == 403

    def test_view_nonexistent_token(self, client):
        """Test viewing non-existent token"""
        response = client.get("/api/qr/view/nonexistent_token_12345")
        assert response.status_code == 404
