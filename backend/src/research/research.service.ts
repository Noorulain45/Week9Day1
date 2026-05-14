import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { ResearchDocument } from '../schemas/document.schema';
import Groq from 'groq-sdk';

/* ================= GROQ INIT ================= */
// This now pulls strictly from your environment variables.
// Make sure GROQ_API_KEY is defined in your .env file.
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ================= STATE ================= */
const ResearchState = Annotation.Root({
  question: Annotation<string>(),

  isValid: Annotation<boolean>({
    value: (prev, next) => next ?? prev,
    default: () => true,
  }),

  topic: Annotation<string, string>({
    value: (prev, next) => next ?? prev,
    default: () => '',
  }),

  documents: Annotation<any[], any[]>({
    value: (_, next) => next,
    default: () => [],
  }),

  summaries: Annotation<string[], string[]>({
    value: (prev, next) => [...prev, ...next],
    default: () => [],
  }),

  contradictions: Annotation<string[], string[]>({
    value: (prev, next) => [...prev, ...next],
    default: () => [],
  }),

  trace: Annotation<string[], string[]>({
    value: (prev, next) => [...prev, ...next],
    default: () => [],
  }),

  finalAnswer: Annotation<string, string>({
    value: (_, next) => next,
    default: () => '',
  }),
});

@Injectable()
export class ResearchService {
  constructor(
    @InjectModel(ResearchDocument.name)
    private docModel: Model<ResearchDocument>,
  ) {}

  /* ================= VALIDATOR ================= */
  private async validatorNode(state: typeof ResearchState.State) {
    if (!state.question || state.question.trim().length < 3) {
      return {
        isValid: false,
        trace: ['Invalid question detected'],
      };
    }

    return {
      isValid: true,
      trace: ['Question validated'],
    };
  }

  /* ================= FINDER ================= */
  private async finderNode(state: typeof ResearchState.State) {
    const docs = await this.docModel.find().limit(5).lean();

    return {
      documents: docs,
      trace: [`Fetched ${docs.length} documents`],
    };
  }

  /* ================= SUMMARIZER ================= */
  private async summarizerNode(state: typeof ResearchState.State) {
    const summaries = state.documents.map((doc) => {
      return `🔹 ${doc.content}`;
    });

    return {
      summaries,
      trace: ['Summarized documents'],
    };
  }

  /* ================= CHECKER ================= */
  private async checkerNode(state: typeof ResearchState.State) {
    return {
      contradictions: [],
      trace: ['No contradictions check applied'],
    };
  }

  /* ================= WRITER ================= */
  private async writerNode(state: typeof ResearchState.State) {
    if (!state.documents.length && state.isValid) {
      return {
        finalAnswer: `❌ No data found in database.`,
      };
    }

    const context = state.documents
      .map((d, i) => `(${i + 1}) ${d.content}`)
      .join('\n\n');

    const prompt = `
You are a strict AI assistant.
Answer ONLY from context below.

CONTEXT:
${context}

QUESTION:
${state.question}

ANSWER:
`;

    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
    });

    const answer =
      completion.choices[0]?.message?.content || 'No response';

    return {
      finalAnswer: answer,
      trace: ['Groq answer generated'],
    };
  }

  /* ================= WORKFLOW ================= */
  async runWorkflow(question: string) {
    const workflow = new StateGraph(ResearchState)
      .addNode('validator', (s) => this.validatorNode(s))
      .addNode('finder', (s) => this.finderNode(s))
      .addNode('summarizer', (s) => this.summarizerNode(s))
      .addNode('checker', (s) => this.checkerNode(s))
      .addNode('writer', (s) => this.writerNode(s))

      .addEdge(START, 'validator')

      .addConditionalEdges(
        'validator',
        (state) => (state.isValid ? 'proceed' : 'reject'),
        {
          proceed: 'finder',
          reject: 'writer',
        },
      )

      .addEdge('finder', 'summarizer')
      .addEdge('summarizer', 'checker')
      .addEdge('checker', 'writer')
      .addEdge('writer', END);

    const app = workflow.compile();

    return app.invoke({
      question,
      topic: '',
      documents: [],
      summaries: [],
      contradictions: [],
      trace: [],
      isValid: true,
    });
  }
}