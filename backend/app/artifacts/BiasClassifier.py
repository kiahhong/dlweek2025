import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification


class BiasClassifier:
    def __init__(self, device):  # Fixed __init__ method
        self.device = device
        self.tokenizer = AutoTokenizer.from_pretrained("KiahHong/distilled-bias-bert")
        self.model = AutoModelForSequenceClassification.from_pretrained(
            "KiahHong/distilled-bias-bert"
        ).to(self.device)
        self.model.eval()  # Set model to evaluation mode
        self.classes = ["left", "center", "right"]
        self.news_outlets= {
            "left": [
                'theguardian.com',
                'huffpost.com',
                'dailystar.co.uk',
                'npr.org',
                'motherjones.com',
                'aljazeera.com',
                'cnn.com',
                'msnbc.com',
                'democraticunderground.com',
                'salon.com',
                'independent.co.uk',
                'politico.com',
                'newyorker.com',
                'vox.com',
                'vice.com',
                'buzzfeednews.com',
                'theverge.com',
                'nationofchange.org',
                'crooksandliars.com',
                'theintercept.com',
                'slate.com',
                'britannica.com',
                'progressive.org',
                'rawstory.com',
                'commondreams.org',
                'jacobinmag.com',
                'thenation.com',
                'truthout.org',
                'dissentmagazine.org',
                'portside.org',
                'inthesetimes.com',
                'prospect.org',
                'dailykos.com',
                'theamericanprospect.org',
                'alternet.org',
                'rabble.ca', #Canadian left
                'socialistworker.co.uk',
                'peoplesworld.org',
                'counterpunch.org'
            ],
            "right": [
                "foxnews.com",
                "dailystormer.su",
                'breitbart.com',
                'nationalreview.com',
                'washingtonexaminer.com',
                'newsmax.com',
                'theepochtimes.com',
                'dailycaller.com',
                'townhall.com',
                'pjmedia.com',
                'americanthinker.com',
                'theblaze.com',
                'wnd.com',
                'hannity.com',
                'cnsnews.com',
                'redstate.com',
                'thefederalist.com',
                'infowars.com',
                'libertynews.com',
                'realclearpolitics.com',
                'theamericanconservative.com',
                'christianpost.com',
                'thedailybeast.com',
                'foxbusiness.com',
                'oann.com',
                'washingtontimes.com',
                'spectator.us',
                'dailywire.com',
                'summit.news',
                'westernjournal.com',
                'newsbusters.org',
                'bongino.com',
                'gatewaypundit.com',
                'judicialwatch.org',
                'zerohedge.com', #Libertarian right
                'mises.org', #Libertarian Right
                'fee.org', #Libertarian right
                'canadafreepress.com', #Canadian Right
                'jihadwatch.org'
            ],

            "center": [
                "bbc.com",
                "reuters.com",
                "apnews.com",
                "nytimes.com",
                "wsj.com",
                'usatoday.com',
                'cnbc.com',
                'latimes.com',
                'bloomberg.com',
                'economist.com',
                'smithsonianmag.com',
                'time.com',
                'forbes.com',
                'spectator.co.uk',
                'axios.com',
                'thedrum.com',
                'straitstimes.com',
                'channelnewsasia.com',
                'todayonline.com',
                'scmp.com',
                'japantimes.co.jp',
                'koreatimes.co.kr',
                'france24.com',
                'dw.com',
                'swissinfo.ch',
                'aljazeera.com',
                'euronews.com',
                'cbc.ca',
                'australian.com.au',
                'thehindu.com',
                'timesofindia.indiatimes.com',
                'atlanticcouncil.org',
                'cfr.org',
                'brookings.edu',
                'pewresearch.org',
                'ft.com',
                'csmonitor.com', #Christian Science Monitor
                'nationalgeographic.com',
                'science.org', #AAAS
                'nature.com',
                'newscientist.com',
                'technologyreview.com', #MIT
                'foreignaffairs.com',
                'project-syndicate.org',
                'cfr.org',
                'heritage.org', #While mostly right leaning, they do produce factual research.
                'cato.org', #Libertarian leaning, but often factual.
                'cfr.org',
                'rand.org',
                'cfr.org',
                'ips-journal.eu',
                'al-monitor.com',
                'middleeasteye.net',
                'jpost.com', #Jerusalem Post
                'haaretz.com',
                'theglobeandmail.com', #Canadian Centrist
                'elpais.com', #Spanish Centrist
                'lemonde.fr', #French Centrist
                'businesstimes.com.sg', #Singapore business news
                'mothership.sg', #Singaporean online news, often with a focus on social issues. Leans center-left on social issues, but mostly centrist.
                'mustsharenews.com', #Singaporean online news, leans centrist.
                '8world.com', #Singapore Chinese-language news, broadly centrist.
                'zaobao.com.sg', #Singapore Chinese-language news, broadly centrist.
                'beritaharian.sg', #Singapore Malay-language news, broadly centrist.
                'tamilmurasu.com.sg', #Singapore Tamil-language news, broadly centrist.
            ]
        }


    def predict(self, text, url):
        # if url contains any of the news outlets, return the bias class. url will be much longer with all the routes and shit u need to parse the key
        for bias_class in self.classes:
            if any(news_outlet in url for news_outlet in self.news_outlets[bias_class]):
                return bias_class
        
        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            padding="max_length",
            max_length=512,
        )
        inputs = {key: val.to(self.device) for key, val in inputs.items()}
        inputs.pop("token_type_ids", None)
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=-1)[0].tolist()
        
        # get max probability
        max_probability = max(probabilities)
        max_index = probabilities.index(max_probability)
        return self.classes[max_index]
