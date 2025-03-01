from serpapi import GoogleSearch


class Search:
    def __init__(self, api_key):
        self.params = None
        self.__api_key = api_key

    def set_params(self, query, location):
        self.params = {
            "q": query,
            "location": location,
            "hl": "en",
            "gl": "us",
            "google_domain": "google.com",
            "api_key": self.__api_key,
        }

    def get_params(self):
        return self.params

    def get_search(self):
        search = GoogleSearch(self.params)
        results = search.get_dict()

        return results
