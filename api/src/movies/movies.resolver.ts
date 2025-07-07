import { Resolver, Query, Args, ID, Mutation } from '@nestjs/graphql';
import { MoviesService } from './movies.service';
import { RecommendationService } from './services/recommendation.service';
import { Movie, MoviesResponse, MovieFilters } from './models/movie.model';
import { RecommendationsResponse } from './models/recommendation.model';
import { AllMoviesInput } from './dto/all-movies.input';
import { RecommendMoviesInput } from './dto/recommend-movies.input';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';

@Resolver(() => Movie)
export class MoviesResolver {
  constructor(
    private readonly moviesService: MoviesService,
    private readonly recommendationService: RecommendationService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Query(() => MoviesResponse, { name: 'movies' })
  async getMovies(
    @Args('input') input: AllMoviesInput,
  ): Promise<MoviesResponse> {
    const result = await this.moviesService.findAll(input);
    const filters = await this.moviesService.getFilters();

    this.logger.info('Processing getMovies request', input, filters);

    return {
      movies: result.movies,
      totalCount: result.totalCount,
      hasMore: result.hasMore,
      filters,
    };
  }

  @Query(() => Movie, { name: 'movie', nullable: true })
  async getMovie(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Movie | null> {
    this.logger.info('Processing getMovie request', id);
    return this.moviesService.findById(id);
  }

  @Query(() => MovieFilters, { name: 'movieFilters' })
  async getMovieFilters(): Promise<MovieFilters> {
    this.logger.info('Processing getMovieFilters request', MovieFilters);
    return this.moviesService.getFilters();
  }

  @Query(() => RecommendationsResponse, { name: 'recommendMovies' })
  async recommendMovies(
    @Args('input') input: RecommendMoviesInput,
  ): Promise<RecommendationsResponse> {
    this.logger.info('Processing recommendMovies request', input);
    
    const result = await this.recommendationService.recommendMovies(input);
    
    return {
      recommendations: result.recommendations,
      totalCount: result.totalCount,
      hasMore: result.hasMore,
      searchDescription: input.description,
    };
  }

  // Admin mutation to create embeddings for existing movies
  @Mutation(() => String, { name: 'createMovieEmbeddings' })
  async createMovieEmbeddings(
    @Args('batchSize', { type: () => Number, defaultValue: 10 }) batchSize: number,
  ): Promise<string> {
    this.logger.info('Processing createMovieEmbeddings request', { batchSize });
    
    try {
      await this.recommendationService.createMovieEmbeddings(batchSize);
      return 'Movie embeddings created successfully';
    } catch (error) {
      this.logger.error('Error creating movie embeddings:', error);
      throw new Error(`Failed to create movie embeddings: ${error.message}`);
    }
  }
}