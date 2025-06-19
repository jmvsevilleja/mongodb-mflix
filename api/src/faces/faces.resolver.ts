import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FacesService } from './faces.service';
import { Face } from './models/face.model';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AllFacesInput } from './dto/all-faces.input'; // Import the new DTO

@Resolver(() => Face)
export class FacesResolver {
  constructor(private readonly facesService: FacesService) {}

  @Query(() => [Face], { name: 'allFaces' })
  async allFaces(
    @Args('input') input: AllFacesInput, // Use the DTO here
  ): Promise<Face[]> {
    const { page, limit, searchTerm, sortBy, sortOrder, userId } = input;
    return this.facesService.findAll(
      page,
      limit,
      searchTerm,
      sortBy,
      sortOrder,
      userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Face, { name: 'incrementFaceView' })
  async incrementFaceView(
    @Args('faceId', { type: () => ID }) faceId: string,
    @CurrentUser() user: any,
  ): Promise<Face | null> {
    return this.facesService.incrementView(faceId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Face, { name: 'toggleFaceLike' })
  async toggleFaceLike(
    @Args('faceId', { type: () => ID }) faceId: string,
    @CurrentUser() user: any,
  ): Promise<Face | null> {
    return this.facesService.toggleLike(faceId, user.id);
  }
}
