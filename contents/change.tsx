import { useEffect } from "react"
import type {
    PlasmoCSConfig,
    PlasmoGetOverlayAnchor,
    PlasmoWatchOverlayAnchor
} from "plasmo"

export const config: PlasmoCSConfig = {
    matches: ["*://*.plasmo.com/*"]
}

export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () =>
    document.querySelector(`body`)

const PlasmoChanger = () => {
    const replaceText = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.nodeValue;
            if (text && text.toLowerCase().includes("plasmo")) {
                // Create a span element with underline
                const span = document.createElement('span');
                span.style.textDecoration = 'underline';
                span.style.textDecorationColor = '#1D9BF0'; // Using the same blue as the X button
                span.style.textDecorationThickness = '2px';
                span.textContent = text;
                
                // Replace the text node with our new span
                node.parentNode?.replaceChild(span, node);
            }
        } else {
            node.childNodes.forEach(replaceText);
        }
    };

    useEffect(() => {
        let observer: MutationObserver | null = null;

        // Listen for messages from popup
        const messageListener = (message, sender, sendResponse) => {
            if (message.action === "startReplacement") {
                // Initial replacement
                replaceText(document.body);

                // Start observing changes
                observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        mutation.addedNodes.forEach(replaceText);
                    });
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        };

        chrome.runtime.onMessage.addListener(messageListener);

        // Cleanup when component unmounts
        return () => {
            if (observer) {
                observer.disconnect();
            }
            chrome.runtime.onMessage.removeListener(messageListener);
        };
    }, []); // Empty dependency array means this effect runs once on mount

    return <></>;
}

export default PlasmoChanger