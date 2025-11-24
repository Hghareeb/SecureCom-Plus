"""
Tests for emoji encoder
"""

import pytest
from app.core.emoji_encoder import EmojiEncoder


class TestEmojiEncoder:
    """Test emoji encoding/decoding"""

    def test_encode_decode(self):
        """Test basic emoji encoding and decoding"""
        encoder = EmojiEncoder()
        
        encrypted_data = {
            "ciphertext": "ABCD1234",
            "salt": "efgh5678",
            "nonce": "ijkl9012",
            "tag": "mnop3456",
            "kdf": "argon2"
        }

        # Encode to emoji
        emoji_str = encoder.encode(encrypted_data)
        assert len(emoji_str) > 0
        
        # Decode back
        decoded = encoder.decode(emoji_str)
        assert decoded["ciphertext"] == encrypted_data["ciphertext"]
        assert decoded["salt"] == encrypted_data["salt"]
        assert decoded["nonce"] == encrypted_data["nonce"]
        assert decoded["tag"] == encrypted_data["tag"]
        assert decoded["kdf"] == encrypted_data["kdf"]

    def test_invalid_emoji_format(self):
        """Test decoding invalid emoji format"""
        encoder = EmojiEncoder()
        
        with pytest.raises(ValueError):
            encoder.decode("invalid_emoji_string")

    def test_emoji_stats(self):
        """Test emoji statistics"""
        encoder = EmojiEncoder()
        
        encrypted_data = {
            "ciphertext": "ABC",
            "salt": "DEF",
            "nonce": "GHI",
            "tag": "JKL",
            "kdf": "argon2"
        }

        emoji_str = encoder.encode(encrypted_data)
        stats = encoder.get_emoji_stats(emoji_str)

        assert "length" in stats
        assert "unique_emojis" in stats
        assert "emoji_count" in stats
        assert stats["length"] > 0
