import { Injectable, NotFoundException } from '@nestjs/common';
import { Face, FaceDocument } from './schemas/face.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  FaceInteraction,
  FaceInteractionDocument,
} from './schemas/face-interaction.schema';

@Injectable()
export class FacesService {
  constructor(
    @InjectModel(Face.name) private faceModel: Model<FaceDocument>,
    @InjectModel(FaceInteraction.name)
    private faceInteractionModel: Model<FaceInteractionDocument>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    searchTerm?: string,
    sortBy?: string,
    sortOrder?: string,
    userId?: string,
  ): Promise<Face[]> {
    const query: any = {};
    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: 'i' };
    }

    const sort: any = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const faces = await this.faceModel
      .find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    if (!userId) {
      return faces.map((face) => this.faceModel.hydrate(face).toJSON());
    }

    // Get user interactions for all faces
    const interactions = await this.faceInteractionModel
      .find({
        userId: new Types.ObjectId(userId),
        faceId: { $in: faces.map((face) => face._id) },
      })
      .exec();

    // Create a map of interactions for quick lookup
    const interactionMap = new Map(
      interactions.map((interaction) => [
        interaction.faceId.toString(),
        interaction,
      ]),
    );

    // Add interaction data to each face
    return faces.map((face) => {
      const faceObj = this.faceModel.hydrate(face).toJSON();
      const interaction = interactionMap.get(face._id.toString());
      return {
        ...faceObj,
        isLiked: interaction?.hasLiked || false,
        isViewed: interaction?.hasViewed || false,
      };
    });
  }

  async incrementView(faceId: string, userId: string): Promise<Face | null> {
    const face = await this.faceModel.findById(faceId).exec();
    if (!face) {
      throw new NotFoundException(`Face with ID ${faceId} not found`);
    }

    // Check if the user has already viewed this face
    const interaction = await this.faceInteractionModel.findOne({
      userId: new Types.ObjectId(userId),
      faceId: new Types.ObjectId(faceId),
    });

    console.log(
      'interaction',
      interaction,
      !interaction || !interaction.hasViewed,
    );
    if (!interaction || !interaction.hasViewed) {
      // Increment view count only if not viewed by this user before
      await this.faceModel
        .findByIdAndUpdate(faceId, { $inc: { views: 1 } })
        .exec();
      // Record the view interaction
      if (interaction) {
        interaction.hasViewed = true;
        await interaction.save();
      } else {
        await this.faceInteractionModel.create({
          userId,
          faceId,
          hasViewed: true,
          hasLiked: false,
        });
      }
    }

    const viewedFace = await this.faceModel.findById(faceId).exec();
    return viewedFace ? viewedFace.toJSON() : null;
  }

  async toggleLike(faceId: string, userId: string): Promise<Face | null> {
    const face = await this.faceModel.findById(faceId).exec();
    if (!face) {
      throw new NotFoundException(`Face with ID ${faceId} not found`);
    }

    let interaction = await this.faceInteractionModel.findOne({
      userId: new Types.ObjectId(userId),
      faceId: new Types.ObjectId(faceId),
    });

    if (interaction) {
      interaction.hasLiked = !interaction.hasLiked;
      await interaction.save();
    } else {
      interaction = await this.faceInteractionModel.create({
        userId,
        faceId,
        hasViewed: false,
        hasLiked: true,
      });
    }

    // Update like count based on the new state
    const likeChange = interaction.hasLiked ? 1 : -1;
    await this.faceModel
      .findByIdAndUpdate(faceId, { $inc: { likes: likeChange } })
      .exec();

    const likedFace = await this.faceModel.findById(faceId).exec(); // Return the updated face
    return likedFace ? likedFace.toJSON() : null;
  }

  async getUserInteraction(
    faceId: string,
    userId: string,
  ): Promise<FaceInteraction | null> {
    return this.faceInteractionModel.findOne({
      userId: new Types.ObjectId(userId),
      faceId: new Types.ObjectId(faceId),
    });
  }
}
