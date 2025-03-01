from pydantic import BaseModel


class ClickbaitRequest(BaseModel):
    article: str
    body: str

class ClickbaitOutput(BaseModel):
    clickbait: str
    new_header: str
