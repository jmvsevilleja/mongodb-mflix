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

      // Get movies from database
      const movies = await this.movieModel
        .find(filter)
        .limit(1000) // Limit to prevent memory issues
        .exec();

      this.logger.log(`Found ${movies.length} movies to analyze`);

      // Calculate similarities
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

          // Generate reason for recommendation
          const reason = this.generateRecommendationReason(movie, description, similarity);

          recommendations.push({
            movie: movie.toJSON(),
            similarity,
            reason,
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

      return {
        recommendations: paginatedRecommendations,
        totalCount: recommendations.length,
        hasMore: endIndex < recommendations.length,
      };
    } catch (error) {
      this.logger.error('Error in recommendMovies:', error);
      throw new Error(`Failed to generate recommendations: ${error.message}`);
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

  private generateRecommendationReason(movie: any, description: string, similarity: number): string {
    const reasons = [];
    
    if (similarity > 0.8) {
      reasons.push('Excellent match for your description');
    } else if (similarity > 0.6) {
      reasons.push('Good match for your description');
    } else if (similarity > 0.4) {
      reasons.push('Moderate match for your description');
    } else {
      reasons.push('Some similarities to your description');
    }

    // Add specific reasons based on movie attributes
    if (movie.genres && movie.genres.length > 0) {
      const genreText = movie.genres.slice(0, 2).join(' and ');
      reasons.push(`${genreText} themes`);
    }

    if (movie.year) {
      const decade = Math.floor(movie.year / 10) * 10;
      reasons.push(`${decade}s film`);
    }

    return reasons.join(' • ');
  }
}