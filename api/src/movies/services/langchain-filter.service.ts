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

export interface FilteredRecommendation {
  movie: MovieCandidate;
  relevanceScore: number;
  explanation: string;
  matchingElements: string[];
}

@Injectable()
export class LangChainFilterService {
  private readonly logger = new Logger(LangChainFilterService.name);
  private readonly model: ChatMistralAI;
  private readonly filterChain: RunnableSequence;

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

    this.filterChain = this.createFilterChain();
  }

  private createFilterChain(): RunnableSequence {
    const promptTemplate = PromptTemplate.fromTemplate(`
You are a helpful AI assistant that provides intelligent movie recommendations and filtering.

Your task is to analyze movie candidates and determine their relevance to a user's search query.
For each movie, provide a relevance score (0-100) and a detailed explanation.

### User Query ###
{userQuery}

### Movie Candidates ###
{movieCandidates}

### Instructions ###
1. Analyze each movie's plot, genres, themes, and other attributes
2. Determine how well each movie matches the user's query
3. Consider semantic similarity, thematic elements, and contextual relevance
4. Provide a relevance score from 0-100 (100 being perfect match)
5. Give a clear explanation of why the movie is relevant
6. Identify specific matching elements (themes, characters, plot elements, etc.)

### Output Format ###
For each movie, provide a JSON object with this exact structure:
{{
  "movieId": "movie_id_here",
  "relevanceScore": 85,
  "explanation": "This movie matches your query because...",
  "matchingElements": ["friendship themes", "adventure elements", "character development"]
}}

Return only a valid JSON array of these objects, nothing else.

### Example ###
User Query: "a story where a cowboy and astronaut become friends"
Movie: Toy Story (1995) - A cowboy doll is profoundly threatened when a new spaceman figure supplants him as top toy in a boy's room.

Response:
[{{
  "movieId": "toy_story_1995",
  "relevanceScore": 95,
  "explanation": "Perfect match! This movie literally features a cowboy (Woody) and a space ranger (Buzz Lightyear) who start as rivals but develop a deep friendship. The core theme is about overcoming differences and building unlikely friendships.",
  "matchingElements": ["cowboy character", "astronaut/space ranger character", "friendship development", "rivalry to friendship arc"]
}}]

Now analyze the provided movies:
`);

    return RunnableSequence.from([
      promptTemplate,
      this.model,
      new StringOutputParser(),
    ]);
  }

  async filterAndRankMovies(
    userQuery: string,
    movieCandidates: MovieCandidate[],
  ): Promise<FilteredRecommendation[]> {
    try {
      this.logger.log(
        `Filtering ${movieCandidates.length} movie candidates for query: "${userQuery}"`,
      );

      // Prepare movie candidates for the prompt
      const candidatesText = movieCandidates
        .map((movie, index) => {
          const plotText = movie.fullplot || movie.plot || 'No plot available';
          const genresText = movie.genres?.join(', ') || 'Unknown genres';
          const directorsText = movie.directors?.join(', ') || 'Unknown directors';
          const castText = movie.cast?.slice(0, 5).join(', ') || 'Unknown cast';

          return `
Movie ${index + 1}:
ID: ${movie.id}
Title: ${movie.title} (${movie.year || 'Unknown year'})
Plot: ${plotText}
Genres: ${genresText}
Directors: ${directorsText}
Main Cast: ${castText}
Rating: ${movie.rated || 'Not rated'}
Vector Similarity: ${(movie.similarity * 100).toFixed(1)}%
---`;
        })
        .join('\n');

      // Execute the LangChain sequence
      const response = await this.filterChain.invoke({
        userQuery,
        movieCandidates: candidatesText,
      });

      this.logger.debug('LangChain response received');

      // Parse the JSON response
      let analysisResults: any[];
      try {
        // Clean the response to extract JSON
        const cleanedResponse = this.extractJsonFromResponse(response);
        analysisResults = JSON.parse(cleanedResponse);
      } catch (parseError) {
        this.logger.error('Failed to parse LangChain response:', parseError);
        this.logger.debug('Raw response:', response);
        
        // Fallback: return original candidates with basic scoring
        return this.createFallbackRecommendations(movieCandidates, userQuery);
      }

      // Map results back to movies and create filtered recommendations
      const filteredRecommendations: FilteredRecommendation[] = [];

      for (const result of analysisResults) {
        const movie = movieCandidates.find(m => 
          m.id === result.movieId || 
          m.title.toLowerCase().includes(result.movieId?.toLowerCase()) ||
          result.movieId?.toLowerCase().includes(m.title.toLowerCase())
        );

        if (movie && result.relevanceScore > 30) { // Only include movies with decent relevance
          filteredRecommendations.push({
            movie,
            relevanceScore: result.relevanceScore,
            explanation: result.explanation || 'AI analysis indicates this movie matches your query.',
            matchingElements: result.matchingElements || [],
          });
        }
      }

      // Sort by relevance score (highest first)
      filteredRecommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);

      this.logger.log(
        `Filtered to ${filteredRecommendations.length} relevant recommendations`,
      );

      return filteredRecommendations;
    } catch (error) {
      this.logger.error('Error in filterAndRankMovies:', error);
      
      // Fallback to original candidates
      return this.createFallbackRecommendations(movieCandidates, userQuery);
    }
  }

  private extractJsonFromResponse(response: string): string {
    // Try to find JSON array in the response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return jsonMatch[0];
    }

    // If no array found, try to find individual JSON objects and wrap them
    const objectMatches = response.match(/\{[\s\S]*?\}/g);
    if (objectMatches) {
      return `[${objectMatches.join(',')}]`;
    }

    throw new Error('No valid JSON found in response');
  }

  private createFallbackRecommendations(
    movieCandidates: MovieCandidate[],
    userQuery: string,
  ): FilteredRecommendation[] {
    this.logger.warn('Using fallback recommendation scoring');

    return movieCandidates.map((movie, index) => ({
      movie,
      relevanceScore: Math.max(20, Math.round(movie.similarity * 100) - index * 5),
      explanation: `This movie has a ${(movie.similarity * 100).toFixed(1)}% semantic similarity to your query. ${
        movie.genres?.length ? `Genres include ${movie.genres.slice(0, 2).join(' and ')}.` : ''
      }`,
      matchingElements: movie.genres?.slice(0, 3) || ['general themes'],
    }));
  }

  async generateDetailedExplanation(
    userQuery: string,
    movie: MovieCandidate,
    relevanceScore: number,
  ): Promise<string> {
    try {
      const explanationPrompt = PromptTemplate.fromTemplate(`
You are a movie expert explaining why a specific movie matches a user's search query.

User Query: "{userQuery}"

Movie Details:
- Title: {movieTitle} ({movieYear})
- Plot: {moviePlot}
- Genres: {movieGenres}
- Directors: {movieDirectors}
- Cast: {movieCast}

Relevance Score: {relevanceScore}/100

Provide a detailed, engaging explanation (2-3 sentences) of why this movie matches the user's query. 
Focus on specific plot elements, themes, characters, or other aspects that align with what the user is looking for.
Be conversational and enthusiastic, like a knowledgeable friend recommending a movie.
`);

      const explanationChain = RunnableSequence.from([
        explanationPrompt,
        this.model,
        new StringOutputParser(),
      ]);

      const explanation = await explanationChain.invoke({
        userQuery,
        movieTitle: movie.title,
        movieYear: movie.year || 'Unknown',
        moviePlot: movie.fullplot || movie.plot || 'Plot not available',
        movieGenres: movie.genres?.join(', ') || 'Unknown',
        movieDirectors: movie.directors?.join(', ') || 'Unknown',
        movieCast: movie.cast?.slice(0, 5).join(', ') || 'Unknown',
        relevanceScore,
      });

      return explanation.trim();
    } catch (error) {
      this.logger.error('Error generating detailed explanation:', error);
      return `This movie has a ${relevanceScore}% relevance match to your query based on its themes and content.`;
    }
  }
}