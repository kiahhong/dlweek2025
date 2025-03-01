import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.api.routes import router
from app.config import settings
from app.services.topic_modeler import TopicModeler
from app.services.llm import LLMPrompts
from app.services.search import Search
from app.artifacts.BiasClassifier import BiasClassifier

from google import genai

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup
    gemini_api: str = settings.GEMINI_API
    serpapi_api = settings.SERPAPI_API

    logger.info(f"PyTorch using device: {settings.DEVICE}")

    router.llm = genai.Client(api_key=gemini_api)
    router.llm_prompts = LLMPrompts()
    router.search = Search(serpapi_api)
    router.topic_modeler = TopicModeler(num_topics=5)

    router.bias_classifier = BiasClassifier(settings.DEVICE)

    logger.info("Hello There!")

    yield


app = FastAPI(lifespan=lifespan)

app.include_router(router)
