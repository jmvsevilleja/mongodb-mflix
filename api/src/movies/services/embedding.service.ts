import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Mistral } from '@mistralai/mistralai';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly mistralClient: Mistral;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('MISTRAL_API_KEY');
    if (!apiKey) {
      this.logger.warn('MISTRAL_API_KEY not found in environment variables');
      throw new Error('Mistral API key not configured');
    }

    this.mistralClient = new Mistral({
      apiKey: apiKey,
    });
  }

  async createEmbedding(text: string): Promise<number[]> {
    try {
      this.logger.debug(
        `Creating embedding for text: ${text.substring(0, 100)}...`,
      );

      const response = await this.mistralClient.embeddings.create({
        model: 'mistral-embed',
        inputs: [text],
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No embedding data received from Mistral API');
      }

      const embedding = response.data[0].embedding;
      if (!embedding) {
        throw new Error('Embedding data is undefined');
      }

      this.logger.debug(
        `Created embedding with ${embedding.length} dimensions`,
      );

      return embedding;
    } catch (error) {
      this.logger.error('Error creating embedding:', error);
      throw new Error(`Failed to create embedding: ${error.message}`);
    }
  }

  calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  async createBatchEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      this.logger.debug(`Creating batch embeddings for ${texts.length} texts`);

      const response = await this.mistralClient.embeddings.create({
        model: 'mistral-embed',
        inputs: texts,
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No embedding data received from Mistral API');
      }

      const embeddings = response.data.map((item) => item.embedding);
      if (embeddings.some((embedding) => !embedding)) {
        throw new Error('Some embedding data is undefined');
      }

      return embeddings as number[][];
    } catch (error) {
      this.logger.error('Error creating batch embeddings:', error);
      throw new Error(`Failed to create batch embeddings: ${error.message}`);
    }
  }
}
