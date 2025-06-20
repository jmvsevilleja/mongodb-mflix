import { Injectable } from '@nestjs/common';
import { Movie, MovieDocument } from './schemas/movie.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AllMoviesInput } from './dto/all-movies.input';

@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
  ) {}

  async findAll(input: AllMoviesInput) {
    const {
      page = 1,
      limit = 20,
      searchTerm,
      sortBy = 'year',
      sortOrder = 'desc',
      genres,
      rated,
      year,
      yearFrom,
      yearTo,
      languages,
      country,
    } = input;

    // Build aggregation pipeline
    const pipeline: any[] = [];

    // Match stage for filters
    const matchStage: any = {};

    // Text search using Atlas Search
    if (searchTerm) {
      pipeline.push({
        $search: {
          index: 'default', // You'll need to create this index in Atlas
          compound: {
            should: [
              {
                text: {
                  query: searchTerm,
                  path: 'title',
                  score: { boost: { value: 3 } },
                },
              },
              {
                text: {
                  query: searchTerm,
                  path: 'plot',
                  score: { boost: { value: 2 } },
                },
              },
              {
                text: {
                  query: searchTerm,
                  path: 'fullplot',
                  score: { boost: { value: 1 } },
                },
              },
            ],
            minimumShouldMatch: 1,
          },
          sort: { score: { $meta: 'searchScore', order: -1 } }, // Moved sort here
        },
      });
    }

    // Apply filters
    if (genres && genres.length > 0) {
      matchStage.genres = { $in: genres };
    }

    if (rated) {
      matchStage.rated = rated;
    }

    if (year) {
      matchStage.year = year;
    } else if (yearFrom || yearTo) {
      matchStage.year = {};
      if (yearFrom) matchStage.year.$gte = yearFrom;
      if (yearTo) matchStage.year.$lte = yearTo;
    }

    if (languages && languages.length > 0) {
      matchStage.languages = { $in: languages };
    }

    if (country) {
      matchStage.countries = country;
    }

    // Add match stage if we have filters
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Project stage to handle imdb.rating as float or null
    pipeline.push({
      $project: {
        _id: 1,
        title: 1,
        plot: 1,
        fullplot: 1,
        genres: 1,
        runtime: 1,
        cast: 1,
        poster: 1,
        languages: 1,
        released: 1,
        directors: 1,
        rated: 1,
        awards: 1,
        lastupdated: 1,
        year: 1,
        imdb: {
          rating: {
            $cond: {
              if: { $eq: ['$imdb.rating', ''] },
              then: null,
              else: '$imdb.rating',
            },
          },
          votes: {
            $cond: {
              if: { $eq: ['$imdb.votes', ''] },
              then: null,
              else: '$imdb.votes',
            },
          },
          id: '$imdb.id',
        },
        countries: 1,
        type: 1,
        tomatoes: 1,
        num_mflix_comments: 1,
        createdAt: 1,
        updatedAt: 1,
        isLiked: 1,
        isViewed: 1,
      },
    });

    // Count total documents
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await this.movieModel.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;

    // Sort stage - only apply if no search term, otherwise search handles sorting
    if (!searchTerm) {
      const sortStage: any = {};
      sortStage[sortBy] = sortOrder === 'desc' ? -1 : 1;
      pipeline.push({ $sort: sortStage });
    }

    // Pagination
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });
    // Execute aggregation
    const movies = await this.movieModel.aggregate(pipeline);

    // Convert each movie document to JSON to apply virtuals/transformations
    const jsonMovies = movies.map((movie) =>
      this.movieModel.hydrate(movie).toJSON(),
    );

    return {
      movies: jsonMovies,
      totalCount,
      hasMore: (page - 1) * limit + movies.length < totalCount,
    };
  }

  async getFilters() {
    const pipeline = [
      {
        $group: {
          _id: null,
          genres: { $addToSet: '$genres' },
          ratings: { $addToSet: '$rated' },
          languages: { $addToSet: '$languages' },
          countries: { $addToSet: '$countries' },
          years: { $addToSet: '$year' },
        },
      },
      {
        $project: {
          _id: 0,
          genres: {
            $reduce: {
              input: '$genres',
              initialValue: [],
              in: { $setUnion: ['$$value', '$$this'] },
            },
          },
          ratings: {
            $filter: {
              input: '$ratings',
              cond: { $ne: ['$$this', null] },
            },
          },
          languages: {
            $reduce: {
              input: '$languages',
              initialValue: [],
              in: { $setUnion: ['$$value', '$$this'] },
            },
          },
          countries: {
            $reduce: {
              input: '$countries',
              initialValue: [],
              in: { $setUnion: ['$$value', '$$this'] },
            },
          },
          years: {
            $filter: {
              input: '$years',
              cond: { $ne: ['$$this', null] },
            },
          },
        },
      },
    ];

    const result = await this.movieModel.aggregate(pipeline);
    const data = result[0] || {
      genres: [],
      ratings: [],
      languages: [],
      countries: [],
      years: [],
    };

    return {
      genres: data.genres.sort(),
      ratings: data.ratings.sort(),
      languages: data.languages.sort(),
      countries: data.countries.sort(),
      minYear: Math.min(...data.years.filter((y) => y)),
      maxYear: Math.max(...data.years.filter((y) => y)),
    };
  }

  async findById(id: string): Promise<Movie | null> {
    const movie = await this.movieModel.findById(id).exec();
    return movie ? movie.toJSON() : null;
  }
}
