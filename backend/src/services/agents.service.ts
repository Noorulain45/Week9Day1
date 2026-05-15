import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentChunk } from 'src/document-chunk.schema';

@Injectable()
export class AgentsService {
  constructor(
    @InjectModel(DocumentChunk.name) private chunkModel: Model<DocumentChunk>,
  ) {}

  async answerQuestion(docId: string, question: string) {
    const chunks = await this.chunkModel.find({ docId }).exec();
    // For now: simple keyword search
    const relevant = chunks.filter(c =>
      c.content?.toLowerCase().includes(question.toLowerCase()),
    );
    return {
      docId,
      question,
      answer: relevant.map(r => r.content),
    };
  }

  async summarizeDocument(docId: string) {
    const chunks = await this.chunkModel.find({ docId }).exec();
    const summary = chunks.map(c => c.content).join(' ');
    return { docId, summary };
  }

  async searchByEmbedding(query: string) {
    // Placeholder: in real use, compute embedding for query and compare
    const chunks = await this.chunkModel.find().exec();
    const matches = chunks.filter(c =>
      c.content?.toLowerCase().includes(query.toLowerCase()),
    );
    return { query, matches };
  }
}
