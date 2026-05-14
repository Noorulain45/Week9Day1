import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentChunk } from '../document-chunk.schema';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(DocumentChunk.name)
    private chunkModel: Model<DocumentChunk>,
  ) {}

  // 🔥 1. Sample documents (realistic AI topics)
  private documents = [
    {
      id: 'ai-001',
      content: `
Artificial Intelligence (AI) enables machines to mimic human intelligence.
It includes learning, reasoning, and problem solving.
AI is widely used in chatbots, automation, and recommendation systems.
      `,
    },
    {
      id: 'rag-002',
      content: `
Retrieval-Augmented Generation (RAG) combines retrieval and generation.
It fetches relevant documents and feeds them into a language model.
This improves accuracy and reduces hallucination.
      `,
    },
    {
      id: 'vector-003',
      content: `
Vector databases store embeddings instead of raw text.
They enable semantic search using similarity metrics.
MongoDB Atlas supports vector search capabilities.
      `,
    },
    {
      id: 'nest-004',
      content: `
NestJS is a Node.js framework used for scalable backend applications.
It uses modules, controllers, and services.
It integrates well with MongoDB and AI systems.
      `,
    },
    {
      id: 'groq-005',
      content: `
Groq provides ultra-fast inference for large language models.
It is optimized for real-time AI applications like chatbots.
      `,
    },
    {
      id: 'embed-006',
      content: `
Embeddings convert text into numerical vectors.
Similar meanings produce similar vectors.
They are used in semantic search and recommendation systems.
      `,
    },
  ];

  // 🔥 2. Chunking
  private chunkText(text: string, size = 200, overlap = 50) {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = start + size;
      chunks.push(text.slice(start, end));
      start = end - overlap;
    }

    return chunks;
  }

  // 🔥 3. TEMP embedding (simple hash-based vector)
  // ⚠️ Replace later with real embeddings
  private fakeEmbedding(text: string): number[] {
    const vector = new Array(10).fill(0);

    for (let i = 0; i < text.length; i++) {
      vector[i % 10] += text.charCodeAt(i);
    }

    return vector;
  }

  // 🔥 4. Main seeding function
  async seed() {
  console.log('🚀 Seeder function CALLED');

  await this.chunkModel.deleteMany({});
  console.log('🧹 Collection cleared');

  for (const doc of this.documents) {
    console.log('📄 Processing doc:', doc.id);

    const chunks = this.chunkText(doc.content);

    for (let i = 0; i < chunks.length; i++) {
      console.log(`➡ inserting chunk ${i}`);

      const embedding = this.fakeEmbedding(chunks[i]);

      const saved = await this.chunkModel.create({
        docId: doc.id,
        content: chunks[i],
        embedding,
        metadata: { chunkIndex: i },
      });

      console.log('✅ Saved:', saved._id);
    }
  }

  console.log('🎉 DONE');
}
}