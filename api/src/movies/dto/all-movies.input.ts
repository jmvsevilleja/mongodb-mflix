import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class AllMoviesInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 20 })
  limit: number;

  @Field(() => String, { nullable: true })
  searchTerm?: string;

  @Field(() => String, { nullable: true })
  sortBy?: string;

  @Field(() => String, { nullable: true })
  sortOrder?: string;

  @Field(() => [String], { nullable: true })
  genres?: string[];

  @Field(() => String, { nullable: true })
  rated?: string;

  @Field(() => Int, { nullable: true })
  year?: number;

  @Field(() => Int, { nullable: true })
  yearFrom?: number;

  @Field(() => Int, { nullable: true })
  yearTo?: number;

  @Field(() => [String], { nullable: true })
  languages?: string[];

  @Field(() => String, { nullable: true })
  country?: string;
}