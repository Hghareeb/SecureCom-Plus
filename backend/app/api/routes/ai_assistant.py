"""
AI Assistant API Routes
Natural language encryption interface
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
import openai
import secrets
import string
import json
import re
import qrcode
import io
import base64

from app.core.config import settings
from app.core.encryption import EncryptionEngine
from app.core.emoji_encoder import EmojiEncoder
from app.db.database import get_db
from app.db.models import QRToken

router = APIRouter()

# Configure OpenAI
openai.api_key = settings.OPENAI_API_KEY


class ChatMessage(BaseModel):
    message: str
    conversation_history: Optional[list] = []


class ChatResponse(BaseModel):
    response: str
    action: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


def generate_secure_password(length: int = 16) -> str:
    """Generate a secure random password"""
    characters = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(characters) for _ in range(length))
    return password


def parse_ai_response(ai_text: str) -> Dict[str, Any]:
    """Parse AI response to extract encryption parameters"""
    result = {
        "action": None,
        "message": None,
        "method": "text",  # text, emoji, file
        "generate_qr": False,
        "password": None,
        "encrypted_data": None,
        "encrypted_emoji": None,
        "expiry_hours": 24,
    }
    
    text_lower = ai_text.lower()
    
    # Detect action
    if re.search(r"\b(encrypt|secure|protect|hide)\b", text_lower):
        result["action"] = "encrypt"

    if re.search(r"\b(decrypt|decode|unlock|unscramble)\b", text_lower):
        result["action"] = "decrypt"
    
    # Extract message (look for quotes)
    message_match = re.search(r'["\'](.+?)["\']', ai_text)
    if message_match:
        result["message"] = message_match.group(1)

    # Extract JSON encrypted payload (best-effort)
    try:
        json_match = re.search(r"(\{.*\})", ai_text, flags=re.DOTALL)
        if json_match:
            candidate = json_match.group(1)
            parsed_json = json.loads(candidate)
            if isinstance(parsed_json, dict) and any(k in parsed_json for k in ["ciphertext", "salt", "nonce", "tag"]):
                result["encrypted_data"] = parsed_json
    except Exception:
        pass

    # If user is trying to decrypt and provided a quoted blob, treat it as emoji ciphertext
    # (best-effort; supports cases where user doesn't explicitly say "emoji")
    if result["action"] == "decrypt" and result["message"] and not result["encrypted_data"]:
        result["encrypted_emoji"] = result["message"]
    
    # Detect user-provided password with improved accuracy
    # Look for patterns like "password: xxx", "use password xxx", "my password is xxx"
    # Also handle quoted passwords and spaces correctly
    password_patterns = [
        # Quoted passwords (highest priority - most explicit)
        r'password[:\s]+["\']([^"\']+)["\']',
        r'use\s+password\s+["\']([^"\']+)["\']',
        r'my\s+password\s+is\s+["\']([^"\']+)["\']',
        r'pass[:\s]+["\']([^"\']+)["\']',
        # Unquoted passwords (word boundaries for accuracy)
        r'password[:\s]+(\S+)',
        r'use\s+password\s+(\S+)',
        r'my\s+password\s+is\s+(\S+)',
        r'pass[:\s]+(\S+)'
    ]
    for pattern in password_patterns:
        match = re.search(pattern, ai_text, flags=re.IGNORECASE)
        if match:
            # Clean up captured password (remove trailing punctuation if not quoted)
            pwd = match.group(1).strip()
            # Remove trailing sentence punctuation only if it looks like end of sentence
            pwd = re.sub(r'[.,;!?]+$', '', pwd)
            result["password"] = pwd
            break
    
    # Detect encryption method
    if any(word in text_lower for word in ["emoji", "emojis", "😀", "smiley"]):
        result["method"] = "emoji"

        # If the user quoted an emoji string, treat it as encrypted emoji payload for decrypt
        if result["message"]:
            result["encrypted_emoji"] = result["message"]
    
    # Detect QR code request
    if any(word in text_lower for word in ["qr", "qr code", "qrcode", "scan"]):
        result["generate_qr"] = True
    
    # Extract expiry time
    minutes_match = re.search(r'(\d+)\s*min(?:ute)?s?', text_lower)
    if minutes_match:
        result["expiry_hours"] = int(minutes_match.group(1)) / 60.0  # Convert to hours
    
    hours_match = re.search(r'(\d+)\s*hours?', text_lower)
    if hours_match:
        result["expiry_hours"] = int(hours_match.group(1))
    
    days_match = re.search(r'(\d+)\s*days?', text_lower)
    if days_match:
        result["expiry_hours"] = int(days_match.group(1)) * 24
    
    return result


@router.post("/chat", response_model=ChatResponse)
async def ai_chat(chat_message: ChatMessage, db: Session = Depends(get_db)):
    """
    AI-powered natural language encryption assistant
    """
    try:
        user_message = chat_message.message
        
        # Build conversation with system prompt
        messages = [
            {
                "role": "system",
                "content": """You are SecureCom+ AI Assistant, an expert encryption consultant with deep knowledge of cryptography, security, and the SecureCom+ platform.

CORE EXPERTISE & RESTRICTIONS:
Your expertise is EXCLUSIVELY in:
✓ SecureCom+ application features and workflows
✓ Encryption, decryption, and cryptographic concepts
✓ Security best practices and threat modeling
✓ Password security and authentication
✓ Cryptographic algorithms (AES-256-GCM, Argon2id, etc.)
✓ Secure data sharing and QR code security

For off-topic questions, professionally redirect:
"I specialize in encryption and security for SecureCom+. I can help you encrypt messages, understand cryptographic concepts, or guide you through secure data sharing. What encryption task can I assist you with?"

STRICTLY AVOID:
✗ Personal advice (relationships, health, legal)
✗ Politics, controversial topics, or inappropriate content
✗ General knowledge unrelated to security/encryption
✗ Making assumptions - always ask for clarification when uncertain

KEY PRINCIPLES:
1. **Accuracy First**: Never guess or make up information. If unsure, ask for clarification.
2. **Context Awareness**: Remember the conversation flow and reference previous exchanges.
3. **Clear Communication**: Use simple language for complex concepts. Provide examples.
4. **User-Centric**: Adapt explanations to the user's technical level.
5. **Proactive Guidance**: Anticipate user needs and suggest next steps.

ABOUT SECURECOM+
SecureCom+ is an educational encryption toolkit built for Bahrain Polytechnic, demonstrating modern cryptographic practices with a user-friendly interface.

ENCRYPTION TECHNOLOGY
Algorithm: AES-256-GCM (Advanced Encryption Standard)
- 256-bit key size - computationally unbreakable by brute force
- GCM (Galois/Counter Mode) provides authenticated encryption
- Same standard used by governments for classified data
- Detects any tampering with the encrypted data

Key Derivation: Argon2id
- Winner of the Password Hashing Competition (2015)
- Memory-hard function (uses 64MB RAM) - resistant to GPU/ASIC attacks
- 2 iterations, 4 parallel threads
- Converts any password into a secure 256-bit key

Security Features:
- 16-byte cryptographically random salt (unique per encryption)
- 16-byte random nonce/IV (never reused)
- Authentication tag verifies data integrity
- Zero-knowledge design: passwords are never stored

YOUR CAPABILITIES
1. Encrypt messages - convert text to secure ciphertext
2. Decrypt messages - from JSON or emoji format
3. Emoji encoding - 67+ emojis for visual ciphertext representation
4. QR codes - single-use shareable links with configurable expiry (1-168 hours)
5. Password guidance - help users create strong passwords
6. Security education - explain how encryption works

OUTPUT FORMATS
- JSON: Contains ciphertext, salt, nonce, tag, and kdf fields - suitable for developers
- Emoji: Visual representation using emojis - easy to copy and share
- QR Code: Scannable one-time link - ideal for secure sharing

HOW TO RESPOND

For encryption requests:
1. Acknowledge what they want to encrypt
2. Ask if they want a generated password or will provide their own
3. Ask about format preference (JSON, emoji, or QR code)
4. If QR code selected, ask about expiry time (default is 24 hours)
5. Confirm settings and ask them to say "confirm" when ready

For security questions - Be confident and educational:
- Explain AES-256-GCM technical details when asked about algorithms
- Explain computational infeasibility when asked about security
- Mention that AES-256 remains quantum-resistant for current threats

For general questions:
- List capabilities when asked what you can do
- Explain the encryption flow when asked how it works
- Mention Bahrain Polytechnic ICT Department when asked about the project

For password help:
- Recommend 12+ characters minimum
- Mix of uppercase, lowercase, numbers, and symbols
- Avoid dictionary words and personal information
- Offer to generate a secure random password

CONVERSATION STYLE
- **Professional yet approachable**: Expert knowledge delivered in a friendly manner
- **Educational and patient**: Break down complex topics into digestible pieces
- **Confident but not arrogant**: Acknowledge limitations when appropriate
- **Context-aware**: Reference previous messages in the conversation
- **Thorough and methodical**: Guide users step-by-step through encryption tasks
- **Proactive**: Suggest improvements and anticipate next steps

HANDLING AMBIGUITY
When user intent is unclear:
1. **Ask specific questions** instead of making assumptions
2. **Provide options** for the user to choose from
3. **Explain trade-offs** between different approaches
4. **Confirm understanding** before executing actions

Example:
User: "Encrypt something"
You: "I'd be happy to help! To encrypt a message, I need a few details:

1. **What message** would you like to encrypt? (Please provide the text in quotes)
2. **Password**: Would you like me to generate a secure random password, or do you have one in mind?
3. **Output format**: 
   - Standard JSON (for programmatic use)
   - Emoji format (visual, easy to share)
   - QR code (one-time scannable link)

Please provide these details and I'll encrypt it for you!"

EXAMPLE RESPONSES

Q: "What encryption do you use?"
A: "SecureCom+ uses AES-256-GCM, which is the gold standard in symmetric encryption.

Key features:
- 256-bit key size provides extremely strong security
- GCM mode provides both encryption and authentication
- Argon2id key derivation protects against password cracking attacks

This is the same encryption standard trusted by governments worldwide for protecting classified information."

Q: "Encrypt hello world"
A: "I'll encrypt 'hello world' for you.

Before we proceed, please let me know:

1. **Password Options**:
   - 🎲 Generate a secure random password (recommended)
   - 🔑 Provide your own password

2. **Output Format**:
   - 📋 JSON (standard format)
   - 😀 Emoji (fun visual format)
   - 📱 QR Code (one-time shareable link)

3. **QR Code Settings** (if selected):
   - Expiry time: 24 hours (default) or specify custom duration

Example response: 'Generate password, use emoji format, create QR code for 12 hours'

Once you decide, say **'confirm'** and I'll encrypt it immediately!"

Q: "Is this secure?"
A: "Yes, SecureCom+ provides strong security through multiple layers:

1. AES-256 encryption: Computationally infeasible to break with current technology
2. Argon2id key derivation: Memory-hard algorithm that makes password attacks extremely costly
3. Unique random values: Each encryption uses fresh salt and nonce values
4. Authentication: GCM mode detects any tampering with encrypted data

Your data is protected with military-grade encryption standards."

CRITICAL RULES FOR ENCRYPTION
1. **Never encrypt immediately** - Always confirm requirements first
2. **Extract information carefully** - Parse user messages accurately for passwords, messages, and preferences
3. **Remember context** - Reference previous messages to maintain conversation continuity
4. **Validate before execution** - Ensure all required information is present before saying 'confirm'
5. **Provide clear feedback** - Show exactly what will be encrypted and with what settings

PASSWORD ACCURACY
- When users provide a password, extract it EXACTLY as given
- Preserve spacing, special characters, and case sensitivity
- If quoted: use the exact content between quotes
- If unquoted: capture the full password token
- Always confirm the password with the user before encrypting

CONFIRMATION WORKFLOW
Only execute encryption/decryption when:
✓ All required information is present (message/data, password, format)
✓ User explicitly says "confirm", "yes", "proceed", "do it", or similar
✓ Settings have been clearly communicated to the user
"""
            }
        ]
        
        # Add conversation history - keep ALL messages for better context
        messages.extend(chat_message.conversation_history)
        
        # Add current message
        messages.append({"role": "user", "content": user_message})

        ai_response = ""
        if settings.OPENAI_API_KEY:
            # Call OpenAI with upgraded model
            response = openai.chat.completions.create(
                model="gpt-4o",  # More intelligent and accurate
                messages=messages,
                temperature=0.8,  # Slightly higher for more natural conversation
                max_tokens=800,  # Increased for more detailed responses
                presence_penalty=0.1,  # Encourage topic diversity
                frequency_penalty=0.1  # Reduce repetition
            )
            ai_response = response.choices[0].message.content
        else:
            ai_response = "AI Assistant is not configured (missing OPENAI_API_KEY). I can still encrypt/decrypt if you provide the required info and say 'confirm'."
        
        # Parse current message
        parsed = parse_ai_response(user_message)
        
        # Only auto-encrypt if user explicitly confirms with FINAL confirmation
        # Must be standalone confirmation, not mixed with preference selection
        normalized = user_message.strip().lower()
        
        # Strong confirmation: user is explicitly ready to proceed
        strong_confirmation_words = ["confirm", "proceed", "go ahead", "do it"]
        has_strong_confirmation = any(phrase in normalized for phrase in strong_confirmation_words)
        
        # Weak confirmation: could be part of preference selection
        weak_confirmation_pattern = r"^(yes|sure|okay|ok|yep)[\s\.,!]*$"
        has_weak_confirmation = bool(re.match(weak_confirmation_pattern, normalized))
        
        # Only proceed with encryption if strong confirmation OR weak confirmation alone
        has_confirmation = has_strong_confirmation or has_weak_confirmation
        
        # If confirmation given, look through conversation history for the message and settings
        if has_confirmation:
            # Extract from entire conversation history
            full_conversation = " ".join([msg.get("content", "") for msg in chat_message.conversation_history])
            parsed_history = parse_ai_response(full_conversation + " " + user_message)
            
            # Merge with current parse
            if not parsed["message"] and parsed_history["message"]:
                parsed["message"] = parsed_history["message"]
            if not parsed["password"] and parsed_history["password"]:
                parsed["password"] = parsed_history["password"]
            if not parsed["encrypted_data"] and parsed_history["encrypted_data"]:
                parsed["encrypted_data"] = parsed_history["encrypted_data"]
            if not parsed["encrypted_emoji"] and parsed_history["encrypted_emoji"]:
                parsed["encrypted_emoji"] = parsed_history["encrypted_emoji"]
            if parsed_history["generate_qr"]:
                parsed["generate_qr"] = True
            if parsed_history["method"] != "text":
                parsed["method"] = parsed_history["method"]
            if parsed_history["expiry_hours"] != 24:
                parsed["expiry_hours"] = parsed_history["expiry_hours"]

        # If we have an encrypted payload and confirmation, execute decryption
        if parsed["action"] == "decrypt" and has_confirmation:
            if not parsed["password"]:
                return ChatResponse(
                    response=f"{ai_response}\n\n❌ Missing password. Please provide it (e.g. password: MyPass123!) and say 'confirm'.",
                    action="error"
                )

            try:
                engine = EncryptionEngine()

                encrypted_data: Optional[Dict[str, Any]] = None
                if parsed["encrypted_emoji"]:
                    emoji_encoder = EmojiEncoder()
                    encrypted_data = emoji_encoder.decode(parsed["encrypted_emoji"])
                elif parsed["encrypted_data"]:
                    encrypted_data = parsed["encrypted_data"]
                else:
                    return ChatResponse(
                        response=f"{ai_response}\n\n❌ Missing encrypted payload. Paste the emoji ciphertext or the JSON (ciphertext/salt/nonce/tag), then say 'confirm'.",
                        action="error"
                    )

                plaintext = engine.decrypt(encrypted_data, parsed["password"])
                return ChatResponse(
                    response=f"{ai_response}\n\n✅ Decryption complete!",
                    action="decrypt_complete",
                    data={
                        "plaintext": plaintext
                    }
                )
            except ValueError as e:
                return ChatResponse(
                    response=f"{ai_response}\n\n❌ Decryption failed: {str(e)}",
                    action="error"
                )
            except Exception as e:
                return ChatResponse(
                    response=f"{ai_response}\n\n❌ Decryption failed: {str(e)}",
                    action="error"
                )
        
        # If we have a message and confirmation, execute encryption
        if parsed["message"] and has_confirmation:
            # Use user-provided password if available, otherwise generate
            password = parsed["password"] if parsed["password"] else generate_secure_password()
            
            try:
                # Perform encryption
                engine = EncryptionEngine()
                encrypted_result = engine.encrypt(parsed["message"], password)
                
                # If emoji mode, also encode to emoji
                if parsed["method"] == "emoji":
                    emoji_encoder = EmojiEncoder()
                    emoji_text = emoji_encoder.encode(encrypted_result)
                    encrypted_result["emoji"] = emoji_text
                
                result_data = {
                    "password": password,
                    "encrypted": encrypted_result,
                    "method": parsed["method"],
                    "generate_qr": parsed["generate_qr"]
                }
                
                # Generate QR code if requested
                if parsed["generate_qr"]:
                    try:
                        # Create QR token
                        token = QRToken.generate_token()
                        expires_at = QRToken.calculate_expiry(parsed["expiry_hours"])
                        
                        qr_token = QRToken(
                            token=token,
                            encrypted_message=json.dumps(encrypted_result),
                            expires_at=expires_at
                        )
                        
                        db.add(qr_token)
                        db.commit()
                        db.refresh(qr_token)
                        
                        # Generate QR code URL
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
                        
                        result_data["qr_code"] = {
                            "url": qr_url,
                            "image": qr_image_b64,
                            "token": token,
                            "expires_at": expires_at.isoformat()
                        }
                    except Exception as qr_error:
                        # QR generation failed, but encryption succeeded
                        result_data["qr_error"] = str(qr_error)
                
                return ChatResponse(
                    response=f"{ai_response}\n\n✅ Encryption complete!",
                    action="encrypt_complete",
                    data=result_data
                )
            except Exception as e:
                return ChatResponse(
                    response=f"I encountered an error while encrypting: {str(e)}. Could you try rephrasing your request?",
                    action="error"
                )
        
        # Return AI response for conversation
        return ChatResponse(
            response=ai_response,
            action="continue"
        )
        
    except openai.OpenAIError as e:
        raise HTTPException(
            status_code=503,
            detail=f"AI service error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process request: {str(e)}"
        )
