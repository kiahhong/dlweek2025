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

// Function to find the main heading of the article and underline it
const underlineArticleTitle = () => {
    let titleElement = document.querySelector("h1"); // Main article title is often in <h1>

    if (!titleElement) {
        // Fallback to OpenGraph title
        let metaTitle = document.querySelector("meta[property='og:title']")?.content;
        if (!metaTitle) {
            // Last resort: use the <title> tag (which might not always be reliable)
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

const PlasmoChanger = () => {
    useEffect(() => {
        if (!isNewsArticle()) return; // Do nothing if not a news article

        // Replace text and underline title
        replaceText(document.body);
        underlineArticleTitle();

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
