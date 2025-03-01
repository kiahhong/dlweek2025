import torch
from transformers import ViTForImageClassification
from torchvision import transforms
from PIL import Image

class GenImgClassifier:
    def __init__(self, device): # Fixed __init__ method
        self.device = device
        self.model = ViTForImageClassification.from_pretrained(model_name, num_labels=2, ignore_mismatched_sizes=True).to(self.device)
        self.model.eval() # set model to evaluation mode

    def predict(self, image_path):
        img = Image.open(image_path).convert("RGB")

        val_transforms = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
        ])
        img_tensor = val_transforms(img).unsqueeze(0).to(self.device)
        with torch.no_grad():
            outputs = self.model(img_tensor)
            logits = outputs.logits
            pred = torch.argmax(logits, dim=1).item()
        class_names = ['fake','real']
        label = class_names[pred]
        return label