import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DocumentChunkDocument = HydratedDocument<DocumentChunk>;

@Schema()
export class DocumentChunk {

  @Prop({ type: String, required: true })
  docId: string | undefined;

  @Prop({ type: String, required: true })
  content: string | undefined;

  @Prop({ type: [Number], required: true })
  embedding: number[] | undefined;

  @Prop({
    type: Object,
  })
  metadata: Record<string, any> | undefined;
}

export const DocumentChunkSchema = SchemaFactory.createForClass(DocumentChunk);