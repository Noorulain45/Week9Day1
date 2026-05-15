import { Controller, Post, Body } from '@nestjs/common';
import { AgentsService } from '../services/agents.service';

@Controller('qa')
export class QaController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post('ask')
  async ask(@Body() body: { docId: string; question: string }) {
    return this.agentsService.answerQuestion(body.docId, body.question);
  }

  @Post('summarize')
  async summarize(@Body() body: { docId: string }) {
    return this.agentsService.summarizeDocument(body.docId);
  }

  @Post('search')
  async search(@Body() body: { query: string }) {
    return this.agentsService.searchByEmbedding(body.query);
  }
}
