from pydantic import BaseModel
from typing import List


class ReferenceStatement(BaseModel):
    document: int
    sentenceIdx: int
    sentence: str
    references: List[str]


class ReferenceStatementsResponse(BaseModel):
    statements: List[ReferenceStatement]
