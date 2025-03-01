import { useEffect } from "react"
import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
    matches: ["*://*/*"],
    all_frames: true,
    run_at: "document_end"
}

const sampleJsonInput = {
    "statements": [
      {
        "document": 0,
        "sentenceIdx": 3,
        "sentence": "Climate change is causing more extreme weather events.",
        "references": [
          "https://www.google.com",
          "https://www.google.com"
        ]
      },
      {
        "document": 0,
        "sentenceIdx": 11,
        "sentence": "Global temperatures have risen by 1.2 degrees Celsius since the industrial revolution.",
        "references": [
          "https://www.google.com",
          "https://www.google.com"
        ]
      }
    ],
    "analysis": {
      "summary": "The provided text discusses climate change and its effects on global temperatures and extreme weather events.",
      "key_points": [
        "Climate change is linked to extreme weather.",
        "Global temperatures have risen significantly."
      ]
    },
    "sentiment": {
      "overall": "Neutral",
      "document_sentiments": [
        {
          "document": 0,
          "sentiment": "Neutral"
        }
      ]
    }
}

const getTextElements = () => {
    const textElements = [];
    const contentElements = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6, article');
    
    contentElements.forEach((element) => {
        // Get direct text content, excluding nested elements
        const directText = Array.from(element.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .map(node => node.textContent?.trim())
            .filter(text => text && text.length > 0);

        if (directText.length > 0) {
            textElements.push({
                tag: element.tagName.toLowerCase(),
                text: directText.join(" "),
                path: getElementPath(element)
            });
        }
    });

    return textElements;
}

const getElementPath = (element: Element) => {
    // Add a unique identifier to the element
    const uniqueId = `ref-${Math.random().toString(36).substr(2, 9)}`;
    element.setAttribute('data-ref-id', uniqueId);
    
    // Return simple attribute selector
    return `[data-ref-id="${uniqueId}"]`;
}

const sendToBackend = async (elements: any[]) => {
    try {
        // only send the text in a list of strings
        const response = await fetch('http://localhost:8000/references', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                documents: elements.map(element => element.text),
                url: window.location.href
            })
        });

        const data = await response.json();
        console.log('Response from backend:', data);
        return data;
    } catch (error) {
        console.error('Failed to send to backend:', error);
    }
}

interface Statement {
    document: number
    sentenceIdx: number
    sentence: string
    references: string[]
}

interface BackendResponse {
    statements: Statement[]
    analysis: any
    sentiment: any
}

const PlasmoChanger = () => {
    useEffect(() => {
        // Global flag to ensure we only run once per page
        if ((window as any).__referencesProcessed) {
            return;
        }

        // Function to process references
        const processReferences = async () => {
            // Wait a bit to ensure no redirects are pending
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Double-check flag in case multiple events fired
            if ((window as any).__referencesProcessed) {
                return;
            }
            (window as any).__referencesProcessed = true;

            const elements = getTextElements();
            
            // Check for minimum content requirements
            if (elements.length < 10) {
                return;
            }

            // Calculate total text length
            const totalTextLength = elements.reduce((sum, el) => sum + el.text.length, 0);
            if (totalTextLength < 500) { // Minimum 500 characters
                return;
            }

            console.log("Found elements:", elements);
            const response2 = await sendToBackend(elements);
            console.log("Response from backend:", response2, "sampleJsonInput", sampleJsonInput);
            
            // Imagine this is the response from backend
            const response: BackendResponse = response2;
            
            // Add citations to the DOM elements
            response.statements.forEach(statement => {
                const elementToModify = elements[statement.sentenceIdx];
                if (elementToModify) {
                    console.log("Looking for element with path:", elementToModify.path);
                    console.log("Original text:", elementToModify.text);
                    
                    const domElement = document.querySelector(elementToModify.path);
                    console.log("Found DOM element:", domElement);
                    
                    if (domElement && domElement.textContent) {
                        const refCount = statement.references.length;
                        const originalText = domElement.textContent;
                        
                        // Create citation link element
                        const citationLink = document.createElement('a');
                        citationLink.href = statement.references[0]; // Use first reference as link
                        citationLink.style.cssText = 'text-decoration: none; color: blue; cursor: pointer; font-size: 0.75em; vertical-align: super;';
                        citationLink.textContent = `[${refCount}]`;
                        citationLink.target = '_blank'; // Open in new tab
                        
                        // Add click handler for multiple references
                        if (statement.references.length > 1) {
                            citationLink.onclick = (e) => {
                                e.preventDefault();
                                // Open all references in new tabs
                                statement.references.forEach(ref => window.open(ref, '_blank'));
                            };
                        }
                        
                        // Set the original text and append the citation
                        domElement.textContent = originalText;
                        domElement.appendChild(citationLink);
                        
                        // Clean up our temporary attribute
                        domElement.removeAttribute('data-ref-id');
                    }
                }
            });
        };

        // Run when the page is fully loaded and stable
        if (document.readyState === 'complete') {
            processReferences();
        } else {
            window.addEventListener('load', processReferences, { once: true });
        }

        // Cleanup
        return () => {
            window.removeEventListener('load', processReferences);
        };
    }, []); 

    return null;
}

export default PlasmoChanger;
