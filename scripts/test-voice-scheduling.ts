import * as dotenv from 'dotenv'

dotenv.config()

async function testVoiceScheduling() {
  console.log('🔍 Testing Voice Meeting Scheduling...\n')

  // Test the webhook endpoint
  const webhookUrl = 'http://localhost:3000/api/vapi/webhook'
  
  const testMeeting = {
    type: 'function-call',
    functionCall: {
      name: 'schedule_meeting',
      arguments: {
        summary: 'Test Meeting via Voice',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // Tomorrow + 30 min
        description: 'Test meeting scheduled through voice assistant',
        attendeeEmail: 'test@example.com'
      }
    }
  }

  try {
    console.log('📤 Sending test meeting request to webhook...')
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMeeting)
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ Webhook response:', result)
      
      if (result.type === 'function-call-result') {
        console.log('✅ Meeting scheduling function working!')
        console.log('📅 Meeting details:', result.functionCallResult.result)
      } else {
        console.log('⚠️ Unexpected response format')
      }
    } else {
      console.log('❌ Webhook error:', response.status, response.statusText)
    }
  } catch (error) {
    console.error('❌ Test failed:', error)
  }

  console.log('\n🎉 Voice scheduling test completed!')
}

// Run the test
if (require.main === module) {
  testVoiceScheduling()
}

export { testVoiceScheduling } 