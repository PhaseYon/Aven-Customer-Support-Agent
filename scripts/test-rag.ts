import { WeaviateService } from '../lib/weaviate-client';
import { GeminiEmbeddingService } from '../lib/gemini-embeddings';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testRAG() {
  console.log('🧪 Testing RAG (Retrieval-Augmented Generation) functionality...\n');

  try {
    const weaviateService = new WeaviateService();
    const embeddingService = new GeminiEmbeddingService();

    // Test queries
    const testQueries = [
      "What is Aven?",
      "How do I contact support?",
      "What are the pricing plans?",
      "How do I reset my password?",
      "What features does Aven offer?"
    ];

    for (const query of testQueries) {
      console.log(`\n🔍 Testing query: "${query}"`);
      
      // Generate embedding
      const queryEmbedding = await embeddingService.generateEmbedding(query);
      console.log('✅ Query embedding generated');

      // Search for relevant documents
      const relevantDocs = await weaviateService.searchSimilar(query, queryEmbedding, 3);
      console.log(`✅ Found ${relevantDocs.length} relevant documents`);

      if (relevantDocs.length > 0) {
        console.log('📄 Relevant documents:');
        relevantDocs.forEach((doc, index) => {
          console.log(`  ${index + 1}. Category: ${doc.category || 'general'}`);
          console.log(`     Question: ${doc.question || 'N/A'}`);
          console.log(`     Answer: ${(doc.answer || '').substring(0, 100)}...`);
          console.log('');
        });
      } else {
        console.log('❌ No relevant documents found');
      }
    }

    console.log('\n🎉 RAG test completed successfully!');

  } catch (error) {
    console.error('❌ RAG test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testRAG();
}

export { testRAG }; 