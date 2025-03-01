import { useEffect, useState } from "react"
import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
    matches: ["*://*/*"]
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
    
    useEffect(() => {
        const checkBias = async () => {
            if (!isNewsArticle()) return; // Do nothing if not a news article

            // Replace text and underline title
            replaceText(document.body);
            underlineArticleTitle();

            // Get the modified HTML and send to backend
            const modifiedHtml = parseHTMLToMarkdown();
            const bias = await sendToBackend(modifiedHtml);
            console.log(bias);
            setBias(bias);

            // Observe changes and apply replacements dynamically
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => mutation.addedNodes.forEach(replaceText));
            });

            observer.observe(document.body, { childList: true, subtree: true });

            return () => observer.disconnect(); // Cleanup on unmount
        }

        checkBias();
    }, []);

    return (
        <div>
            <h1>Bias: {bias}</h1>
        </div>
    );
}

export default PlasmoChanger;
