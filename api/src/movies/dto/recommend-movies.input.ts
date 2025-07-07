import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class RecommendMoviesInput {
  @Field()
  description: string;

  @Field(() => Int, { defaultValue: 10 })
  limit: number;

  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => [String], { nullable: true })
  genres?: string[];

  @Field(() => String, { nullable: true })
  rated?: string;

  @Field(() => Int, { nullable: true })
  yearFrom?: number;

  @Field(() => Int, { nullable: true })
  yearTo?: number;
}