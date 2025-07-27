import { TextChunker } from '../lib/text-chunker';

async function testChunking() {
  console.log('🧪 Testing text chunking...\n');

  try {
    const chunker = new TextChunker();
    const chunks = await chunker.chunkAvenData();

    console.log(`✅ Successfully created ${chunks.length} chunks\n`);

    // Show first 5 chunks
    console.log('📝 First 5 chunks:');
    chunks.slice(0, 5).forEach((chunk, index) => {
      console.log(`\n${index + 1}. Question: ${chunk.question}`);
      console.log(`   Category: ${chunk.metadata.category}`);
      console.log(`   Answer length: ${chunk.answer?.length || 0} characters`);
      console.log(`   Content length: ${chunk.content.length} characters`);
    });

    // Show some specific chunks to verify edge cases
    console.log('\n🔍 Checking specific edge cases:');
    
    const mortgageChunk = chunks.find(chunk => 
      chunk.question?.includes('mortgage payments have to be current')
    );
    if (mortgageChunk) {
      console.log('✅ Found "Do mortgage payments have to be current" chunk');
    } else {
      console.log('❌ Missing "Do mortgage payments have to be current" chunk');
    }

    const contactChunk = chunks.find(chunk => 
      chunk.question?.includes('How to Contact Us')
    );
    if (contactChunk) {
      console.log('✅ Found "How to Contact Us" chunk');
    } else {
      console.log('❌ Missing "How to Contact Us" chunk');
    }

    // Show category distribution
    const categories = chunks.reduce((acc, chunk) => {
      const category = chunk.metadata.category || 'unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📊 Category distribution:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} chunks`);
    });

    console.log('\n🎉 Chunking test completed successfully!');

  } catch (error) {
    console.error('❌ Chunking test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testChunking();
}

export { testChunking }; 