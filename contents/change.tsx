import type {
    PlasmoCSConfig,
    PlasmoGetOverlayAnchor,
    PlasmoWatchOverlayAnchor
  } from "plasmo"

  // only run for official plasmo website

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
                node.nodeValue = text.replace(/plasmo/gi, "plasmo😀");
            }
        } else {
            node.childNodes.forEach(replaceText);
        }
    };

    let observer: MutationObserver | null = null;

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
    });

    // Cleanup when component unmounts
    return () => {
        if (observer) {
            observer.disconnect();
        }
    };

    return <></>;
  }
  export default PlasmoChanger