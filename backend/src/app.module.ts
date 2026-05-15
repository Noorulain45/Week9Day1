import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ResearchModule } from './research/research.module';
import { SeedModule } from './seed/seed.module';

// Import your new files
import { QaController } from './controllers/qa.controller';
import { AgentsService } from './services/agents.service';
import { DocumentChunk, DocumentChunkSchema } from 'src/document-chunk.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule, SeedModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),

    // Register schema for DocumentChunk
    MongooseModule.forFeature([
      { name: DocumentChunk.name, schema: DocumentChunkSchema },
    ]),

    ResearchModule,
  ],
  controllers: [QaController],   // Add QA controller
  providers: [AgentsService],    // Add Agents service
})
export class AppModule {}
