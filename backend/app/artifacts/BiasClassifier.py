import torch
from transformers import AutoTokenizer, DistilBertForSequenceClassification


class BiasClassifier:
    def __init__(self, device):  # Fixed __init__ method
        self.device = device
        self.tokenizer = AutoTokenizer.from_pretrained("distilled_biasBERT")
        self.model = DistilBertForSequenceClassification.from_pretrained(
            "distilled_biasBERT"
        ).to(self.device)
        self.model.eval()  # Set model to evaluation mode

    def predict(self, text):
        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            padding="max_length",
            max_length=512,
        )
        inputs = {key: val.to(self.device) for key, val in inputs.items()}
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            prediction = torch.argmax(logits, dim=-1).item()
        return prediction
