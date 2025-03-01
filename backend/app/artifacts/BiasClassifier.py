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
                'rawstory.com'     
            ],
            "right": [
                "foxnews.com",  # Fox News
                "dailystormer.su",  # Daily Stormer
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
                'washingtonpost.com', 
                'realclearpolitics.com', 
                'theamericanconservative.com', 
                'christianpost.com', 
                'thedailybeast.com', 
                'foxbusiness.com' 
            ],

            "center": [
                "bbc.com",         
                "reuters.com",     
                "apnews.com",      
                "nytimes.com",    
                "washingtonpost.com", 
                "wsj.com",        
                'usatoday.com',    
                'cnbc.com',       
                'latimes.com',    
                'bloomberg.com',  
                'npr.org',        
                'theguardian.com', 
                'independent.co.uk', 
                'economist.com',  
                'smithsonianmag.com', 
                'time.com',       
                'forbes.com',     
                'spectator.co.uk', 
                'nytimes.com',    
                'cnbc.com',       
                'axios.com',      
                'politico.com',   
                'thedrum.com',    
                'reuters.com'     
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
