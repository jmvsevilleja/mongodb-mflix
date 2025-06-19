import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Movie {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  imageUrl: string;

  @Field(() => Int)
  views: number;

  @Field(() => Int)
  likes: number;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;

  @Field({ nullable: true })
  isLiked?: boolean;

  @Field({ nullable: true })
  isViewed?: boolean;

  @Field()
  userId: string;

  @Field({ nullable: true })
  plot?: string;

  @Field(() => [String], { nullable: true })
  genres?: string[];

  @Field(() => Int, { nullable: true })
  runtime?: number;

  @Field(() => [String], { nullable: true })
  cast?: string[];

  @Field({ nullable: true })
  poster?: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  fullplot?: string;

  @Field(() => [String], { nullable: true })
  languages?: string[];

  @Field({ nullable: true })
  released?: Date;

  @Field(() => [String], { nullable: true })
  directors?: string[];

  @Field({ nullable: true })
  rated?: string;

  @Field(() => Object, { nullable: true })
  awards?: Record<string, any>;

  @Field({ nullable: true })
  lastupdated?: string;

  @Field(() => Int, { nullable: true })
  year?: number;

  @Field(() => Object, { nullable: true })
  imdb?: Record<string, any>;

  @Field(() => [String], { nullable: true })
  countries?: string[];

  @Field({ nullable: true })
  type?: string;

  @Field(() => Object, { nullable: true })
  tomatoes?: Record<string, any>;

  @Field(() => Int, { nullable: true })
  num_mflix_comments?: number;
}
