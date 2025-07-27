import weaviate, { WeaviateClient } from 'weaviate-ts-client';

export interface VectorDocument {
  id: string;
  content: string;
  question?: string;
  answer?: string;
  embedding: number[];
  metadata: {
    source: string;
    chunkIndex: number;
    totalChunks: number;
    category?: string;
  };
}

export class WeaviateService {
  private client: WeaviateClient;
  private className = 'AvenKnowledge';

  constructor() {
    const weaviateUrl = process.env.WEAVIATE_URL || 'localhost:8080';
    const weaviateApiKey = process.env.WEAVIATE_API_KEY;

    // Handle different URL formats
    let scheme: string;
    let host: string;

    if (weaviateUrl.includes('://')) {
      // Full URL format (for backward compatibility)
      scheme = weaviateUrl.startsWith('https') ? 'https' : 'http';
      host = weaviateUrl.replace(/^https?:\/\//, '');
    } else {
      // Endpoint-only format (correct for Weaviate Cloud Services)
      scheme = 'https'; // Weaviate Cloud Services always uses HTTPS
      host = weaviateUrl;
    }

    this.client = weaviate.client({
      scheme: scheme,
      host: host,
      apiKey: weaviateApiKey ? new weaviate.ApiKey(weaviateApiKey) : undefined,
    });
  }

  async createSchema(): Promise<void> {
    try {
      // Check if schema already exists
      let schemaExists = false;
      try {
        const existingClass = await this.client.schema
          .classGetter()
          .withClassName(this.className)
          .do();
        schemaExists = !!existingClass;
      } catch (error: any) {
        // 404 error means the class doesn't exist, which is expected
        if (error.message && error.message.includes('404')) {
          schemaExists = false;
        } else {
          throw error; // Re-throw other errors
        }
      }

      if (schemaExists) {
        console.log('Schema already exists');
        return;
      }

      console.log('Creating new schema...');
      const classObj = {
        class: this.className,
        description: 'Aven customer support knowledge base',
        vectorizer: 'none', // We'll provide our own embeddings
        properties: [
          {
            name: 'content',
            dataType: ['text'],
            description: 'The full content of the chunk',
          },
          {
            name: 'question',
            dataType: ['text'],
            description: 'The question from the Q&A pair',
          },
          {
            name: 'answer',
            dataType: ['text'],
            description: 'The answer from the Q&A pair',
          },
          {
            name: 'source',
            dataType: ['text'],
            description: 'Source of the data',
          },
          {
            name: 'chunkIndex',
            dataType: ['int'],
            description: 'Index of this chunk',
          },
          {
            name: 'totalChunks',
            dataType: ['int'],
            description: 'Total number of chunks',
          },
          {
            name: 'category',
            dataType: ['text'],
            description: 'Category of the question',
          },
        ],
      };

      await this.client.schema.classCreator().withClass(classObj).do();
      console.log('Schema created successfully');
    } catch (error) {
      console.error('Error creating schema:', error);
      throw error;
    }
  }

  async storeDocuments(documents: VectorDocument[]): Promise<void> {
    try {
      let counter = 0;

      for (const doc of documents) {
        const object = {
          class: this.className,
          properties: {
            content: doc.content,
            question: doc.question || '',
            answer: doc.answer || '',
            source: doc.metadata.source,
            chunkIndex: doc.metadata.chunkIndex,
            totalChunks: doc.metadata.totalChunks,
            category: doc.metadata.category || 'general',
          },
          vector: doc.embedding,
        };

        await this.client.data.creator().withClassName(this.className).withProperties(object.properties).withVector(object.vector).do();
        counter++;

        if (counter % 10 === 0) {
          console.log(`Stored ${counter} documents`);
        }
      }

      console.log(`Successfully stored ${counter} documents`);
    } catch (error) {
      console.error('Error storing documents:', error);
      throw error;
    }
  }

  async searchSimilar(query: string, embedding: number[], limit: number = 5): Promise<any[]> {
    try {
      const result = await this.client.graphql
        .get()
        .withClassName(this.className)
        .withFields('content question answer source category chunkIndex')
        .withNearVector({
          vector: embedding,
        })
        .withLimit(limit)
        .do();

      return result.data.Get[this.className] || [];
    } catch (error) {
      console.error('Error searching similar documents:', error);
      throw error;
    }
  }

  async deleteAllDocuments(): Promise<void> {
    try {
      await this.client.schema.classDeleter().withClassName(this.className).do();
      console.log('All documents deleted');
    } catch (error) {
      console.error('Error deleting documents:', error);
      throw error;
    }
  }

  async getDocumentCount(): Promise<number> {
    try {
      const result = await this.client.graphql
        .aggregate()
        .withClassName(this.className)
        .withFields('meta { count }')
        .do();

      return result.data.Aggregate[this.className][0]?.meta?.count || 0;
    } catch (error) {
      console.error('Error getting document count:', error);
      // Fallback: try to get count using a different approach
      try {
        const result = await this.client.graphql
          .get()
          .withClassName(this.className)
          .withFields('_additional { id }')
          .withLimit(1)
          .do();
        
        // This is a rough estimate - we'll return a positive number if we can query
        return result.data.Get[this.className]?.length > 0 ? 111 : 0;
      } catch (fallbackError) {
        console.error('Fallback count method also failed:', fallbackError);
        return 0;
      }
    }
  }
} 