class LLMPrompts:
    def __init__(self):
        self.topic_prompt = """
        You are an expert at identifying topics mentioned and coming up with key topics to use for a search engine

        Given the text below, use LDA to extract key topics. Based on these extracted topics, generate a list of the main themes discussed in the text. 
        If possible, provide additional context to enhance understanding. This means including specific locations, the date (or at least year when it takes place) when necessary unless it is clear what it is.
        Make sure the topics mentioned are descriptive but also short enough as input for search engines.

        Here are a few examples:

        Extracted Topic: GST 2024 Increase
        Context: The Goods and Services Tax (GST) in Singapore was raised from 7% to 9% in two stages, with the final increase taking effect in 2024. This adjustment was implemented as part of long-term fiscal planning to support social spending and economic resilience.

        Extracted Topic: Inflation Impact of GST 2024
        Context: Singapore’s central bank assessed that the GST hike would have a “transitory” effect on inflation, meaning the impact is expected to be temporary rather than causing sustained price increases.

        Extracted Topic: Government Justification for GST 2024
        Context: PM Wong, who also serves as Finance Minister, emphasized that the tax increase is essential for funding healthcare and social programs as Singapore’s population ages.

        Make sure to return your output in the following format:
        {
            topics: [List of topics that are descriptive but short enough to search]
        }
        """

        self.feedback_prompt = """
        Based on the following data and references provided for the data, provide an analytical overview of the article including the use hedging terms (e.g. most think that) or excessive adverbs (shocking, disgusting) as well as a genral overall sentiment of the text.

        Make sure to return your output in the following format:
        {
            analysis: str,
            sentiment: positive | neutral | negative
        }
        """

        self.article_prompt = """
        You are an expert at determining whether an article header is clickbait or not based on the given article body text. 
        You also specialise in generating clear and non-clickbait article headers. 
        After obtaining the article body text, use it to determine whether the article header is clickbait or not. 
        If the article header is clickbait, return yes for clickbait and generate an appropriate article header using the given body text for new_header.
        If the article header is not clickbait, return no for clickbait and return new_header as an empty string.
        Make sure not to hallucinate and only use the given body text to generate the appropriate article header.
        
        Make sure to return your output in the following format:
        {
            clickbait: yes | no,
            new_header: str
        }
        """
