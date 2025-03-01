from pydantic import BaseModel


class FeedbackOutput(BaseModel):
    analysis: str
    sentiment: str
