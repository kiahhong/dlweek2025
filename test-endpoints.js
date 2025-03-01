const BASE_URL = 'http://localhost:8000'  // Adjust if your server runs on a different port
const fs = require('fs');

async function testEndpoints() {
    try {
        // Test image classification
        console.log('\n🧪 Testing /imageClassify endpoint...')
        
        // Read image and convert to base64
        const imagePath = './assets/aiimg.webp';  // Put your test image path here
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');

        const imageResponse = await fetch(`${BASE_URL}/imageClassify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                image: base64Image 
            })
        });
        
        if (!imageResponse.ok) {
            const errorData = await imageResponse.text();
            console.error('Image classification error:', errorData);
        } else {
            const imageData = await imageResponse.json();
            console.log('✅ Image Classification Result:', imageData.prediction);
            
            // If image was modified (fake detected), save the new image
            if (imageData.image) {
                const outputPath = './assets/output_image.jpg';
                const imageBuffer = Buffer.from(imageData.image, 'base64');
                fs.writeFileSync(outputPath, imageBuffer);
                console.log(`✅ Modified image saved to ${outputPath}`);
            }
        }

        // // Test 2: Bias endpoint with different texts
        // console.log('\n🧪 Testing /bias endpoint...')
        // const biasTexts = [
        //     "This is absolutely the worst government policy ever implemented!",
        //     "Studies show that the new policy has both advantages and disadvantages.",
        //     "The opposition party's proposal is completely unrealistic and dangerous."
        // ]

        // for (const text of biasTexts) {
        //     const biasResponse = await fetch(`${BASE_URL}/bias`, {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json'
        //         },
        //         body: JSON.stringify({ "text": "yes" })
        //     })
            
        //     if (!biasResponse.ok) {
        //         const errorData = await biasResponse.text()
        //         console.error(`Error for text "${text}":`, errorData)
        //         continue
        //     }
            
        //     const biasData = await biasResponse.json()
        //     console.log(`✅ Bias Analysis for "${text.slice(0, 30)}...":`, biasData)
        // }

    } catch (error) {
        console.error('❌ Error during testing:', error)
    }
}

// Error handling wrapper
async function runTests() {
    console.log('🚀 Starting API endpoint tests...')
    try {
        await testEndpoints()
        console.log('\n✨ All tests completed!')
    } catch (error) {
        console.error('\n💥 Fatal error:', error)
    }
}

// Run the tests
runTests() 