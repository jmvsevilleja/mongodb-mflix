import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class Awards {
  @Field(() => Int, { nullable: true })
  wins?: number;

  @Field(() => Int, { nullable: true })
  nominations?: number;

  @Field({ nullable: true })
  text?: string;
}

@ObjectType()
export class Imdb {
  @Field(() => Float, { nullable: true })
  rating?: number;

  @Field(() => Int, { nullable: true })
  votes?: number;

  @Field(() => Int, { nullable: true })
  id?: number;
}

@ObjectType()
export class Viewer {
  @Field(() => Float, { nullable: true })
  rating?: number;

  @Field(() => Int, { nullable: true })
  numReviews?: number;

  @Field(() => Int, { nullable: true })
  meter?: number;
}

@ObjectType()
export class Critic {
  @Field(() => Float, { nullable: true })
  rating?: number;

  @Field(() => Int, { nullable: true })
  numReviews?: number;

  @Field(() => Int, { nullable: true })
  meter?: number;
}

@ObjectType()
export class Tomatoes {
  @Field(() => Viewer, { nullable: true })
  viewer?: Viewer;

  @Field(() => Int, { nullable: true })
  fresh?: number;

  @Field(() => Critic, { nullable: true })
  critic?: Critic;

  @Field(() => Int, { nullable: true })
  rotten?: number;

  @Field({ nullable: true })
  lastUpdated?: Date;
}

@ObjectType()
export class Movie {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  plot?: string;

  @Field({ nullable: true })
  fullplot?: string;

  @Field(() => [String], { nullable: true })
  genres?: string[];

  @Field(() => Int, { nullable: true })
  runtime?: number;

  @Field(() => [String], { nullable: true })
  cast?: string[];

  @Field({ nullable: true })
  poster?: string;

  @Field(() => [String], { nullable: true })
  languages?: string[];

  @Field({ nullable: true })
  released?: Date;

  @Field(() => [String], { nullable: true })
  directors?: string[];

  @Field({ nullable: true })
  rated?: string;

  @Field(() => Awards, { nullable: true })
  awards?: Awards;

  @Field({ nullable: true })
  lastupdated?: string;

  @Field(() => Int, { nullable: true })
  year?: number;

  @Field(() => Imdb, { nullable: true })
  imdb?: Imdb;

  @Field(() => [String], { nullable: true })
  countries?: string[];

  @Field({ nullable: true })
  type?: string;

  @Field(() => Tomatoes, { nullable: true })
  tomatoes?: Tomatoes;

  @Field(() => Int, { nullable: true })
  num_mflix_comments?: number;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;

  @Field({ nullable: true })
  isLiked?: boolean;

  @Field({ nullable: true })
  isViewed?: boolean;
}

@ObjectType()
export class MovieFilters {
  @Field(() => [String])
  genres: string[];

  @Field(() => [String])
  ratings: string[];

  @Field(() => [String])
  languages: string[];

  @Field(() => [String])
  countries: string[];

  @Field(() => Int)
  minYear: number;

  @Field(() => Int)
  maxYear: number;
}

@ObjectType()
export class MoviesResponse {
  @Field(() => [Movie])
  movies: Movie[];

  @Field(() => Int)
  totalCount: number;

  @Field()
  hasMore: boolean;

  @Field(() => MovieFilters)
  filters: MovieFilters;
}
