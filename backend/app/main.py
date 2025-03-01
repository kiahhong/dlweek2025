import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import redis
import json

from app.api.routes import router
from app.config import settings
from app.services.topic_modeler import TopicModeler
from app.services.llm import LLMPrompts
from app.services.search import Search
from app.artifacts.BiasClassifier import BiasClassifier
from app.artifacts.GenImgClassifier import GenImgClassifier

from google import genai

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup
    gemini_api: str = settings.GEMINI_API
    serpapi_api = settings.SERPAPI_API

    logger.info(f"PyTorch using device: {settings.DEVICE}")

    # Initialize Redis
    redis_client = redis.Redis(
        host='redis',  # service name from docker-compose
        port=6379,
        decode_responses=True
    )
    
    router.redis = redis_client
    router.llm = genai.Client(api_key=gemini_api)
    router.llm_prompts = LLMPrompts()
    router.search = Search(serpapi_api)
    router.topic_modeler = TopicModeler(num_topics=5)
    router.bias_classifier = BiasClassifier(settings.DEVICE)
    router.genimg_classifier = GenImgClassifier(settings.DEVICE)

    logger.info("Hello There!")

    yield

    # Cleanup
    redis_client.close()


app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
    expose_headers=["*"],  # Expose all headers
    max_age=3600,  # Cache preflight requests for 1 hour
)

app.include_router(router)
