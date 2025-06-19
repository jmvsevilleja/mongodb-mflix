import { Injectable } from '@nestjs/common';
import { Movie, MovieDocument } from './schemas/movie.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    searchTerm?: string,
    sortBy?: string,
    sortOrder?: string,
  ): Promise<Movie[]> {
    const query: any = {};
    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: 'i' };
    }

    const sort: any = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const movies = await this.movieModel
      .find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    // Add interaction data to each movie
    return movies;
  }
}
