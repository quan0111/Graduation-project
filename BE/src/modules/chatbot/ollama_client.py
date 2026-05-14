import asyncio
import json
import time
from typing import Dict, List, Optional
from urllib.error import URLError
from urllib.request import Request, urlopen

from src.core.config import settings


class OllamaUnavailable(RuntimeError):
    pass


class OllamaClient:
    _resolved_model: Optional[str] = None
    _resolved_model_checked_at: float = 0.0
    _MODEL_CACHE_SECONDS = 60

    @classmethod
    async def chat(cls, messages: List[Dict[str, str]]) -> str:
        model = await cls._resolve_model()
        if not model:
            raise OllamaUnavailable("Ollama has no local model. Pull one first, for example: ollama pull qwen3:4b")

        payload = {
            "model": model,
            "messages": messages,
            "stream": False,
            "think": False,
            "options": {
                "temperature": 0.2,
                "top_p": 0.8,
                "num_ctx": 2048,
                "num_predict": 90,
            },
        }
        data = await cls._post_json("/api/chat", payload)
        message = data.get("message") or {}
        content = message.get("content")
        if not content:
            raise OllamaUnavailable("Ollama returned an empty response")
        return str(content)

    @classmethod
    async def _resolve_model(cls) -> Optional[str]:
        configured = (settings.OLLAMA_MODEL or "").strip()
        if configured:
            return configured

        now = time.monotonic()
        if cls._resolved_model_checked_at and now - cls._resolved_model_checked_at < cls._MODEL_CACHE_SECONDS:
            return cls._resolved_model

        data = await cls._get_json("/api/tags")
        models = data.get("models") or []
        cls._resolved_model_checked_at = now
        if not models:
            cls._resolved_model = None
            return None
        first_model = models[0]
        cls._resolved_model = first_model.get("name") or first_model.get("model")
        return cls._resolved_model

    @classmethod
    async def _get_json(cls, path: str):
        return await asyncio.to_thread(cls._request_json, "GET", path, None)

    @classmethod
    async def _post_json(cls, path: str, payload: Dict):
        return await asyncio.to_thread(cls._request_json, "POST", path, payload)

    @staticmethod
    def _request_json(method: str, path: str, payload: Optional[Dict]):
        base_url = settings.OLLAMA_BASE_URL.rstrip("/")
        request_data = json.dumps(payload).encode("utf-8") if payload is not None else None
        request = Request(
            f"{base_url}{path}",
            data=request_data,
            headers={"Content-Type": "application/json"},
            method=method,
        )

        try:
            with urlopen(request, timeout=settings.OLLAMA_TIMEOUT_SECONDS) as response:
                raw = response.read().decode("utf-8")
        except (TimeoutError, URLError) as exc:
            raise OllamaUnavailable("Ollama is not reachable at configured URL") from exc

        try:
            return json.loads(raw)
        except json.JSONDecodeError as exc:
            raise OllamaUnavailable("Ollama returned invalid JSON") from exc
