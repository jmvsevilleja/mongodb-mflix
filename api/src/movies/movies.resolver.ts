import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { MoviesService } from './movies.service';
import { Movie, MoviesResponse, MovieFilters } from './models/movie.model';
import { AllMoviesInput } from './dto/all-movies.input';

@Resolver(() => Movie)
export class MoviesResolver {
  constructor(private readonly moviesService: MoviesService) {}

  @Query(() => MoviesResponse, { name: 'movies' })
  async getMovies(
    @Args('input') input: AllMoviesInput,
  ): Promise<MoviesResponse> {
    const result = await this.moviesService.findAll(input);
    const filters = await this.moviesService.getFilters();

    return {
      movies: result.movies,
      totalCount: result.totalCount,
      hasMore: result.hasMore,
      filters,
    };
  }

  @Query(() => Movie, { name: 'movie', nullable: true })
  async getMovie(@Args('id', { type: () => ID }) id: string): Promise<Movie | null> {
    return this.moviesService.findById(id);
  }

  @Query(() => MovieFilters, { name: 'movieFilters' })
  async getMovieFilters(): Promise<MovieFilters> {
    return this.moviesService.getFilters();
  }
}