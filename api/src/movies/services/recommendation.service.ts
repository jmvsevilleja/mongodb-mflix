import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movie, MovieDocument } from '../schemas/movie.schema';
import { EmbeddingService } from './embedding.service';
import { RecommendMoviesInput } from '../dto/recommend-movies.input';
import { MovieRecommendation } from '../models/recommendation.model';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    private embeddingService: EmbeddingService,
  ) {}

  async recommendMovies(input: RecommendMoviesInput): Promise<{
    recommendations: MovieRecommendation[];
    totalCount: number;
    hasMore: boolean;
  }> {
    const { description, limit = 10, page = 1, genres, rated, yearFrom, yearTo } = input;

    try {
      // Create embedding for the search description
      this.logger.log(`Creating embedding for description: "${description}"`);
      const queryEmbedding = await this.embeddingService.createEmbedding(description);

      // Build the vector search pipeline
      const pipeline: any[] = [
        {
          $vectorSearch: {
            index: "vector_index",
            queryVector: queryEmbedding,
            path: "embedding",
            exact: true,
            limit: limit * 3, // Get more results to filter
          }
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
              $meta: "vectorSearchScore"
            }
          }
        }
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

      // Add pagination
      const skip = (page - 1) * limit;
      if (skip > 0) {
        pipeline.push({ $skip: skip });
      }
      pipeline.push({ $limit: limit });

      this.logger.log(`Executing vector search pipeline with ${pipeline.length} stages`);
      
      // Execute the aggregation pipeline
      const results = await this.movieModel.aggregate(pipeline);

      this.logger.log(`Vector search returned ${results.length} results`);

      // Transform results to recommendations
      const recommendations: MovieRecommendation[] = results.map((result, index) => {
        // Convert MongoDB document to JSON format
        const movieData = {
          id: result._id.toString(),
          title: result.title,
          plot: result.plot,
          fullplot: result.fullplot,
          poster: result.poster,
          year: result.year,
          genres: result.genres,
          rated: result.rated,
          runtime: result.runtime,
          imdb: result.imdb,
          directors: result.directors,
          cast: result.cast,
          languages: result.languages,
          countries: result.countries,
          released: result.released,
          awards: result.awards,
          tomatoes: result.tomatoes,
          type: result.type,
        };

        // Use the vector search score as similarity
        const similarity = result.score || 0;
        
        // Generate reason for recommendation
        const reason = this.generateRecommendationReason(movieData, description, similarity, index + 1);

        return {
          movie: movieData,
          similarity,
          reason,
        };
      });

      // For now, we'll assume we got all results (MongoDB vector search handles pagination)
      // In a production environment, you might want to do a separate count query
      const totalCount = recommendations.length;
      const hasMore = recommendations.length === limit;

      return {
        recommendations,
        totalCount,
        hasMore,
      };
    } catch (error) {
      this.logger.error('Error in recommendMovies:', error);
      
      // Fallback to traditional search if vector search fails
      if (error.message.includes('vector_index') || error.message.includes('$vectorSearch')) {
        this.logger.warn('Vector search failed, falling back to traditional similarity search');
        return this.fallbackRecommendation(input);
      }
      
      throw new Error(`Failed to generate recommendations: ${error.message}`);
    }
  }

  private async fallbackRecommendation(input: RecommendMoviesInput): Promise<{
    recommendations: MovieRecommendation[];
    totalCount: number;
    hasMore: boolean;
  }> {
    const { description, limit = 10, page = 1, genres, rated, yearFrom, yearTo } = input;

    try {
      // Create embedding for the search description
      const searchEmbedding = await this.embeddingService.createEmbedding(description);

      // Build filter query
      const filter: any = {};
      if (genres && genres.length > 0) {
        filter.genres = { $in: genres };
      }
      if (rated) {
        filter.rated = rated;
      }
      if (yearFrom || yearTo) {
        filter.year = {};
        if (yearFrom) filter.year.$gte = yearFrom;
        if (yearTo) filter.year.$lte = yearTo;
      }

      // Get movies from database (limited to prevent memory issues)
      const movies = await this.movieModel
        .find(filter)
        .limit(500)
        .exec();

      this.logger.log(`Fallback: Found ${movies.length} movies to analyze`);

      // Calculate similarities using in-memory computation
      const recommendations: MovieRecommendation[] = [];

      for (const movie of movies) {
        try {
          // Create a comprehensive text representation of the movie
          const movieText = this.createMovieText(movie);
          
          // Create embedding for the movie
          const movieEmbedding = await this.embeddingService.createEmbedding(movieText);
          
          // Calculate similarity
          const similarity = this.embeddingService.calculateCosineSimilarity(
            searchEmbedding,
            movieEmbedding
          );

          recommendations.push({
            movie: movie.toJSON(),
            similarity,
            reason: '',
          });
        } catch (error) {
          this.logger.warn(`Error processing movie ${movie.title}:`, error.message);
          continue;
        }
      }

      // Sort by similarity (highest first)
      recommendations.sort((a, b) => b.similarity - a.similarity);

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedRecommendations = recommendations.slice(startIndex, endIndex);

      // Add reasons after sorting
      paginatedRecommendations.forEach((rec, index) => {
        rec.reason = this.generateRecommendationReason(rec.movie, description, rec.similarity, startIndex + index + 1);
      });

      return {
        recommendations: paginatedRecommendations,
        totalCount: recommendations.length,
        hasMore: endIndex < recommendations.length,
      };
    } catch (error) {
      this.logger.error('Error in fallback recommendation:', error);
      throw new Error(`Failed to generate fallback recommendations: ${error.message}`);
    }
  }

  private createMovieText(movie: any): string {
    const parts = [];
    
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

  private generateRecommendationReason(movie: any, description: string, similarity: number, rank: number): string {
    const reasons = [];
    
    // Add ranking
    if (rank <= 3) {
      reasons.push(`Top ${rank} match`);
    } else {
      reasons.push(`Rank #${rank}`);
    }

    // Add similarity-based reason
    if (similarity > 0.8) {
      reasons.push('Excellent semantic match');
    } else if (similarity > 0.6) {
      reasons.push('Strong thematic similarity');
    } else if (similarity > 0.4) {
      reasons.push('Good conceptual match');
    } else {
      reasons.push('Related themes');
    }

    // Add specific reasons based on movie attributes
    if (movie.genres && movie.genres.length > 0) {
      const genreText = movie.genres.slice(0, 2).join(' & ');
      reasons.push(`${genreText} elements`);
    }

    if (movie.year) {
      const decade = Math.floor(movie.year / 10) * 10;
      reasons.push(`${decade}s classic`);
    }

    return reasons.join(' • ');
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
          const embedding = await this.embeddingService.createEmbedding(movieText);
          
          await this.movieModel.updateOne(
            { _id: movie._id },
            { $set: { embedding } }
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
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.logger.log(`Completed processing ${processed} movies`);
  }
}