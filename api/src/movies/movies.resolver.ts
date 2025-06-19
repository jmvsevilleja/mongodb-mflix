import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Movie } from './models/movie.model';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AllMoviesInput } from './dto/all-movies.input'; // Import the new DTO

@Resolver(() => Movie)
export class MoviesResolver {
  constructor(private readonly moviesService: MoviesService) {}

  @Query(() => [Movie], { name: 'allMovies' })
  async allMovies(
    @Args('input') input: AllMoviesInput, // Use the DTO here
  ): Promise<Movie[]> {
    const { page, limit, searchTerm, sortBy, sortOrder, userId } = input;
    return this.moviesService.findAll(
      page,
      limit,
      searchTerm,
      sortBy,
      sortOrder,
      userId,
    );
  }
}
