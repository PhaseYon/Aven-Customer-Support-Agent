import weaviate from 'weaviate-ts-client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testWeaviateConnection() {
  console.log('🔍 Testing Weaviate connection...\n');

  // Check environment variables
  const weaviateUrl = process.env.WEAVIATE_URL;
  const weaviateApiKey = process.env.WEAVIATE_API_KEY;

  console.log('📋 Environment Variables:');
  console.log(`   WEAVIATE_URL: ${weaviateUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`   WEAVIATE_API_KEY: ${weaviateApiKey ? '✅ Set' : '❌ Missing'}`);

  if (!weaviateUrl) {
    console.error('❌ WEAVIATE_URL is not set in your .env file');
    console.log('\n📝 Please create a .env file with:');
    console.log('WEAVIATE_URL=https://your-cluster.weaviate.network');
    console.log('WEAVIATE_API_KEY=your-api-key');
    return;
  }

  // Parse and validate URL
  console.log('\n🔗 URL Analysis:');
  let host: string;
  let scheme: string;
  
  if (weaviateUrl.includes('://')) {
    // Handle full URLs (for backward compatibility)
    try {
      const parsedUrl = new URL(weaviateUrl);
      host = parsedUrl.host;
      scheme = parsedUrl.protocol.replace(':', '');
      console.log(`   Protocol: ${parsedUrl.protocol}`);
      console.log(`   Host: ${parsedUrl.host}`);
      console.log(`   Port: ${parsedUrl.port || 'default'}`);
      console.log(`   Path: ${parsedUrl.pathname}`);
    } catch (urlError) {
      console.error('❌ Invalid URL format:', weaviateUrl);
      console.log('   Expected format: iq67zgnppoeiesnak2.c0.us-west3.gcp.weaviate.cloud');
      return;
    }
  } else {
    // Handle endpoint-only URLs (correct format)
    host = weaviateUrl;
    scheme = 'https'; // Weaviate Cloud Services always uses HTTPS
    console.log(`   Protocol: https (default for Weaviate Cloud Services)`);
    console.log(`   Host: ${host}`);
    console.log(`   Port: default`);
    console.log(`   Path: /`);
  }

  // Test basic network connectivity first
  console.log('\n🌐 Testing basic network connectivity...');
  try {
    const testUrl = `https://${host}`;
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    if (response.ok) {
      console.log('✅ Basic HTTP connectivity successful');
      console.log(`   Status: ${response.status} ${response.statusText}`);
    } else {
      console.log(`⚠️ HTTP response received but not OK: ${response.status} ${response.statusText}`);
    }
  } catch (networkError: any) {
    console.log('❌ Network connectivity failed:', networkError.message);
    
    if (networkError.name === 'AbortError') {
      console.log('   ⏰ Request timed out after 10 seconds');
    } else if (networkError.code === 'ENOTFOUND') {
      console.log('   🔍 DNS resolution failed - check your URL');
    } else if (networkError.code === 'ECONNREFUSED') {
      console.log('   🚫 Connection refused - check if the service is running');
    } else if (networkError.code === 'UND_ERR_SOCKET') {
      console.log('   🔌 Socket error - possible firewall or network issue');
    }
    
    console.log('\n🔧 Network troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify the Weaviate URL is correct');
    console.log('3. Check if your firewall is blocking the connection');
    console.log('4. Try accessing the URL in a browser');
    console.log('5. If using a corporate network, check proxy settings');
    return;
  }

  try {
    // Create client with more detailed configuration
    console.log('\n🔗 Creating Weaviate client...');
    const client = weaviate.client({
      scheme: scheme,
      host: host,
      apiKey: weaviateApiKey ? new weaviate.ApiKey(weaviateApiKey) : undefined,
    });

    // Test basic connection
    console.log('🌐 Testing Weaviate API connection...');
    const meta = await client.misc.metaGetter().do();
    console.log('✅ Weaviate API connection successful!');
    console.log(`   Weaviate version: ${meta.version}`);

    // Test authentication
    console.log('\n🔐 Testing authentication...');
    try {
      const auth = await client.misc.metaGetter().do();
      console.log('✅ Authentication successful!');
    } catch (authError) {
      console.log('❌ Authentication failed:', authError);
    }

    // Test schema operations
    console.log('\n📋 Testing schema operations...');
    try {
      const schema = await client.schema.getter().do();
      console.log('✅ Schema operations working!');
      console.log(`   Existing classes: ${schema.classes?.length || 0}`);
    } catch (schemaError) {
      console.log('❌ Schema operations failed:', schemaError);
    }

    // Test if AvenKnowledge class already exists
    console.log('\n🔍 Checking for existing AvenKnowledge class...');
    try {
      const existingClass = await client.schema
        .classGetter()
        .withClassName('AvenKnowledge')
        .do();
      
      if (existingClass) {
        console.log('✅ AvenKnowledge class already exists');
        
        // Check class properties
        console.log('\n📊 Class properties:');
        if (existingClass.properties) {
          existingClass.properties.forEach((prop: any) => {
            console.log(`   - ${prop.name}: ${prop.dataType.join(', ')}`);
          });
        }
      } else {
        console.log('ℹ️ AvenKnowledge class does not exist');
      }
    } catch (classError: any) {
      if (classError.message && classError.message.includes('404')) {
        console.log('ℹ️ AvenKnowledge class does not exist (404 - expected for new clusters)');
      } else {
        console.log('❌ Error checking class:', classError.message);
      }
    }

    console.log('\n🎉 Weaviate connection test completed!');

  } catch (error: any) {
    console.error('❌ Weaviate connection failed:', error.message);
    
    // Provide specific troubleshooting tips based on error type
    console.log('\n🔧 Troubleshooting tips:');
    
    if (error.message.includes('fetch failed')) {
      console.log('1. Network connectivity issue detected');
      console.log('2. Check your internet connection');
      console.log('3. Verify the Weaviate URL is accessible');
      console.log('4. Check firewall/proxy settings');
    } else if (error.message.includes('authentication')) {
      console.log('1. Check your WEAVIATE_API_KEY is correct');
      console.log('2. Verify the API key has proper permissions');
      console.log('3. Check if the API key is expired');
    } else if (error.message.includes('timeout')) {
      console.log('1. Request timed out - check network latency');
      console.log('2. Try increasing timeout settings');
      console.log('3. Check if the Weaviate cluster is under heavy load');
    } else {
      console.log('1. Check your WEAVIATE_URL format (should be like: https://your-cluster.weaviate.network)');
      console.log('2. Verify your WEAVIATE_API_KEY is correct');
      console.log('3. Make sure your cluster is running and accessible');
      console.log('4. Check if your cluster has the required modules enabled');
    }
  }
}

// Run the test
if (require.main === module) {
  testWeaviateConnection();
}

export { testWeaviateConnection }; 