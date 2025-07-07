import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface EmbeddingResponse {
  data: Array<{
    embedding: number[];
  }>;
}

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.mistral.ai/v1';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('MISTRAL_API_KEY');
    if (!this.apiKey) {
      this.logger.warn('MISTRAL_API_KEY not found in environment variables');
    }
  }

  async createEmbedding(text: string): Promise<number[]> {
    if (!this.apiKey) {
      throw new Error('Mistral API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'mistral-embed',
          inputs: [text],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
      }

      const data: EmbeddingResponse = await response.json();
      
      if (!data.data || data.data.length === 0) {
        throw new Error('No embedding data received from Mistral API');
      }

      return data.data[0].embedding;
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
    if (!this.apiKey) {
      throw new Error('Mistral API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'mistral-embed',
          inputs: texts,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
      }

      const data: EmbeddingResponse = await response.json();
      
      return data.data.map(item => item.embedding);
    } catch (error) {
      this.logger.error('Error creating batch embeddings:', error);
      throw new Error(`Failed to create batch embeddings: ${error.message}`);
    }
  }
}