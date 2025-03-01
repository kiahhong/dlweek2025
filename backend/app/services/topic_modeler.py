import gensim
import gensim.corpora as corpora
from gensim.models import LdaModel
from gensim.utils import simple_preprocess
from nltk.corpus import stopwords
import nltk


class TopicModeler:
    def __init__(
        self,
        num_topics=5,
        passes=5,
        random_state=42,
        min_word_length=3,
        preprocess_params=None,
    ):
        # Model parameters
        self.num_topics = num_topics
        self.passes = passes
        self.random_state = random_state
        self.min_word_length = min_word_length

        # Initialize empty model components
        self.lda_model = None
        self.corpus = None
        self.id2word = None
        self.processed_texts = None

        # Download stopwords if not already
        try:
            self.stop_words = stopwords.words("english")
        except LookupError:
            nltk.download("stopwords")
            self.stop_words = stopwords.words("english")

        # Custom preprocessing parameters
        self.preprocess_params = preprocess_params or {}

    def preprocess_text(self, text):
        """Tokenize and clean text"""
        # Handle empty or None input
        if not text:
            return ["fallback_term"]

        # Apply simple preprocessing
        tokens = simple_preprocess(text, **self.preprocess_params)

        # Remove stopwords and short words
        filtered_tokens = [
            token
            for token in tokens
            if token not in self.stop_words and len(token) > self.min_word_length
        ]

        # If all tokens were filtered out, keep at least some of the original tokens
        if not filtered_tokens and tokens:
            # Keep longer tokens even if they're stopwords
            filtered_tokens = [
                token for token in tokens if len(token) > self.min_word_length
            ]

            # If still empty, just use some of the original tokens
            if not filtered_tokens and tokens:
                filtered_tokens = tokens[:5]  # Take first 5 tokens as fallback

        return filtered_tokens

    def preprocess_documents(self, documents):
        """Process a list of documents"""
        self.processed_texts = [self.preprocess_text(doc) for doc in documents]
        return self.processed_texts

    def create_dictionary_and_corpus(self):
        """Create the dictionary and corpus from processed texts"""
        if not self.processed_texts:
            raise ValueError(
                "No processed texts available. Run preprocess_documents first."
            )

        # Create dictionary

        self.id2word = corpora.Dictionary(self.processed_texts)

        # Create corpus and check it's not empty
        self.corpus = [self.id2word.doc2bow(text) for text in self.processed_texts]

        # Debug: Check corpus
        corpus_sizes = [len(doc) for doc in self.corpus]

        # Handle empty corpus
        if all(len(doc) == 0 for doc in self.corpus):
            print("Warning: Corpus is empty. Using original tokens without filtering.")
            # Recreate dictionary without filtering
            self.id2word = corpora.Dictionary(self.processed_texts)
            self.corpus = [self.id2word.doc2bow(text) for text in self.processed_texts]

            # If still empty, add a fallback term
            if all(len(doc) == 0 for doc in self.corpus):
                print("Warning: Corpus still empty. Adding fallback term.")
                self.processed_texts = [
                    [doc[0] if doc else "fallback"] for doc in self.processed_texts
                ]
                self.id2word = corpora.Dictionary(self.processed_texts)
                self.corpus = [
                    self.id2word.doc2bow(text) for text in self.processed_texts
                ]

        return self.id2word, self.corpus

    def set_model_params(self, **kwargs):
        """Update model parameters before building"""
        valid_attrs = [
            "num_topics",
            "passes",
            "random_state",
            "alpha",
            "eta",
            "decay",
            "offset",
            "iterations",
        ]

        for key, value in kwargs.items():
            if key in valid_attrs:
                setattr(self, key, value)
            else:
                print(f"Warning: {key} is not a valid LDA model parameter")

        return self

    def set_filter_params(self, no_below=2, no_above=0.85, keep_n=100000):
        """Set parameters for dictionary filtering"""
        self.filter_extremes_params = {
            "no_below": no_below,
            "no_above": no_above,
            "keep_n": keep_n,
        }
        return self

    def build_lda_model(self):
        """Build LDA model with current parameters"""
        if self.corpus is None or self.id2word is None:
            raise ValueError(
                "Corpus and dictionary must be created before building the model"
            )

        # Build LDA model with base parameters and any additional ones
        self.lda_model = LdaModel(
            corpus=self.corpus,
            id2word=self.id2word,
            num_topics=self.num_topics,
            random_state=self.random_state,
            passes=self.passes,
            alpha="auto",
            per_word_topics=True,
        )

        return self.lda_model

    def extract_topics(self, num_words=10, formatted=False):
        """Extract topics from the model"""
        if not self.lda_model:
            raise ValueError("LDA model has not been built yet")

        topics = self.lda_model.show_topics(
            num_topics=self.num_topics, num_words=num_words, formatted=formatted
        )

        return topics

    def get_topic_keywords(self, topics=None):
        """Extract keywords from topics"""
        if topics is None:
            topics = self.extract_topics(formatted=False)

        keywords = []
        for topic in topics:
            words = [word[0] for word in topic[1]]
            keywords.extend(words)

        return list(set(keywords))  # Remove duplicates

    def get_document_topics(self, doc_index=None, doc_text=None):
        """Get topic distribution for a document"""
        if self.lda_model is None:
            raise ValueError("LDA model has not been built yet")

        if doc_index is not None:
            # Get topics for an existing document in the corpus
            return self.lda_model.get_document_topics(self.corpus[doc_index])
        elif doc_text is not None:
            # Process new text and get its topics
            processed = self.preprocess_text(doc_text)
            bow = self.id2word.doc2bow(processed)
            return self.lda_model.get_document_topics(bow)
        else:
            raise ValueError("Either doc_index or doc_text must be provided")

    def fit(self, documents):
        """Complete pipeline from documents to topics"""
        self.preprocess_documents(documents)
        self.create_dictionary_and_corpus()
        self.build_lda_model()
        return self

    def analyze_text(self, text):
        """Extract topics from a single text document"""
        if not self.lda_model:
            # Try to build a model from just this document
            self.fit([text])

        processed = self.preprocess_text(text)
        bow = self.id2word.doc2bow(processed)

        # Get topics
        doc_topics = self.lda_model.get_document_topics(bow)

        # Return the most relevant keywords
        return self.get_topic_keywords()
