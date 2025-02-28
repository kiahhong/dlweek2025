from fastapi import APIRouter, HTTPException, Depends, Query
import logging
from typing import List
import nltk
from nltk.tokenize import sent_tokenize

import json

from google.genai import types, Client

from app.services.topic_modeler import TopicModeler
from app.services.llm import LLMPrompts
from app.services.search import Search

from app.models.TopicLLMOutput import TopicLLMOutput

router = APIRouter()

logger = logging.getLogger("uvicorn.error")

nltk.download("punkt", quiet=True)


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


@router.post("/topics", tags=["Fake news detector"], response_model=List[str])
async def get_topics(
    documents: List[str],
    modeler: TopicModeler = Depends(get_topic_modeler),
    llm: Client = Depends(get_llm),
    llm_prompts: LLMPrompts = Depends(get_llm_prompts),
    search: Search = Depends(get_search),
) -> List[str]:
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

            # Check each sentence against all search results
            for topic_data in context:
                for ref in topic_data["context"]:
                    # Create a set of significant words from the sentence (excluding stopwords)
                    sent_words = set(
                        word.lower() for word in sentence.split() if len(word) > 3
                    )

                    # Count how many significant words from the sentence appear in the reference
                    content = ref["content"].lower()
                    matches = sum(1 for word in sent_words if word in content)

                    # If enough words match (threshold can be adjusted)
                    if matches >= 3 or (
                        matches / len(sent_words) >= 0.3 if sent_words else False
                    ):
                        if ref["url"] not in supporting_references:
                            supporting_references.append(ref["url"])

            # If we found supporting references, add to our results
            if supporting_references:
                supported_statements.append(
                    {
                        "document": doc_index,
                        "sentenceIdx": sent_index,
                        "sentence": sentence,
                        "references": supporting_references,
                    }
                )

    return supported_statements
