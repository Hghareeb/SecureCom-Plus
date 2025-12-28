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
                "content": """You are SecureCom+ AI Assistant. You help users encrypt and decrypt messages.

STRICT RULES:
1. Keep responses under 20 words when possible
2. NO markdown (no **, __, etc.)
3. NO emojis in your text
4. NEVER show passwords, QR codes, encrypted data, or any results
5. NEVER say "Here is..." - the system shows results, not you

YOUR WORKFLOW:

Encryption:
User: "Encrypt [message]"
You: "Encrypting with emoji format."
System: Auto-generates password, encrypts as emoji, shows results

Decryption:
User: "Decrypt [emoji] password [pass]"
You: "Decrypting now."
System: Decrypts and shows plaintext

Questions:
User: "What encryption?"
You: "AES-256-GCM with Argon2id."

IMPORTANT:
- Always encrypt as EMOJI format (no JSON, no QR codes)
- Always GENERATE password (never ask user for password on encrypt)
- Never ask "what format?" or "generate password?" - just do it
- For decrypt: user MUST provide password

NEVER DO:
- Show passwords, encrypted data, or QR codes yourself
- Ask questions about format or password preferences
- Use markdown or emojis in your text

DO:
- Say "Encrypting with emoji format" then let system handle it
- Answer questions in under 10 words
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
        
        # Auto-encrypt immediately if encryption action detected (no confirmation needed)
        # For decryption, still require confirmation for safety
        normalized = user_message.strip().lower()
        
        # Confirmation only needed for decryption
        confirmation_words = ["confirm", "proceed", "go ahead", "do it", "yes", "okay", "ok"]
        has_confirmation = any(word in normalized for word in confirmation_words)
        
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
        
        # Auto-encrypt when message is detected (no confirmation needed)
        if parsed["message"] and parsed["action"] == "encrypt":
            # ALWAYS generate password (ignore user-provided)
            password = generate_secure_password()
            
            try:
                # Perform encryption
                engine = EncryptionEngine()
                encrypted_result = engine.encrypt(parsed["message"], password)
                
                # ALWAYS use emoji format
                emoji_encoder = EmojiEncoder()
                emoji_text = emoji_encoder.encode(encrypted_result)
                encrypted_result["emoji"] = emoji_text
                
                result_data = {
                    "password": password,
                    "encrypted": encrypted_result,
                    "method": "emoji",  # Always emoji
                    "generate_qr": False  # Never generate QR codes
                }
                
                # QR code generation disabled - emoji format only
                if False:  # Disabled
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
