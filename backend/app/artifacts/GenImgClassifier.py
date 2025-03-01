import torch
from transformers import ViTForImageClassification
from torchvision import transforms
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
import base64

class GenImgClassifier:
    def __init__(self, device):
        self.device = device
        self.model = ViTForImageClassification.from_pretrained("O-ww-O/custom-vit", num_labels=2, ignore_mismatched_sizes=True).to(self.device)
        self.model.eval()

    def add_clown_emoji(self, image):
        # Convert image to RGB if it isn't already
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Create a copy of the image
        new_image = image.copy()
        
        # Add a thick red border
        draw = ImageDraw.Draw(new_image)
        border_width = max(int(min(image.width, image.height) * 0.02), 10)  # At least 10px, or 2% of image size
        
        # Draw border (all four sides)
        draw.rectangle(
            [(0, 0), (image.width - 1, image.height - 1)],  # -1 to stay within image bounds
            outline=(255, 0, 0),  # Red
            width=border_width
        )
        
        # Add diagonal lines in corners for emphasis
        corner_size = border_width * 3
        
        # Top-left corner
        draw.line([(0, 0), (corner_size, corner_size)], fill=(255, 0, 0), width=border_width)
        # Top-right corner
        draw.line([(image.width, 0), (image.width - corner_size, corner_size)], fill=(255, 0, 0), width=border_width)
        # Bottom-left corner
        draw.line([(0, image.height), (corner_size, image.height - corner_size)], fill=(255, 0, 0), width=border_width)
        # Bottom-right corner
        draw.line([(image.width, image.height), (image.width - corner_size, image.height - corner_size)], fill=(255, 0, 0), width=border_width)
        
        return new_image

    def image_to_base64(self, image):
        buffered = BytesIO()
        image.save(buffered, format="JPEG")
        return base64.b64encode(buffered.getvalue()).decode()

    def predict_base64(self, image_data):
        try:
            # Convert bytes to PIL Image
            image = Image.open(BytesIO(image_data))
            
            # Convert to RGB for prediction
            rgb_image = image.convert('RGB')
            prediction = self.predict_from_pil(rgb_image)
            
            if prediction == "fake":
                # Add clown emoji and convert back to base64
                modified_image = self.add_clown_emoji(image)
                modified_base64 = self.image_to_base64(modified_image)
            else:
                modified_base64 = None
                
            return prediction, modified_base64
            
        except Exception as e:
            print(f"Error processing image: {str(e)}")
            return "error", None

    def predict_from_pil(self, image):
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
        try:
            image = Image.open(path)
            return self.predict_from_pil(image)
        except Exception as e:
            print(f"Error loading image from path: {str(e)}")
            return "error"