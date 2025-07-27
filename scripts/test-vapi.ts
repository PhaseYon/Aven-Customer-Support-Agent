import Vapi from '@vapi-ai/web'
import * as dotenv from 'dotenv'

dotenv.config()

async function testVapi() {
  console.log('🔍 Testing Vapi SDK...\n')

  const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID

  console.log('📋 Environment Variables:')
  console.log(`   NEXT_PUBLIC_VAPI_API_KEY: ${apiKey ? '✅ Set' : '❌ Missing'}`)
  console.log(`   NEXT_PUBLIC_VAPI_ASSISTANT_ID: ${assistantId ? '✅ Set' : '❌ Missing'}`)

  if (!apiKey) {
    console.error('❌ Vapi API key not found')
    return
  }

  try {
    console.log('\n🔗 Creating Vapi instance...')
    const vapi = new Vapi(apiKey)
    
    console.log('📊 Vapi object:', vapi)
    console.log('🔧 Available methods:', Object.getOwnPropertyNames(vapi))
    console.log('🔧 Available properties:', Object.keys(vapi))
    
    // Check if start method exists
    if (typeof vapi.start === 'function') {
      console.log('✅ start() method found')
      console.log('   start method signature:', vapi.start.toString().slice(0, 100) + '...')
    } else {
      console.log('❌ start() method not found')
    }
    
    // Check for other potential methods
    const potentialMethods = ['startCall', 'beginCall', 'initiateCall', 'connect']
    potentialMethods.forEach(method => {
      if (typeof (vapi as any)[method] === 'function') {
        console.log(`✅ ${method}() method found`)
      }
    })

    console.log('\n🎉 Vapi SDK test completed!')

  } catch (error) {
    console.error('❌ Vapi test failed:', error)
  }
}

// Run the test
if (require.main === module) {
  testVapi()
}

export { testVapi } 