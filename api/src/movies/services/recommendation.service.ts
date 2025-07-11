import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movie, MovieDocument } from '../schemas/movie.schema';
import { EmbeddingService } from './embedding.service';
import {
  LangChainFilterService,
  MovieCandidate, 
  FastRankedMovie,
} from './langchain-filter.service';
import { RecommendMoviesInput } from '../dto/recommend-movies.input';
import { MovieRecommendation } from '../models/recommendation.model';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    private embeddingService: EmbeddingService,
    private langChainFilterService: LangChainFilterService,
  ) {}

  async recommendMovies(input: RecommendMoviesInput): Promise<{
    recommendations: MovieRecommendation[];
    totalCount: number;
    hasMore: boolean;
  }> {
    const {
      description,
      limit = 10,
      page = 1,
      genres,
      rated,
      yearFrom,
      yearTo,
    } = input;

    let queryEmbedding: number[] = [];

    try {
      // Step 1: Create embedding for the search description
      this.logger.log(`Creating embedding for description: "${description}"`);

      queryEmbedding = await this.embeddingService.createEmbedding(description);

      // Step 2: Get initial candidates using vector search (get more than needed for filtering)
      const vectorSearchLimit = Math.max(limit * 1, 10); // Get 3x more candidates for filtering

      const pipeline: any[] = [
        {
          $vectorSearch: {
            index: 'vector_index',
            queryVector: queryEmbedding,
            path: 'embedding',
            exact: true,
            limit: vectorSearchLimit,
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            plot: 1,
            fullplot: 1,
            poster: 1,
            year: 1,
            genres: 1,
            rated: 1,
            runtime: 1,
            imdb: 1,
            directors: 1,
            cast: 1,
            languages: 1,
            countries: 1,
            released: 1,
            awards: 1,
            tomatoes: 1,
            type: 1,
            score: {
              $meta: 'vectorSearchScore',
            },
          },
        },
      ];

      // Add additional filters if provided
      const matchFilters: any = {};
      if (genres && genres.length > 0) {
        matchFilters.genres = { $in: genres };
      }
      if (rated) {
        matchFilters.rated = rated;
      }
      if (yearFrom || yearTo) {
        matchFilters.year = {};
        if (yearFrom) matchFilters.year.$gte = yearFrom;
        if (yearTo) matchFilters.year.$lte = yearTo;
      }

      // Add match stage if we have filters
      if (Object.keys(matchFilters).length > 0) {
        pipeline.push({ $match: matchFilters });
      }

      this.logger.log(
        `Executing vector search pipeline to get ${vectorSearchLimit} candidates`,
      );

      // Execute the aggregation pipeline to get candidates
      const vectorResults = await this.movieModel.aggregate(pipeline);

      this.logger.log(
        `Vector search returned ${vectorResults.length} candidates`,
      );

      if (vectorResults.length === 0) {
        return {
          recommendations: [],
          totalCount: 0,
          hasMore: false,
        };
      }

      // Step 3: Convert to MovieCandidate format for LangChain filtering
      const movieCandidates: MovieCandidate[] = vectorResults.map((result) => ({
        id: result._id.toString(),
        title: result.title,
        plot: result.plot,
        fullplot: result.fullplot,
        genres: result.genres,
        year: result.year,
        directors: result.directors,
        cast: result.cast,
        rated: result.rated,
        similarity: result.score || 0,
      }));

      console.log('Movie candidates:', movieCandidates);

      // Step 4: Use LangChain to intelligently filter and rank the candidates
      this.logger.log('Applying fast AI ranking...');
      const rankedMovies =
        await this.langChainFilterService.fastRankMovies(
          description,
          movieCandidates,
        );

      // Step 5: Apply pagination to the ranked results
      const skip = (page - 1) * limit;
      const paginatedRecommendations = rankedMovies.slice(
        skip,
        skip + limit,
      );

      // Step 6: Transform to final recommendation format
      const recommendations: MovieRecommendation[] = await Promise.all(
        paginatedRecommendations.map(async (ranked, index) => {
          const movieData = {
            id: ranked.movie.id,
            title: ranked.movie.title,
            plot: ranked.movie.plot,
            fullplot: ranked.movie.fullplot,
            poster: vectorResults.find(
              (r) => r._id.toString() === ranked.movie.id,
            )?.poster,
            year: ranked.movie.year,
            genres: ranked.movie.genres,
            rated: ranked.movie.rated,
            runtime: vectorResults.find(
              (r) => r._id.toString() === ranked.movie.id,
            )?.runtime,
            imdb: vectorResults.find(
              (r) => r._id.toString() === ranked.movie.id,
            )?.imdb,
            directors: ranked.movie.directors,
            cast: ranked.movie.cast,
            languages: vectorResults.find(
              (r) => r._id.toString() === ranked.movie.id,
            )?.languages,
            countries: vectorResults.find(
              (r) => r._id.toString() === ranked.movie.id,
            )?.countries,
            released: vectorResults.find(
              (r) => r._id.toString() === ranked.movie.id,
            )?.released,
            awards: vectorResults.find(
              (r) => r._id.toString() === ranked.movie.id,
            )?.awards,
            tomatoes: vectorResults.find(
              (r) => r._id.toString() === ranked.movie.id,
            )?.tomatoes,
            type: vectorResults.find(
              (r) => r._id.toString() === ranked.movie.id,
            )?.type,
          };

          // Generate simple reason based on ranking
          const reason = this.generateSimpleReason(
            ranked.relevanceScore,
            index + skip + 1,
            ranked.movie.genres,
          );

          return {
            movie: movieData,
            similarity: ranked.relevanceScore / 100, // Convert back to 0-1 scale
            reason,
          };
        }),
      );

      const totalCount = rankedMovies.length;
      const hasMore = skip + paginatedRecommendations.length < totalCount;

      this.logger.log(
        `Returning ${recommendations.length} recommendations (page ${page}, total: ${totalCount})`,
      );

      return {
        recommendations,
        totalCount,
        hasMore,
      };
    } catch (error) {
      this.logger.error('Error in recommendMovies:', error);

      // Fallback to basic vector search if LangChain fails
      return this.fallbackRecommendation(input, queryEmbedding);
    }
  }

  private generateSimpleReason(
    relevanceScore: number,
    rank: number,
    genres?: string[],
  ): string {
    const rankText = rank <= 3 ? `🏆 Top ${rank}` : `#${rank}`;
    const scoreText =
      relevanceScore >= 90
        ? '🎯 Perfect Match'
        : relevanceScore >= 75
          ? '⭐ Excellent Match'
          : relevanceScore >= 60
            ? '✨ Great Match'
            : '👍 Good Match';

    let reason = `${rankText} • ${scoreText}`;

    if (genres && genres.length > 0) {
      const genresText = genres.slice(0, 2).join(' & ');
      reason += ` • ${genresText}`;
    }

    reason += ` • AI-ranked for relevance`;

    return reason;
  }

  private async fallbackRecommendation(
    input: RecommendMoviesInput,
    queryEmbedding: number[],
  ): Promise<{
    recommendations: MovieRecommendation[];
    totalCount: number;
    hasMore: boolean;
  }> {
    this.logger.warn('Using fallback recommendation method');

    const { limit = 10, page = 1 } = input;

    // Simple vector search without LangChain filtering
    const pipeline: any[] = [
      {
        $vectorSearch: {
          index: 'vector_index',
          queryVector: queryEmbedding,
          path: 'embedding',
          exact: true,
          limit: limit,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          plot: 1,
          poster: 1,
          year: 1,
          genres: 1,
          rated: 1,
          runtime: 1,
          imdb: 1,
          directors: 1,
          cast: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ];

    const results = await this.movieModel.aggregate(pipeline);

    const recommendations: MovieRecommendation[] = results.map(
      (result, index) => ({
        movie: {
          id: result._id.toString(),
          title: result.title,
          plot: result.plot,
          poster: result.poster,
          year: result.year,
          genres: result.genres,
          rated: result.rated,
          runtime: result.runtime,
          imdb: result.imdb,
          directors: result.directors,
          cast: result.cast,
        },
        similarity: result.score || 0,
        reason: `Rank #${index + 1} • Vector similarity match • ${result.genres?.slice(0, 2).join(' & ') || 'Various themes'}`,
      }),
    );

    return {
      recommendations,
      totalCount: recommendations.length,
      hasMore: false,
    };
  }

  private createMovieText(movie: any): string {
    const parts: string[] = [];

    if (movie.title) parts.push(`Title: ${movie.title}`);
    if (movie.plot) parts.push(`Plot: ${movie.plot}`);
    if (movie.fullplot) parts.push(`Full Plot: ${movie.fullplot}`);
    if (movie.genres && movie.genres.length > 0) {
      parts.push(`Genres: ${movie.genres.join(', ')}`);
    }
    if (movie.directors && movie.directors.length > 0) {
      parts.push(`Directors: ${movie.directors.join(', ')}`);
    }
    if (movie.cast && movie.cast.length > 0) {
      parts.push(`Cast: ${movie.cast.slice(0, 10).join(', ')}`);
    }
    if (movie.year) parts.push(`Year: ${movie.year}`);
    if (movie.rated) parts.push(`Rating: ${movie.rated}`);

    return parts.join('. ');
  }

  // Method to create embeddings for existing movies (for initial setup)
  async createMovieEmbeddings(batchSize: number = 10): Promise<void> {
    this.logger.log('Starting to create embeddings for movies...');

    const totalMovies = await this.movieModel.countDocuments();
    this.logger.log(`Total movies to process: ${totalMovies}`);

    let processed = 0;
    let batch = 0;

    while (processed < totalMovies) {
      const movies = await this.movieModel
        .find({ embedding: { $exists: false } }) // Only process movies without embeddings
        .limit(batchSize)
        .exec();

      if (movies.length === 0) {
        break;
      }

      batch++;
      this.logger.log(`Processing batch ${batch}: ${movies.length} movies`);

      for (const movie of movies) {
        try {
          const movieText = this.createMovieText(movie);
          const embedding =
            await this.embeddingService.createEmbedding(movieText);

          await this.movieModel.updateOne(
            { _id: movie._id },
            { $set: { embedding } },
          );

          processed++;

          if (processed % 50 === 0) {
            this.logger.log(`Processed ${processed}/${totalMovies} movies`);
          }
        } catch (error) {
          this.logger.error(`Error processing movie ${movie.title}:`, error);
        }
      }

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    this.logger.log(`Completed processing ${processed} movies`);
  }
}
