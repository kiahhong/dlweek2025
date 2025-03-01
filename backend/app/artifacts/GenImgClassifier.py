import torch
from transformers import ViTForImageClassification
from torchvision import transforms
from PIL import Image
from io import BytesIO

class GenImgClassifier:
    def __init__(self, device): # Fixed __init__ method
        self.device = device
        self.model = ViTForImageClassification.from_pretrained("O-ww-O/custom-vit", num_labels=2, ignore_mismatched_sizes=True).to(self.device)
        self.model.eval() # set model to evaluation mode

    def predict_base64(self, image_data):
        """Predict from base64 image data"""
        try:
            # Convert bytes to PIL Image
            image = Image.open(BytesIO(image_data))
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
                
            # Your existing image processing code here
            # Instead of Image.open(path), use the 'image' object directly
            
            return self.predict_from_pil(image)
        except Exception as e:
            print(f"Error processing image: {str(e)}")
            return "error"

    def predict_from_pil(self, image):
        """Your existing prediction logic here"""
        # Move your current prediction code here
        # But use the PIL image object directly instead of loading from path
        val_transforms = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
        ])
        img_tensor = val_transforms(image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            outputs = self.model(img_tensor)
            logits = outputs.logits
            pred = torch.argmax(logits, dim=1).item()
        class_names = ['fake','real']
        label = class_names[pred]
        return label

    def predict(self, path):
        """Keep original method for backward compatibility"""
        try:
            image = Image.open(path)
            return self.predict_from_pil(image)
        except Exception as e:
            print(f"Error loading image from path: {str(e)}")
            return "error"