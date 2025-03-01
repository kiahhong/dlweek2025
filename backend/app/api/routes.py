from fastapi import APIRouter, Depends, HTTPException
from typing import List
import logging
import nltk
from nltk.tokenize import sent_tokenize


import json

from google.genai import types, Client

from app.services.topic_modeler import TopicModeler
from app.services.llm import LLMPrompts
from app.services.search import Search
from app.artifacts.BiasClassifier import BiasClassifier
from app.artifacts.GenImgClassifier import GenImgClassifier

from app.models.TopicLLMOutput import TopicLLMOutput
from app.models.FeedbackOutput import FeedbackOutput
from app.models.FakenewsRequest import FakenewsRequest
from app.models.ReferenceStatement import (
    ReferenceStatement,
    ReferenceStatementsResponse,
)

import redis
from app.models.ClickbaitRequest import ClickbaitRequest, ClickbaitOutput
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import base64
from io import BytesIO

router = APIRouter()

logger = logging.getLogger("uvicorn.error")

nltk.download("punkt_tab", quiet=True)


async def get_llm() -> Client:
    """
    Dependency function to get LLM
    """
    return router.llm


async def get_llm_prompts() -> LLMPrompts:
    """
    Dependency function to get LLM
    """
    return router.llm_prompts


async def get_search() -> Search:
    """
    Dependency function to get SerpAPI search
    """
    return router.search


async def get_topic_modeler() -> TopicModeler:
    """
    Dependency function to get Topic Modeler
    """
    return router.topic_modeler


async def get_bias_classifier() -> BiasClassifier:
    """
    Dependency function to get Bias Classifier
    """
    return router.bias_classifier


async def get_redis() -> redis.Redis:
    """
    Dependency function to get Redis client
    """
    return router.redis
async def get_genimg_classifier() -> GenImgClassifier:
    """
    Dependency function to get GenImg Classifier
    """
    return router.genimg_classifier


@router.post(
    "/references",
    tags=["Fake news detector"],
    response_model=ReferenceStatementsResponse,
)
async def get_references(
    payload: dict,
    modeler: TopicModeler = Depends(get_topic_modeler),
    llm: Client = Depends(get_llm),
    llm_prompts: LLMPrompts = Depends(get_llm_prompts),
    search: Search = Depends(get_search),
    redis: redis.Redis = Depends(get_redis),
) -> ReferenceStatementsResponse:
    url = payload.get("url")
    print(url, "\n\nurl\n\n")
    
    # Check cache first
    if url:
        cached_response = redis.get(url)
        if cached_response:
            logger.info(f"Cache hit for URL: {url}")
            return json.loads(cached_response)
    
    documents = payload.get("documents")

    modeler.set_model_params(
        iterations=100,
        alpha="symmetric",
    )

    # Set dictionary filtering parameters
    modeler.set_filter_params(no_below=1, no_above=0.9)

    # Process the text and build the model
    modeler.fit(documents)

    # Get topic keywords
    lda_topic_keywords = modeler.get_topic_keywords()

    output = llm.models.generate_content(
        model="gemini-2.0-flash-exp",
        contents=f"[{', '.join(lda_topic_keywords)}]",
        config=types.GenerateContentConfig(
            system_instruction=llm_prompts.topic_prompt,
            temperature=0.0,
            max_output_tokens=1000,
            response_mime_type="application/json",
            response_schema=TopicLLMOutput,
        ),
    )

    if output.text:
        try:
            output = json.loads(output.text.replace("\\r\\n", ""))
            structured_output_topics = output["topics"]
        except Exception as e:
            print(e)
            pass

    # Get context based on structured_output_topics
    context = []
    for topic in structured_output_topics:
        search.set_params(query=topic, location="Singapore")

        search_results = search.get_search()

        # Extract content and URLs from organic results
        results_with_refs = []
        if "organic_results" in search_results:
            for result in search_results["organic_results"]:
                results_with_refs.append(
                    {
                        "content": result.get("snippet", ""),
                        "title": result.get("title", ""),
                        "url": result.get("link", ""),
                    }
                )

    # Add to context
    context.append({"topic": topic, "context": results_with_refs})

    supported_statements = []

    for doc_index, document in enumerate(documents):
        sentences = sent_tokenize(document)

        for sent_index, sentence in enumerate(sentences):
            # Skip very short sentences as they're unlikely to be substantive claims
            if len(sentence.split()) < 5:
                continue

            supporting_references = []

            for topic_data in context:
                for ref in topic_data["context"]:
                    sent_words = set(
                        word.lower() for word in sentence.split() if len(word) > 3
                    )
                    content = ref["content"].lower()
                    matches = sum(1 for word in sent_words if word in content)

                    if matches >= 3 or (
                        matches / len(sent_words) >= 0.3 if sent_words else False
                    ):
                        if ref["url"] not in supporting_references:
                            supporting_references.append(ref["url"])

            if supporting_references:
                supported_statements.append(
                    ReferenceStatement(
                        document=doc_index,
                        sentenceIdx=sent_index,
                        sentence=sentence,
                        references=supporting_references,
                    )
                )

    # Convert supported_statements to a list of dictionaries
    reference_statements_dicts = [
        {
            "document": stmt.document,
            "sentenceIdx": stmt.sentenceIdx,
            "sentence": stmt.sentence,
            "references": stmt.references,
        }
        for stmt in supported_statements
    ]

    output = llm.models.generate_content(
        model="gemini-2.0-flash-exp",
        contents=json.dumps(
            {
                "unprocessed_text": " ".join(documents),
                "reference_statements": reference_statements_dicts,
            }
        ),
        config=types.GenerateContentConfig(
            system_instruction=llm_prompts.feedback_prompt,
            temperature=0.0,
            max_output_tokens=1000,
            response_mime_type="application/json",
            response_schema=FeedbackOutput,
        ),
    )

    if output.text:
        try:
            output = json.loads(output.text.replace("\\r\\n", ""))
            structured_output_analysis = output["analysis"]
            structured_output_sentiment = output["sentiment"]
        except Exception as e:
            print(e)
            pass

    response = ReferenceStatementsResponse(
        statements=supported_statements,
        analysis=structured_output_analysis,
        sentiment=structured_output_sentiment,
    )

    # Cache the response with the URL as key
    if url:
        redis.setex(
            url,
            3600,  # cache for 1 hour
            json.dumps(response.dict())
        )
        logger.info(f"Cached response for URL: {url}")

    return response


@router.post(
    "/bias",
    tags=["Bias Classifier"],
    response_model=str,
)
async def get_biasness(
    payload: dict, bias_classifier: BiasClassifier = Depends(get_bias_classifier)
):
    text = payload.get("text")
    url = payload.get("url")    
    prediction = bias_classifier.predict(text, url)
    print(prediction)
    return prediction

# dummy endpoint that just prints the payload
@router.post("/echo", tags=["Echo"])
async def echo(payload: dict):
    print(payload)
    return payload

@router.get("/cache", tags=["Debug"])
async def get_cache(redis: redis.Redis = Depends(get_redis)):
    # Get all keys
    keys = redis.keys('*')
    cache_contents = {}
    
    # Get values for all keys
    for key in keys:
        value = redis.get(key)
        ttl = redis.ttl(key)
        cache_contents[key] = {
            'value': json.loads(value) if value else None,
            'ttl': ttl
        }
    
    return {
        'keys_count': len(keys),
        'contents': cache_contents
    }


@router.post("/imageClassify", tags=["Generated Image Classifier"], response_model=str)
async def get_genimgness(
    payload: dict,
    genimg_classifier: GenImgClassifier = Depends(get_genimg_classifier)
):
    base64_image = payload.get("image")
    if not base64_image:
        raise HTTPException(status_code=400, detail="No image provided")
    
    try:
        # Convert base64 to bytes
        image_data = base64.b64decode(base64_image)
        return genimg_classifier.predict_base64(image_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")


@router.post(
    "/clickbait",
    tags=["Article clickbait detector"],
    response_model=ClickbaitOutput,
)
async def get_clickbait(
    request: ClickbaitRequest,
    llm: Client = Depends(get_llm),
    llm_prompts: LLMPrompts = Depends(get_llm_prompts),
) -> JSONResponse:
    request_article = request.article
    request_body = request.body

    output = llm.models.generate_content(
        model="gemini-2.0-flash-exp",
        contents=json.dumps(
            {
                "article": request_article,
                "body": request_body,
            }
        ),
        config=types.GenerateContentConfig(
            system_instruction=llm_prompts.article_prompt,
            temperature=0.0,
            max_output_tokens=1000,
            response_mime_type="application/json",
            response_schema=ClickbaitOutput,
        ),
    )

    if output.text:
        try:
            output = json.loads(output.text.replace("\\r\\n", ""))
            structured_output_clickbait = output["clickbait"]
            structured_output_new_header = output["new_header"]
        except Exception as e:
            print(e)
            pass
    
    print(structured_output_clickbait, structured_output_new_header)
    return JSONResponse(
        content={
            "clickbait": structured_output_clickbait,
            "new_header": structured_output_new_header
        },
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    )

