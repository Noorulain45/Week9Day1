import {
  Controller,
  Post,
  Body,
  BadRequestException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { ResearchService } from './research.service';


class AskQuestionDto {
  question!: string;
}

@Controller('research')
export class ResearchController {
  private readonly logger = new Logger(ResearchController.name);

  constructor(private readonly researchService: ResearchService) {}

  @Post('ask')
  async ask(@Body() body: AskQuestionDto) {
    // ✅ Proper validation
    if (!body.question || body.question.trim().length < 3) {
      throw new BadRequestException('A valid question (min 3 chars) is required.');
    }

    try {
      const result = await this.researchService.runWorkflow(body.question);

      // ✅ Clean response shape (important for frontend)
      return {
        success: true,
        question: body.question,
        answer: result.finalAnswer,
        trace: result.trace, // optional (remove in production if needed)
        meta: {
          documentsAnalyzed: result.documents?.length || 0,
          summariesGenerated: result.summaries?.length || 0,
          contradictionsFound: result.contradictions?.length || 0
        }
      };

    } catch (error:any) {
      // ✅ Better logging
      this.logger.error('Workflow execution failed', error.stack);

      throw new InternalServerErrorException(
        'The research system failed to process your request.'
      );
    }
  }
}