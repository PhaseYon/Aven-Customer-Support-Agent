import { TextChunker, Chunk } from '../lib/text-chunker';
import { GeminiEmbeddingService } from '../lib/gemini-embeddings';
import { WeaviateService, VectorDocument } from '../lib/weaviate-client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log('🚀 Starting Aven data vectorization pipeline...\n');

  try {
    // Step 1: Chunk the text data
    console.log('📄 Step 1: Chunking aven-data.txt...');
    const chunker = new TextChunker();
    const chunks = await chunker.chunkAvenData();
    console.log(`✅ Created ${chunks.length} chunks from aven-data.txt\n`);

    // Step 2: Generate embeddings
    console.log('🧠 Step 2: Generating embeddings with Gemini...');
    const embeddingService = new GeminiEmbeddingService();
    const texts = chunks.map(chunk => chunk.content);
    const embeddingResults = await embeddingService.generateEmbeddings(texts);
    console.log(`✅ Generated embeddings for ${embeddingResults.length} chunks\n`);

    // Step 3: Prepare documents for Weaviate
    console.log('📦 Step 3: Preparing documents for Weaviate...');
    const documents: VectorDocument[] = chunks.map((chunk, index) => ({
      id: chunk.id,
      content: chunk.content,
      question: chunk.question,
      answer: chunk.answer,
      embedding: embeddingResults[index].embedding,
      metadata: chunk.metadata,
    }));
    console.log(`✅ Prepared ${documents.length} documents\n`);

    // Step 4: Store in Weaviate
    console.log('🗄️ Step 4: Storing in Weaviate...');
    const weaviateService = new WeaviateService();
    
    // Create schema if it doesn't exist
    await weaviateService.createSchema();
    
    // Store documents
    await weaviateService.storeDocuments(documents);
    
    // Verify storage
    const count = await weaviateService.getDocumentCount();
    console.log(`✅ Successfully stored ${count} documents in Weaviate\n`);

    console.log('🎉 Pipeline completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Chunks created: ${chunks.length}`);
    console.log(`- Embeddings generated: ${embeddingResults.length}`);
    console.log(`- Documents stored: ${count}`);

    // Show some sample chunks
    console.log('\n📝 Sample chunks:');
    chunks.slice(0, 3).forEach((chunk, index) => {
      console.log(`\n${index + 1}. ${chunk.question}`);
      console.log(`   Category: ${chunk.metadata.category}`);
      console.log(`   Content length: ${chunk.content.length} characters`);
    });

  } catch (error) {
    console.error('❌ Pipeline failed:', error);
    process.exit(1);
  }
}

// Run the pipeline
if (require.main === module) {
  main();
}

export { main }; 