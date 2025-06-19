import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Face {
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
}
