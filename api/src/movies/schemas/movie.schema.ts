import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type MovieDocument = HydratedDocument<Movie>;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Movie {
  @Prop()
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop()
  plot: string;

  @Prop([String])
  genres: string[];

  @Prop()
  runtime: number;

  @Prop([String])
  cast: string[];

  @Prop()
  poster: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  fullplot: string;

  @Prop([String])
  languages: string[];

  @Prop({ type: Date })
  released: Date;

  @Prop([String])
  directors: string[];

  @Prop()
  rated: string;

  @Prop({ type: Object })
  awards: Record<string, any>;

  @Prop()
  lastupdated: string;

  @Prop()
  year: number;

  @Prop({ type: Object })
  imdb: Record<string, any>;

  @Prop([String])
  countries: string[];

  @Prop()
  type: string;

  @Prop({ type: Object })
  tomatoes: Record<string, any>;

  @Prop()
  num_mflix_comments: number;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);

// MovieSchema.set('toJSON', {
//   virtuals: true,
//   transform: (doc, ret) => {
//     ret.id = ret._id.toString();
//     delete ret._id;
//     delete ret.__v;
//     return ret;
//   },
// });

// Indexing for frequently queried fields
MovieSchema.index({ name: 'text' });
MovieSchema.index({ views: -1 });
MovieSchema.index({ likes: -1 });
MovieSchema.index({ createdAt: -1 });
