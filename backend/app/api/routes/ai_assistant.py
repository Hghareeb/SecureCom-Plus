"""
AI Assistant API Routes
Natural language encryption interface
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List, Literal
from sqlalchemy.orm import Session
import openai
import secrets
import string
import re
import json
import io
import base64
import qrcode

from app.core.config import settings
from app.core.encryption import EncryptionEngine
from app.core.emoji_encoder import EmojiEncoder
from app.db.database import get_db
from app.db.models import QRToken

router = APIRouter()

# Configure OpenAI
openai.api_key = settings.OPENAI_API_KEY


Role = Literal["user", "assistant"]

class HistoryItem(BaseModel):
    role: Role
    content: str

class ChatMessage(BaseModel):
    message: str
    conversation_history: List[HistoryItem] = Field(default_factory=list)

class ChatResponse(BaseModel):
    response: str
    action: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class Intent(BaseModel):
    """Structured output for intent extraction"""
    intent: Literal["encrypt", "decrypt", "explain", "other"]
    plaintext: Optional[str] = None
    emoji_ciphertext: Optional[str] = None
    payload_json: Optional[Dict[str, Any]] = None
    password: Optional[str] = None
    needs_confirmation: bool = False
    user_question: Optional[str] = None


def generate_secure_password(length: int = 16) -> str:
    """Generate a secure random password"""
    characters = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(characters) for _ in range(length))
    return password


def contains_secrets(text: str) -> bool:
    """Detect if text contains passwords, ciphertext, or sensitive data"""
    if re.search(r'(?i)\b(password|pass)\b\s*[:=]', text):
        return True
    if re.search(r"\{[\s\S]*?(ciphertext|salt|nonce|tag)[\s\S]*?\}", text, re.I):
        return True
    # Long emoji runs (likely encrypted emoji)
    if re.search(r"[\U0001F300-\U0001FAFF]{12,}", text):
        return True
    return False


def redact(text: str) -> str:
    """Redact sensitive information before sending to AI"""
    text = re.sub(r'(?i)(password|pass)\s*[:=]\s*["\']?([^\s"\']+)["\']?', r"\1: [REDACTED]", text)
    text = re.sub(r"\{[\s\S]*?\}", "{[REDACTED_JSON]}", text)
    text = re.sub(r"[\U0001F300-\U0001FAFF]{12,}", "[REDACTED_EMOJI]", text)
    return text


def safe_history(history: List[HistoryItem], max_items: int = 16) -> List[dict]:
    """Convert history to safe format, prevent system injection"""
    trimmed = history[-max_items:]
    return [{"role": h.role, "content": h.content[:4000]} for h in trimmed]


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
                "content": """You are SecureCom+ AI Assistant, an intelligent cryptography guide and security expert.

YOUR ROLE
You are a GUIDE ONLY - you do NOT perform encryption or decryption. Instead, you:
- Help users understand how to use SecureCom+ encryption features
- Answer questions about cryptography, security, and best practices
- Guide users to the appropriate pages for encryption/decryption
- Ask smart questions to understand what users need
- Provide educational explanations about encryption technology

CORE CAPABILITIES
1. Answer security and cryptography questions intelligently
2. Explain how AES-256-GCM and Argon2id work
3. Guide users on which SecureCom+ feature to use
4. Help troubleshoot encryption/decryption issues
5. Provide best practices for secure communication

HOW TO GUIDE USERS

When user wants to encrypt:
- Ask what they want to encrypt (text, file, or both)
- Explain they should use the "Encrypt" page in the navigation
- Tell them the system will auto-generate a secure password
- Mention output will be emoji format for easy sharing

When user wants to decrypt:
- Ask if they have the encrypted emoji ciphertext and password
- Guide them to the "Decrypt" page in the navigation
- Explain they need to paste both the emoji ciphertext AND password

When user asks questions:
- Provide intelligent, detailed answers about encryption
- Explain AES-256-GCM encryption and Argon2id key derivation
- Discuss security threats and how SecureCom+ protects against them
- Be conversational and educational

HARD RULES
- NEVER perform encryption or decryption yourself
- NEVER generate passwords, ciphertext, or fake examples
- ALWAYS guide users to use the actual encryption/decryption pages
- Ask clarifying questions to understand user needs
- Be smart, helpful, and educational

EXAMPLE INTERACTIONS

User: "I want to encrypt a message"
You: "I can help you with that! What would you like to encrypt - text, a file, or both? Once you let me know, I'll guide you to the right page and walk you through the process."

User: "Just text"
You: "Perfect! Head to the Encrypt page using the navigation menu. There you can:
1. Enter your message
2. The system will automatically generate a secure password
3. You'll get emoji-formatted ciphertext you can easily share
Would you like to know how the encryption works or do you have any questions?"

User: "Is AES-256 secure?"
You: "Absolutely! AES-256-GCM is military-grade encryption used by governments worldwide. Here's why it's secure:
- 256-bit key = 2^256 possible combinations (practically unbreakable)
- GCM mode provides authentication (detects tampering)
- Combined with Argon2id key derivation (memory-hard, resists brute force)
- Each encryption uses unique salt and nonce values
It would take billions of years to break with current technology. Any other questions about the security?"

REMEMBER: Be intelligent, ask questions, guide users to pages, explain concepts clearly. You are an expert assistant, not an executor.
"""
            }
        ]
        
        # Add safe conversation history (prevent injection, limit size)
        safe_hist = safe_history(chat_message.conversation_history, max_items=16)
        messages.extend(safe_hist)
        
        # Redact sensitive data before sending to AI
        safe_user_message = redact(user_message) if contains_secrets(user_message) else user_message
        messages.append({"role": "user", "content": safe_user_message})

        # AI is GUIDE ONLY - no encryption/decryption execution
        ai_response = ""
        if settings.OPENAI_API_KEY:
            # Call OpenAI with intelligent conversational model
            response = openai.chat.completions.create(
                model="gpt-4o",  # Most intelligent model for smart guidance
                messages=messages,
                temperature=0.8,  # Higher for more natural, conversational responses
                max_tokens=2000,  # Generous for detailed explanations
                presence_penalty=0.3,  # Encourage exploring topics
                frequency_penalty=0.4  # Reduce repetition
            )
            ai_response = response.choices[0].message.content
        else:
            ai_response = "AI Assistant is not configured (missing OPENAI_API_KEY). However, I can still guide you! Use the Encrypt or Decrypt pages in the navigation menu to perform cryptographic operations."
        
        # Return pure conversational response - AI guides, doesn't execute
        return ChatResponse(
            response=ai_response,
            action="guide"
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
