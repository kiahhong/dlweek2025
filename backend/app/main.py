import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.api.routes import router
from app.config import settings
from app.services.topic_modeler import TopicModeler
from app.services.llm import LLMPrompts
from app.services.search import Search

from google import genai

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup
    gemini_api: str = settings.GEMINI_API
    serpapi_api = settings.SERPAPI_API

    # logger.info(f'PyTorch using device: {settings.DEVICE}')

    # model_path: str = os.path.join(os.getcwd(), 'app', 'artifacts', settings.MODEL_PATH)

    # Load the models necessary
    # checkpoint = torch.load(model_path, map_location=torch.device(settings.DEVICE), weights_only=True)

    # Set to eval mode

    router.llm = genai.Client(api_key=gemini_api)

    router.llm_prompts = LLMPrompts()

    router.search = Search(serpapi_api)

    router.topic_modeler = TopicModeler(num_topics=5)

    logger.info("Hello There!")

    yield


app = FastAPI(lifespan=lifespan)

app.include_router(router)
