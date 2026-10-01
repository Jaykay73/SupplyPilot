from typing import Any
from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.llm.mock_model import MockChatModel


def get_chat_model(temperature: float = 0.0) -> Any:
    """Returns configured ChatModel based on environment (DeepSeek, OpenAI, or Mock)."""
    provider = settings.LLM_PROVIDER.lower()

    if provider == "mock" or not settings.DEEPSEEK_API_KEY:
        if not settings.DEEPSEEK_API_KEY and provider != "mock":
            logger.warning("DEEPSEEK_API_KEY not configured. Falling back to deterministic MockChatModel.")
        return MockChatModel()

    if provider == "deepseek":
        try:
            from langchain_community.chat_models import ChatOpenAI
            return ChatOpenAI(
                model=settings.LLM_MODEL,
                openai_api_key=settings.DEEPSEEK_API_KEY,
                openai_api_base="https://api.deepseek.com",
                temperature=temperature,
            )
        except Exception as e:
            logger.error(f"Error initializing DeepSeek provider: {e}. Falling back to MockChatModel.")
            return MockChatModel()

    return MockChatModel()
