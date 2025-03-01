import { useEffect, useState, useRef } from "react"
import type { PlasmoCSConfig } from "plasmo"
import right from "data-base64:~assets/right.png"
import left from "data-base64:~assets/left.png"
import center from "data-base64:~assets/center.png"

export const config: PlasmoCSConfig = {
    matches: ["*://*/*"]
}

const getBiasImage = (bias: string) => {
    if (bias === "right") return right;
    if (bias === "left") return left;
    if (bias === "center") return center;
    return center;
}

// Function to check if the page is a news article
const isNewsArticle = () => {
    const ogType = document.querySelector("meta[property='og:type']") as HTMLMetaElement;
    const publishedTime = document.querySelector("meta[property='article:published_time']");
    const articleTag = document.querySelector("article");
    const url = window.location.href;

    // URL patterns for news articles
    const articlePatterns = [/\/\d{4}\/\d{2}\/\d{2}\//, /\/news\//, /\/article\//];

    return ogType?.content === "article" || publishedTime || articleTag || articlePatterns.some(pattern => pattern.test(url));
}

// Function to replace full stops with smiley faces
const replaceText = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
        node.nodeValue = node.nodeValue?.replace(/\./g, ".");
    } else {
        node.childNodes.forEach(replaceText);
    }
}

// Function to find the main heading of the article and underline it
const underlineArticleTitle = () => {
    let titleElement = document.querySelector("h1"); // Main article title is often in <h1>

    if (!titleElement) {
        // Fallback to OpenGraph title
        const metaTitleElement = document.querySelector("meta[property='og:title']") as HTMLMetaElement;
        let metaTitle = metaTitleElement?.content;
        if (!metaTitle) {
            // Last resort: use the <title> tag
            metaTitle = document.title;
        }

        // If we found a meta title but no <h1>, create a fake <h1> to display it
        if (metaTitle) {
            titleElement = document.createElement("h1");
            titleElement.textContent = metaTitle;
            titleElement.style.textAlign = "center";
            document.body.insertBefore(titleElement, document.body.firstChild);
        }
    }

    if (titleElement) {
        titleElement.style.textDecoration = "underline";
        titleElement.style.textDecorationColor = "#1D9BF0"; // Blue underline
        titleElement.style.textDecorationThickness = "3px";
    }
}

const parseHTMLToMarkdown = () => {
    const title = document.title || "Untitled";
    let markdown = `# ${title}\n\n`;

    const contentContainer = document.querySelector("article") || document.body;
    
    const convertNodeToMarkdown = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.nodeValue.trim();
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return "";
        }

        const tag = node.tagName.toLowerCase();

        if (tag === "h1") return `# ${node.innerText}\n\n`;
        if (tag === "h2") return `## ${node.innerText}\n\n`;
        if (tag === "h3") return `### ${node.innerText}\n\n`;
        if (tag === "h4") return `#### ${node.innerText}\n\n`;
        if (tag === "h5") return `##### ${node.innerText}\n\n`;
        if (tag === "h6") return `###### ${node.innerText}\n\n`;
        if (tag === "p") return `${node.innerText}\n\n`;
        if (tag === "ul") return `${[...node.children].map(li => `- ${li.innerText}`).join("\n")}\n\n`;
        if (tag === "ol") return `${[...node.children].map((li, i) => `${i + 1}. ${li.innerText}`).join("\n")}\n\n`;
        if (tag === "img") return `![${node.alt}](${node.src})\n\n`;
        if (tag === "a") return `[${node.innerText}](${node.href})`;
        
        return [...node.childNodes].map(convertNodeToMarkdown).join(" ");
    };

    markdown += convertNodeToMarkdown(contentContainer);
    return markdown;
};

// Function to send HTML to backend
const sendToBackend = async (html: string) => {
    try {
        const response = await fetch('http://localhost:8000/bias', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: html,
                url: window.location.href
            })
        });

        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Failed to send to backend:', error);
    }
}

const PlasmoChanger = () => {
    const [bias, setBias] = useState<string>("");
    const [scale, setScale] = useState(1);
    const imgRef = useRef<HTMLImageElement>(null);
    
    // Animation effect
    useEffect(() => {
        if (bias) {
            // Throb animation
            const interval = setInterval(() => {
                setScale(prev => prev === 1 ? 1.2 : 1);
            }, 500);

            // Stop and fade out after 3 seconds
            setTimeout(() => {
                clearInterval(interval);
                if (imgRef.current) {
                    imgRef.current.style.transition = "opacity 0.5s";
                    imgRef.current.style.opacity = "0";
                }
            }, 3000);
        }
    }, [bias]);

    useEffect(() => {
        const checkBias = async () => {
            if (!isNewsArticle()) return;

            replaceText(document.body);
            underlineArticleTitle();

            const modifiedHtml = parseHTMLToMarkdown();
            const bias = await sendToBackend(modifiedHtml);
            console.log(bias);
            setBias(bias);

            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => mutation.addedNodes.forEach(replaceText));
            });

            observer.observe(document.body, { childList: true, subtree: true });

            return () => observer.disconnect();
        }

        checkBias();
    }, []);

    return (
        <div style={{ 
            position: "fixed", 
            top: "5vh", 
            right: "15vw", 
            width: "10vw",  // Increased base size
            height: "10vw", // Increased base size
            zIndex: 1000,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            transition: "transform 0.5s ease" 
        }}>
            {bias && <img 
                ref={imgRef} 
                src={getBiasImage(bias)} 
                alt="Bias" 
                style={{ 
                    width: "100%", 
                    height: "100%",
                    objectFit: "contain"
                }} 
            />}
        </div>
    );
}

export default PlasmoChanger;
