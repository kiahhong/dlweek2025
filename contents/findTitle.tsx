import { useEffect } from "react"
import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
    matches: ["*://*/*"]
}

// Function to check if the page is a news article
const isNewsArticle = () => {
    const ogType = document.querySelector("meta[property='og:type']")?.content;
    const publishedTime = document.querySelector("meta[property='article:published_time']");
    const articleTag = document.querySelector("article");
    const url = window.location.href;

    // URL patterns for news articles
    const articlePatterns = [/\/\d{4}\/\d{2}\/\d{2}\//, /\/news\//, /\/article\//];

    return ogType === "article" || publishedTime || articleTag || articlePatterns.some(pattern => pattern.test(url));
}

// Function to replace full stops with smiley faces
const replaceText = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
        node.nodeValue = node.nodeValue.replace(/\./g, "😊");
    } else {
        node.childNodes.forEach(replaceText);
    }
}

const PlasmoChanger = () => {
    useEffect(() => {
        if (!isNewsArticle()) return; // Do nothing if not a news article

        // Initial replacement
        replaceText(document.body);

        // Observe changes and apply replacements dynamically
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => mutation.addedNodes.forEach(replaceText));
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect(); // Cleanup on unmount
    }, []);

    return null;
}

export default PlasmoChanger;
