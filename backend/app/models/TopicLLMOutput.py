from typing import List
from pydantic import BaseModel


class TopicLLMOutput(BaseModel):
    topics: List[str]
