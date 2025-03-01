[![GitHub contributors](https://img.shields.io/github/contributors/kiahhong/dlweek2025.svg)](https://github.com/kiahhong/dlweek2025/graphs/contributors)
![GitHub stars](https://img.shields.io/github/stars/kiahhong/dlweek2025.svg)
[![MIT license](https://img.shields.io/github/license/kiahhong/dlweek2025.svg)](https://github.com/kiahhong/dlweek2025/blob/main/LICENSE)

### About the Project
X to Doubt is a cutting-edge browser extension that harnesses the power of deep learning to address critical challenges in today’s rapidly evolving digital media landscape. Designed to empower users with clarity and confidence, it offers advanced tools to:

- Identify Fake News: Leverage AI-driven analysis to distinguish credible information from misinformation.
- Detect Deepfakes: Uncover manipulated media with state-of-the-art deepfake detection technology.
- Analyze Political Bias: Gain insights into the potential biases of news sources and articles.
- Combat Clickbait: Filter out sensationalist headlines and focus on meaningful content.

With X to Doubt, navigate the digital world with trust and precision.

### Built with
- [Plasmo](https://docs.plasmo.com/)
- [React](https://react.dev/)
- [Pytorch](https://pytorch.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Gemini](https://cloud.google.com/vertex-ai?hl=en)
- [SerpAPI](https://serpapi.com/)

### Open Source models developed
| Base Model Arch | Finetuned/Distilled Model | Use Case |
| -------------- | ------------------------- | -------- |
| [politicalBiasBert](https://huggingface.co/bucketresearch/politicalBiasBERT) | [distilled-bias-bert](https://huggingface.co/KiahHong/distilled-bias-bert) | Politial Bias Classification |
| [Vision Transformer (ViT) ](https://huggingface.co/google/vit-base-patch16-224) | [ViT for Deepfake](https://huggingface.co/O-ww-O/custom-vit) | Deepfake Detection |

### Getting Started
1. Clone the Repo
```sh
git clone https://github.com/kiahhong/dlweek2025
```

2. Start the plasmo dev server
```sh
pnpm dev
```

3. Visit the Extension Settings Page from your Chromium Browser.
```sh
chrome://extensions/
```
   
4. Enable Developer Mode.
   
5. Load and Enable the extension from the `extension` folder in this repo.

6. cd into backend
```sh
cd backend/
```

7. start the backend
```
docker-compose up
```
