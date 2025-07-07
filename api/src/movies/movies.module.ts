import { Module } from '@nestjs/common';
import { MoviesResolver } from './movies.resolver';
import { MoviesService } from './movies.service';
import { RecommendationService } from './services/recommendation.service';
import { EmbeddingService } from './services/embedding.service';
import { LangChainFilterService } from './services/langchain-filter.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Movie, MovieSchema } from './schemas/movie.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
  ],
  providers: [
    MoviesResolver, 
    MoviesService, 
    RecommendationService, 
    EmbeddingService,
    LangChainFilterService,
  ],
  exports: [
    MoviesService, 
    RecommendationService, 
    EmbeddingService,
    LangChainFilterService,
  ],
})
export class MoviesModule {}