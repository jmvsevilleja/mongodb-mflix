import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatMistralAI } from '@langchain/mistralai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

export interface MovieCandidate {
  id: string;
  title: string;
  plot?: string;
  fullplot?: string;
  genres?: string[];
  year?: number;
  directors?: string[];
  cast?: string[];
  rated?: string;
  similarity: number;
}

export interface FastRankedMovie {
  movie: MovieCandidate;
  relevanceScore: number;
}

@Injectable()
export class LangChainFilterService {
  private readonly logger = new Logger(LangChainFilterService.name);
  private readonly model: ChatMistralAI;
  private readonly fastRankingChain: RunnableSequence;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('MISTRAL_API_KEY');
    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY not found in environment variables');
    }

    this.model = new ChatMistralAI({
      apiKey: apiKey,
      model: 'mistral-large-latest',
      temperature: 0.1,
    });

    this.fastRankingChain = this.createFastRankingChain();
  }

  private createFastRankingChain(): RunnableSequence {
    const promptTemplate = PromptTemplate.fromTemplate(`
You are a movie recommendation AI. Your task is to quickly rank movies by relevance to a user query.

User Query: "{userQuery}"

Movies to rank (with vector similarity scores):
{movieList}

Instructions:
1. Analyze each movie's relevance to the user query
2. Consider plot, genres, themes, and vector similarity
3. Return ONLY a JSON array with movie IDs ranked by relevance (most relevant first)
4. Format: ["movie_id_1", "movie_id_2", "movie_id_3", ...]
5. Include ALL movies in the ranking, just reorder them

Example:
User Query: "space adventure with robots"
Response: ["star_wars_id", "wall_e_id", "interstellar_id", "blade_runner_id"]

Return only the JSON array, no other text:
`);

    return RunnableSequence.from([
      promptTemplate,
      this.model,
      new StringOutputParser(),
    ]);
  }

  async fastRankMovies(
    userQuery: string,
    movieCandidates: MovieCandidate[],
  ): Promise<FastRankedMovie[]> {
    try {
      this.logger.log(
        `Fast ranking ${movieCandidates.length} movies for query: "${userQuery}"`,
      );

      // Prepare movie list for the prompt
      const movieList = movieCandidates
        .map((movie, index) => {
          const plotText = movie.fullplot || movie.plot || 'No plot available';
          const genresText = movie.genres?.join(', ') || 'Unknown genres';
          
          return `${index + 1}. ID: ${movie.id}
Title: ${movie.title} (${movie.year || 'Unknown year'})
Plot: ${plotText.substring(0, 200)}...
Genres: ${genresText}
Vector Similarity: ${(movie.similarity * 100).toFixed(1)}%`;
        })
        .join('\n\n');

      // Execute the fast ranking chain
      const response = await this.fastRankingChain.invoke({
        userQuery,
        movieList,
      });

      this.logger.debug('Fast ranking response received');

      // Parse the JSON response
      let rankedIds: string[];
      try {
        // Clean the response to extract JSON array
        const cleanedResponse = this.extractJsonArrayFromResponse(response);
        rankedIds = JSON.parse(cleanedResponse);
      } catch (parseError) {
        this.logger.error('Failed to parse ranking response:', parseError);
        this.logger.debug('Raw response:', response);
        
        // Fallback: return original order with vector similarity scores
        return this.createFallbackRanking(movieCandidates);
      }

      // Reorder movies based on AI ranking
      const rankedMovies: FastRankedMovie[] = [];
      const movieMap = new Map(movieCandidates.map(m => [m.id, m]));

      // Add movies in AI-ranked order
      rankedIds.forEach((id, index) => {
        const movie = movieMap.get(id);
        if (movie) {
          rankedMovies.push({
            movie,
            relevanceScore: Math.max(95 - (index * 5), 20), // Decreasing score based on rank
          });
          movieMap.delete(id); // Remove from map to avoid duplicates
        }
      });

      // Add any remaining movies that weren't in the AI response
      movieMap.forEach((movie) => {
        rankedMovies.push({
          movie,
          relevanceScore: 15, // Low score for unranked movies
        });
      });

      this.logger.log(
        `Fast ranking completed: ${rankedMovies.length} movies ranked`,
      );

      return rankedMovies;
    } catch (error) {
      this.logger.error('Error in fastRankMovies:', error);
      
      // Fallback to vector similarity ranking
      return this.createFallbackRanking(movieCandidates);
    }
  }

  private extractJsonArrayFromResponse(response: string): string {
    // Try to find JSON array in the response
    const jsonMatch = response.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      return jsonMatch[0];
    }

    // If no array found, try to extract movie IDs and create array
    const idMatches = response.match(/"[^"]+"/g);
    if (idMatches) {
      return `[${idMatches.join(',')}]`;
    }

    throw new Error('No valid JSON array found in response');
  }

  private createFallbackRanking(movieCandidates: MovieCandidate[]): FastRankedMovie[] {
    this.logger.warn('Using fallback ranking based on vector similarity');

    return movieCandidates
      .sort((a, b) => b.similarity - a.similarity) // Sort by vector similarity
      .map((movie, index) => ({
        movie,
        relevanceScore: Math.max(90 - (index * 3), 20), // Decreasing score
      }));
  }
}