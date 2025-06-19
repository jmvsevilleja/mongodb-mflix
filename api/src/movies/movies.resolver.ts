import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { MoviesService } from './movies.service';
import { Movie, MoviesResponse, MovieFilters } from './models/movie.model';
import { AllMoviesInput } from './dto/all-movies.input';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';

@Resolver(() => Movie)
export class MoviesResolver {
  constructor(
    private readonly moviesService: MoviesService,
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
}
