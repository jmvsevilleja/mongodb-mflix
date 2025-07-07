import { ObjectType, Field, Float } from '@nestjs/graphql';
import { Movie } from './movie.model';

@ObjectType()
export class MovieRecommendation {
  @Field(() => Movie)
  movie: Movie;

  @Field(() => Float)
  similarity: number;

  @Field()
  reason: string;
}

@ObjectType()
export class RecommendationsResponse {
  @Field(() => [MovieRecommendation])
  recommendations: MovieRecommendation[];

  @Field()
  totalCount: number;

  @Field()
  hasMore: boolean;

  @Field()
  searchDescription: string;
}