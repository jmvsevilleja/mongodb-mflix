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
  title: string;

  @Prop()
  plot: string;

  @Prop()
  fullplot: string;

  @Prop([String])
  genres: string[];

  @Prop()
  runtime: number;

  @Prop([String])
  cast: string[];

  @Prop()
  poster: string;

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

// Indexing for frequently queried fields
MovieSchema.index({ title: 'text', plot: 'text', fullplot: 'text' });
MovieSchema.index({ genres: 1 });
MovieSchema.index({ year: -1 });
MovieSchema.index({ rated: 1 });
MovieSchema.index({ languages: 1 });
MovieSchema.index({ countries: 1 });
MovieSchema.index({ 'imdb.rating': -1 });
MovieSchema.index({ released: -1 });