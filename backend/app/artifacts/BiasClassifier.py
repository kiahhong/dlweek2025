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

    def predict(self, text):
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
        return probabilities
