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

const sampleJsonInput2 = {
    "statements": [
        {
            "document": 4,
            "sentenceIdx": 0,
            "sentence": "US President Donald Trump (right) and Ukrainian President Volodymyr Zelensky engaged in a shouting match in the Oval Office of the White House on Feb 28.",
            "references": [
                "https://www.nbcnews.com/politics/trump-administration/vance-leans-hard-trumps-foreign-policy-sparks-extraordinary-oval-offic-rcna194256",
                "https://www.whitehouse.gov/articles/2025/02/support-pours-in-for-president-trump-vp-vances-america-first-strength/",
                "https://www.reuters.com/world/us/jd-vance-once-compared-trump-hitler-now-they-are-running-mates-2024-07-15/"
            ]
        },
        {
            "document": 7,
            "sentenceIdx": 0,
            "sentence": "- Plans to sign a critical minerals deal between the US and Ukraine were scrapped after Mr Donald Trump’s meeting on Feb 28 with Mr Volodymyr Zelensky quickly devolved into over the Ukrainian leader’s doubts that the US President’s efforts to broker a deal with Russia would yield lasting peace.",
            "references": [
                "https://www.nbcnews.com/politics/trump-administration/vance-leans-hard-trumps-foreign-policy-sparks-extraordinary-oval-offic-rcna194256"
            ]
        },
        {
            "document": 10,
            "sentenceIdx": 0,
            "sentence": "US officials said the minerals deal – which Mr Trump had cast as a necessary step to repay American support as he sought to broker a deal with Russian President Vladimir Putin – was not signed before Mr Zelensky’s departure.",
            "references": [
                "https://www.nbcnews.com/politics/trump-administration/vance-leans-hard-trumps-foreign-policy-sparks-extraordinary-oval-offic-rcna194256"
            ]
        },
        {
            "document": 11,
            "sentenceIdx": 0,
            "sentence": "“He disrespected the United States of America in its cherished Oval Office.",
            "references": [
                "https://en.wikipedia.org/wiki/JD_Vance"
            ]
        },
        {
            "document": 12,
            "sentenceIdx": 0,
            "sentence": "The Ukrainian leader angered Mr Trump and US Vice-President J.D.",
            "references": [
                "https://www.nbcnews.com/politics/trump-administration/vance-leans-hard-trumps-foreign-policy-sparks-extraordinary-oval-offic-rcna194256"
            ]
        },
        {
            "document": 14,
            "sentenceIdx": 0,
            "sentence": "As Mr Zelensky sought to make his point, Mr Trump and Mr Vance lit into the beleaguered leader, suggesting his approach – delivered in the Oval Office – was disrespectful and inhibiting an end to the bloody three-year war.",
            "references": [
                "https://www.nbcnews.com/politics/trump-administration/vance-leans-hard-trumps-foreign-policy-sparks-extraordinary-oval-offic-rcna194256"
            ]
        },
        {
            "document": 15,
            "sentenceIdx": 0,
            "sentence": "“It’s going to be very hard to do business like this,” Mr Trump said, telling Mr Zelensky he was not sure the Ukrainian leader could make a deal.",
            "references": [
                "https://www.nbcnews.com/politics/trump-administration/vance-leans-hard-trumps-foreign-policy-sparks-extraordinary-oval-offic-rcna194256"
            ]
        },
        {
            "document": 17,
            "sentenceIdx": 1,
            "sentence": "Mr Trump had touted the agreement as a major commitment from the US to Ukraine, as he initially welcomed Mr Zelensky to the White House for a high-stakes meeting with stark implications for the fight to repel Russia’s invasion.",
            "references": [
                "https://www.nbcnews.com/politics/trump-administration/vance-leans-hard-trumps-foreign-policy-sparks-extraordinary-oval-offic-rcna194256"
            ]
        },
        {
            "document": 19,
            "sentenceIdx": 1,
            "sentence": "Mr Zelensky told Mr Trump that Russian President Vladimir Putin had repeatedly violated previous ceasefire agreements and that Ukraine would never accept a simple ceasefire to conclude the war.",
            "references": [
                "https://www.nbcnews.com/politics/trump-administration/vance-leans-hard-trumps-foreign-policy-sparks-extraordinary-oval-offic-rcna194256",
                "https://www.whitehouse.gov/articles/2025/02/support-pours-in-for-president-trump-vp-vances-america-first-strength/",
                "https://news.yahoo.com/vance-vows-trump-administration-biggest-155920559.html"
            ]
        },
        {
            "document": 23,
            "sentenceIdx": 2,
            "sentence": "I’m for both,” Mr Trump insisted.",
            "references": [
                "https://www.cbsnews.com/news/vance-flexes-political-power-in-new-role/",
                "https://www.nbcnews.com/politics/trump-administration/vance-leans-hard-trumps-foreign-policy-sparks-extraordinary-oval-offic-rcna194256",
                "https://www.whitehouse.gov/articles/2025/02/support-pours-in-for-president-trump-vp-vances-america-first-strength/",
                "https://www.reuters.com/world/us/jd-vance-once-compared-trump-hitler-now-they-are-running-mates-2024-07-15/",
                "https://news.yahoo.com/vance-vows-trump-administration-biggest-155920559.html",
                "https://www.nbcnews.com/politics/jd-vance-carving-role-vp-politics-desk-rcna191284"
            ]
        },
        {
            "document": 25,
            "sentenceIdx": 0,
            "sentence": "“Do you think that it’s respectful to come to the Oval Office of the United States of America and attack the administration that’s trying to prevent the destruction of your country?” Mr Vance asked.",
            "references": [
                "https://www.whitehouse.gov/articles/2025/02/support-pours-in-for-president-trump-vp-vances-america-first-strength/",
                "https://en.wikipedia.org/wiki/JD_Vance"
            ]
        },
        {
            "document": 26,
            "sentenceIdx": 0,
            "sentence": "Mr Trump said Mr Zelensky had “tremendous hatred” for Mr Putin and suggested that the anger could be inhibiting a deal, while also defending his warm relations with the Russian leader as more likely to yield results.",
            "references": [
                "https://www.nbcnews.com/politics/trump-administration/vance-leans-hard-trumps-foreign-policy-sparks-extraordinary-oval-offic-rcna194256"
            ]
        },
        {
            "document": 30,
            "sentenceIdx": 1,
            "sentence": "He went on to suggest Mr Zelensky had campaigned for former vice-president Kamala Harris with his trip last fall to an ammunition plant in the battleground state of Pennsylvania.",
            "references": [
                "https://www.nbcnews.com/politics/trump-administration/vance-leans-hard-trumps-foreign-policy-sparks-extraordinary-oval-offic-rcna194256"
            ]
        },
        {
            "document": 31,
            "sentenceIdx": 0,
            "sentence": "“Offer some words of appreciation for the United States of America and the President who’s trying to save your country,” Mr Vance admonished.",
            "references": [
                "https://www.whitehouse.gov/articles/2025/02/support-pours-in-for-president-trump-vp-vances-america-first-strength/",
                "https://en.wikipedia.org/wiki/JD_Vance"
            ]
        },
        {
            "document": 38,
            "sentenceIdx": 0,
            "sentence": "Mr Zelensky’s visit caps a dramatic week that saw both French President Emmanuel Macron and British Prime Minister Keir Starmer visit Washington to push Mr Trump to offer US support for a European “backstop” to protect Ukraine from further attacks.",
            "references": [
                "https://www.whitehouse.gov/articles/2025/02/support-pours-in-for-president-trump-vp-vances-america-first-strength/"
            ]
        }
    ],
    "analysis": "The article describes a tense meeting between President Trump and President Zelensky, where a planned minerals deal was scrapped after a shouting match. The disagreement stemmed from Zelensky's doubts about Trump's ability to broker peace with Russia and his feeling that the deal was not enough to deter Russian aggression. Trump and Vance criticized Zelensky for being disrespectful and ungrateful, with Trump questioning Zelensky's ability to make a deal and suggesting Ukraine was gambling with World War III. The article uses strong language to describe the events, such as \"shouting match,\" \"devolved into,\" and \"lit into.\" There are also instances of subjective language, such as Trump casting the minerals deal as a \"necessary step\" and touting it as a \"major commitment.\" The article also includes direct quotes from the individuals involved, which adds to the intensity of the narrative. The use of excessive adverbs is limited, but the overall tone is critical of the meeting's outcome and the strained relationship between the leaders.",
    "sentiment": "negative"
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
        const response = await fetch('http://localhost:8000/echo', {
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

// Create a map to track reference numbers
let referenceCounter = 1;
const referenceMap = new Map();

const PlasmoChanger = () => {
    useEffect(() => {
        // Listen for messages from the popup
        const messageListener = (request: any, sender: any, sendResponse: any) => {
            // Only process if it's our specific message
            if (request.type === "ANALYZE_PAGE") {
                // Function to process references
                const processReferences = async () => {
                    if ((window as any).__referencesProcessed) {
                        return;
                    }
                    (window as any).__referencesProcessed = true;

                    const elements = getTextElements();
                    
                    if (elements.length < 10) {
                        return;
                    }

                    const totalTextLength = elements.reduce((sum, el) => sum + el.text.length, 0);
                    if (totalTextLength < 500) {
                        return;
                    }

                    console.log("Found elements:", elements);
                    const response2 = await sendToBackend(elements);
                    console.log("Response from backend:", response2);
                    
                    const response: BackendResponse = sampleJsonInput2;
                    
                    // Create a map of text content to elements for more reliable matching
                    const textToElement = new Map();
                    elements.forEach((el, idx) => {
                        // Normalize text for comparison
                        const normalizedText = el.text.trim().toLowerCase();
                        textToElement.set(normalizedText, { element: el, index: idx });
                    });
                    
                    // Reset reference counter for each processing
                    referenceCounter = 1;
                    referenceMap.clear();
                    
                    // Add citations to the DOM elements
                    response.statements.forEach(statement => {
                        const normalizedStatement = statement.sentence.trim().toLowerCase();
                        const matchingElement = textToElement.get(normalizedStatement);
                        
                        if (matchingElement) {
                            const domElement = document.querySelector(matchingElement.element.path);
                            if (domElement && domElement.textContent) {
                                const originalText = domElement.textContent;
                                
                                // Get or create reference number for these URLs
                                let refNumber;
                                const urlKey = statement.references.join(',');
                                if (referenceMap.has(urlKey)) {
                                    refNumber = referenceMap.get(urlKey);
                                } else {
                                    refNumber = referenceCounter++;
                                    referenceMap.set(urlKey, refNumber);
                                }
                                
                                // Create citation link element
                                const citationLink = document.createElement('a');
                                citationLink.href = '#';
                                citationLink.style.cssText = 'text-decoration: none; color: blue; cursor: pointer; font-size: 0.75em; vertical-align: super;';
                                citationLink.textContent = `[${refNumber}]`;
                                
                                // Open maximum of first 3 references in new tabs
                                citationLink.onclick = (e) => {
                                    e.preventDefault();
                                    statement.references.slice(0, 3).forEach(ref => window.open(ref, '_blank'));
                                };
                                
                                domElement.textContent = originalText;
                                domElement.appendChild(citationLink);
                                domElement.removeAttribute('data-ref-id');
                            }
                        }
                    });
                };

                // Run the processing
                if (document.readyState === 'complete') {
                    processReferences();
                } else {
                    window.addEventListener('load', processReferences, { once: true });
                }
            }
        };

        // Add the message listener for chrome runtime messages
        chrome.runtime.onMessage.addListener(messageListener);

        // Cleanup
        return () => {
            chrome.runtime.onMessage.removeListener(messageListener);
        };
    }, []);

    return null;
}

export default PlasmoChanger;
