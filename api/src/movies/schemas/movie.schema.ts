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
      delete ret.embedding; // Don't expose embedding in API responses
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

  // Vector embedding for semantic search
  @Prop({ type: [Number], select: false }) // Don't include in normal queries
  embedding: number[];
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

// Vector search index (this needs to be created in MongoDB Atlas)
// You'll need to create this index manually in MongoDB Atlas:
// {
//   "fields": [
//     {
//       "type": "vector",
//       "path": "embedding",
//       "numDimensions": 1024,
//       "similarity": "cosine"
//     }
//   ]
// }