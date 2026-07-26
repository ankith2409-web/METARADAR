import re
import time
import logging
from typing import Dict, Tuple
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

logger = logging.getLogger("metaradar.security")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    OWASP Recommended Enterprise Security Headers Middleware.
    Enforces Strict HSTS, CSP, X-Frame-Options, X-Content-Type-Options, and Referrer Policy.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com data:; "
            "img-src 'self' data: https:; "
            "connect-src 'self' http://localhost:8000 http://127.0.0.1:8000;"
        )
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        return response


class RateLimiter:
    """
    In-Memory Sliding Window Rate Limiter against DDoS & Brute-Force Attacks.
    """
    def __init__(self, requests_per_minute: int = 120):
        self.requests_per_minute = requests_per_minute
        self.ip_history: Dict[str, list] = {}

    def is_allowed(self, client_ip: str) -> Tuple[bool, int]:
        now = time.time()
        window_start = now - 60

        if client_ip not in self.ip_history:
            self.ip_history[client_ip] = [now]
            return True, self.requests_per_minute - 1

        # Filter timestamps outside rolling window
        self.ip_history[client_ip] = [t for t in self.ip_history[client_ip] if t > window_start]
        
        if len(self.ip_history[client_ip]) >= self.requests_per_minute:
            return False, 0

        self.ip_history[client_ip].append(now)
        remaining = self.requests_per_minute - len(self.ip_history[client_ip])
        return True, remaining


class InputSanitizer:
    """
    Sanitizes user input parameters to neutralize XSS, SQLi, and Command Injection payloads.
    """
    @staticmethod
    def sanitize_string(text: str, max_length: int = 500) -> str:
        if not text:
            return ""
        # Strip potential HTML/Script tags
        clean = re.sub(r'<[^>]*>', '', text)
        # Neutralize common injection patterns
        clean = re.sub(r'[;\']|--|\/\*', '', clean)
        return clean[:max_length].strip()

    @staticmethod
    def validate_api_key(key: str) -> bool:
        """
        Validates API key format (e.g. OpenAI sk-..., sk-proj-..., or Anthropic sk-ant-...)
        """
        if not key:
            return False
        key = key.strip()
        if len(key) < 20 or len(key) > 200:
            return False
        return bool(re.match(r'^(sk-[a-zA-Z0-9_-]+|sk-proj-[a-zA-Z0-9_-]+|sk-ant-[a-zA-Z0-9_-]+)$', key))

    @staticmethod
    def mask_api_key(key: str) -> str:
        if not key or len(key) < 10:
            return "Unconfigured"
        return f"{key[:7]}****...****{key[-4:]}"
