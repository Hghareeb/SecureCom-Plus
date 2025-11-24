"""
Emoji Encoder/Decoder for Visual Ciphertext
Converts base64 ciphertext into emoji sequences
"""

from typing import Dict

# Expanded emoji mapping - using diverse emojis for better variety!
# Includes faces, animals, objects, nature, food, activities, and more
EMOJI_MAP = {
    # Uppercase A-Z - Mix of faces and animals
    'A': '😀', 'B': '🐶', 'C': '🐱', 'D': '🐭', 'E': '🐹', 'F': '🐰',
    'G': '🦊', 'H': '🐻', 'I': '🐼', 'J': '🐨', 'K': '🐯', 'L': '🦁',
    'M': '🐮', 'N': '🐷', 'O': '🐸', 'P': '🐵', 'Q': '🐔', 'R': '🐧',
    'S': '🐦', 'T': '🐤', 'U': '🦆', 'V': '🦅', 'W': '🦉', 'X': '🦇',
    'Y': '🐺', 'Z': '🐗',
    
    # Lowercase a-z - Food, nature, and objects (SINGLE codepoint only!)
    'a': '🍎', 'b': '🍌', 'c': '🍒', 'd': '🍇', 'e': '🍉', 'f': '🍓',
    'g': '🍑', 'h': '🍍', 'i': '🥝', 'j': '🍅', 'k': '🥑', 'l': '🥕',
    'm': '🌽', 'n': '🌶', 'o': '🥔', 'p': '🍄', 'q': '🥜', 'r': '🌰',
    's': '🍞', 't': '🥐', 'u': '🥖', 'v': '🥨', 'w': '🥯', 'x': '🧀',
    'y': '🥚', 'z': '🍳',
    
    # Numbers 0-9 - Nature and weather (SINGLE codepoint emojis only!)
    '0': '⭐', '1': '🌟', '2': '💫', '3': '✨', '4': '🌙',
    '5': '🌞', '6': '🌝', '7': '⛅', '8': '🌈', '9': '🌊',
    
    # Special base64 characters - Hearts and symbols (SINGLE codepoint!)
    '+': '💖', '/': '💝', '=': '💗',
    
    # Header separators - Unique symbols (SINGLE codepoint!)
    ':': '🔸', '|': '🔹'
}

# Reverse mapping
EMOJI_TO_B64 = {v: k for k, v in EMOJI_MAP.items()}


class EmojiEncoder:
    """Encode/decode ciphertext as emoji sequences"""
    
    @staticmethod
    def encode(encrypted_data: Dict[str, str]) -> str:
        """
        Convert encrypted data to emoji string (NO separators - continuous emoji string)
        
        Args:
            encrypted_data: Dict with ciphertext, salt, nonce, tag
            
        Returns:
            Emoji-encoded string with length prefix
        """
        # Ensure base64 strings have proper padding
        def pad_base64(s: str) -> str:
            """Add padding to base64 string if needed"""
            missing_padding = len(s) % 4
            if missing_padding:
                s += '=' * (4 - missing_padding)
            return s
        
        # Pad all components
        ciphertext = pad_base64(encrypted_data['ciphertext'])
        salt = pad_base64(encrypted_data['salt'])
        nonce = pad_base64(encrypted_data['nonce'])
        tag = pad_base64(encrypted_data['tag'])
        kdf = encrypted_data.get('kdf', 'argon2')
        
        # Debug: Log what we're encoding
        print(f"DEBUG ENCODE - Original tag: '{encrypted_data['tag']}' (len={len(encrypted_data['tag'])})")
        print(f"DEBUG ENCODE - Padded tag: '{tag}' (len={len(tag)})")
        
        # Get component lengths for decoding later
        ct_len = len(ciphertext)
        salt_len = len(salt)
        nonce_len = len(nonce)
        tag_len = len(tag)
        
        print(f"DEBUG ENCODE - Header will say: ct={ct_len}, salt={salt_len}, nonce={nonce_len}, tag={tag_len}")
        
        # Create length header (format: "CT:24,S:24,N:24,T:24,K:argon2|")
        # This tells us where to split when decoding
        header = f"{ct_len}:{salt_len}:{nonce_len}:{tag_len}:{kdf}|"
        
        # Combine header + all components (NO separators between encrypted data)
        combined = header + ciphertext + salt + nonce + tag
        
        # Convert to emojis
        emoji_str = ''.join(EMOJI_MAP.get(char, char) for char in combined)
        
        return emoji_str
    
    @staticmethod
    def decode(emoji_str: str) -> Dict[str, str]:
        """
        Convert emoji string back to encrypted data (using length-prefix decoding)
        
        Args:
            emoji_str: Emoji-encoded ciphertext
            
        Returns:
            Dict with ciphertext, salt, nonce, tag, kdf
            
        Raises:
            ValueError: If emoji format is invalid
        """
        if not emoji_str or not emoji_str.strip():
            raise ValueError("Empty emoji ciphertext")
        
        # Clean the input (remove whitespace, newlines)
        emoji_str = emoji_str.strip()
        
        # Convert emojis back to base64/text
        decoded_str = ''
        unknown_chars = []
        for char in emoji_str:
            if char in EMOJI_TO_B64:
                decoded_str += EMOJI_TO_B64[char]
            elif char in [' ', '\n', '\r', '\t']:
                # Skip whitespace
                continue
            else:
                # Keep track of unknown characters for debugging
                unknown_chars.append(char)
        
        # SECURITY: Reject if unknown emojis were added
        if unknown_chars:
            # Show first few unknown chars for debugging
            sample = ''.join(unknown_chars[:5])
            raise ValueError(f"Invalid emoji characters detected: '{sample}...' ({len(unknown_chars)} total). The encrypted message may have been corrupted or tampered with.")
        
        # Parse the length header
        try:
            # Find the header separator
            if '|' not in decoded_str:
                raise ValueError("Invalid format - no header found. Ensure you copied the complete emoji string.")
            
            header, data = decoded_str.split('|', 1)
            
            # Parse header: "24:24:24:24:argon2"
            parts = header.split(':')
            if len(parts) < 4:
                raise ValueError(f"Invalid header format - expected lengths for 4 components, got {len(parts)}")
            
            ct_len = int(parts[0])
            salt_len = int(parts[1])
            nonce_len = int(parts[2])
            tag_len = int(parts[3])
            kdf = parts[4] if len(parts) > 4 else "argon2"
            
            # Extract components based on lengths
            pos = 0
            ciphertext = data[pos:pos + ct_len]
            pos += ct_len
            
            salt = data[pos:pos + salt_len]
            pos += salt_len
            
            nonce = data[pos:pos + nonce_len]
            pos += nonce_len
            
            tag = data[pos:pos + tag_len]
            pos += tag_len
            
            # SECURITY: Check for extra data (tampering detection)
            expected_total = ct_len + salt_len + nonce_len + tag_len
            if len(data) > expected_total:
                extra_chars = len(data) - expected_total
                raise ValueError(f"Extra data detected after encrypted message ({extra_chars} extra characters). The message may have been tampered with.")
            
            # Debug decode
            print(f"DEBUG DECODE - Header said: ct={ct_len}, salt={salt_len}, nonce={nonce_len}, tag={tag_len}")
            print(f"DEBUG DECODE - Extracted tag: '{tag}' (len={len(tag)})")
            print(f"DEBUG DECODE - Total data length: {len(data)}, Expected: {expected_total}")
            
            # Validate we got all components
            if not all([ciphertext, salt, nonce, tag]):
                raise ValueError("One or more encrypted components are empty or corrupted")
            
            # Debug: show what we got vs what we expected
            actual_lens = f"ct={len(ciphertext)}, salt={len(salt)}, nonce={len(nonce)}, tag={len(tag)}"
            expected_lens = f"ct={ct_len}, salt={salt_len}, nonce={nonce_len}, tag={tag_len}"
            
            if len(ciphertext) != ct_len or len(salt) != salt_len or len(nonce) != nonce_len or len(tag) != tag_len:
                raise ValueError(f"Component lengths don't match. Expected: {expected_lens}, Got: {actual_lens}. Total data available: {len(data)} chars")
            
            # Return the components (they already have correct padding)
            return {
                "ciphertext": ciphertext,
                "salt": salt,
                "nonce": nonce,
                "tag": tag,
                "kdf": kdf
            }
            
        except ValueError as e:
            raise e
        except Exception as e:
            raise ValueError(f"Failed to decode emoji ciphertext: {str(e)}")
    
    @staticmethod
    def get_emoji_stats(emoji_str: str) -> Dict[str, int]:
        """
        Get statistics about emoji-encoded message
        
        Args:
            emoji_str: Emoji-encoded string
            
        Returns:
            Dict with length, unique_emojis, emoji_count
        """
        return {
            "length": len(emoji_str),
            "unique_emojis": len(set(emoji_str)),
            "emoji_count": sum(1 for char in emoji_str if char in EMOJI_TO_B64)
        }


# Singleton instance
emoji_encoder = EmojiEncoder()
