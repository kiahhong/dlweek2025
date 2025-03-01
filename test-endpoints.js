const BASE_URL = 'http://localhost:8000'  // Adjust if your server runs on a different port

async function testEndpoints() {
    try {
        // // Test 1: References endpoint
        // console.log('\n🧪 Testing /references endpoint...')
        // const referencesResponse = await fetch(`${BASE_URL}/references`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         documents: [
        //             "Singapore's healthcare system is ranked among the best in the world. The country has excellent medical facilities and a robust public health infrastructure.",
        //             "The MRT system in Singapore experiences frequent breakdowns and delays. This has been a major source of frustration for commuters in recent years."
        //         ]
        //     })
        // })
        // const referencesData = await referencesResponse.json()
        // console.log('✅ References Response:', referencesData)

        // Test 2: Bias endpoint with different texts
        console.log('\n🧪 Testing /bias endpoint...')
        const biasTexts = [
            "This is absolutely the worst government policy ever implemented!",
            "Studies show that the new policy has both advantages and disadvantages.",
            "The opposition party's proposal is completely unrealistic and dangerous."
        ]

        for (const text of biasTexts) {
            const biasResponse = await fetch(`${BASE_URL}/bias`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "text": "yes" })
            })
            
            if (!biasResponse.ok) {
                const errorData = await biasResponse.text()
                console.error(`Error for text "${text}":`, errorData)
                continue
            }
            
            const biasData = await biasResponse.json()
            console.log(`✅ Bias Analysis for "${text.slice(0, 30)}...":`, biasData)
        }

        // // Test 3: Echo endpoint (for debugging)
        // console.log('\n🧪 Testing /echo endpoint...')
        // const testPayload = {
        //     text: "yes"
        // }
        // const echoResponse = await fetch(`${BASE_URL}/echo`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(testPayload)
        // })
        // const echoData = await echoResponse.json()
        // console.log('✅ Echo Response:', echoData)

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