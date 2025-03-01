from typing import List
from pydantic import BaseModel


class FakenewsRequest(BaseModel):
    documents: List[str] = []
