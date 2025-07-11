"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainHeader } from "@/components/layout/main-header";
import { MoviesList } from "../../components/movies/movies-list";
import { MovieFilters } from "../../components/movies/movie-filters";
import { MovieDetailModal } from "../../components/movies/movie-detail-modal";
import { MovieRecommendation } from "../../components/movies/movie-recommendation";
import { Search, Filter, X, Sparkles } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

const GET_MOVIES = gql`
  query GetMovies($input: AllMoviesInput!) {
    movies(input: $input) {
      movies {
        id
        title
        plot
        poster
        year
        genres
        rated
        runtime
        imdb {
          rating
          votes
          id
        }
        directors
        cast
      }
      totalCount
      hasMore
      filters {
        genres
        ratings
        languages
        countries
      }
    }
  }
`;

const GET_MOVIE_DETAIL = gql`
  query GetMovie($id: ID!) {
    movie(id: $id) {
      id
      title
      plot
      fullplot
      poster
      year
      genres
      rated
      runtime
      imdb {
        rating
        votes
        id
      }
      directors
      cast
      languages
      countries
      released
      awards {
        wins
        nominations
      }
      tomatoes {
        viewer {
          rating
          numReviews
        }
        critic {
          rating
          numReviews
        }
      }
      type
      trailer
    }
  }
`;

export interface Movie {
  id: string;
  title: string;
  plot?: string;
  fullplot?: string;
  poster?: string;
  year?: number;
  genres?: string[];
  rated?: string;
  runtime?: number;
  imdb?: {
    rating?: number;
    votes?: number;
    id?: string;
  };
  directors?: string[];
  cast?: string[];
  languages?: string[];
  countries?: string[];
  released?: Date;
  awards?: {
    wins: number;
    nominations: number;
    text: string;
  };
  tomatoes?: {
    viewer?: {
      rating?: number;
      numReviews?: number;
    };
    critic?: {
      rating?: number;
      numReviews?: number;
    };
  };
  type?: string;
  trailer?: string;
}

export interface MovieFiltersType {
  genres: string[];
  ratings: string[];
  languages: string[];
  countries: string[];
  minYear: number;
  maxYear: number;
}

export default function MoviesPage() {
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<string>("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("year");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // UI state
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [activeTab, setActiveTab] = useState("search");

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setAllMovies([]);
  }, [
    debouncedSearchTerm,
    selectedGenres,
    selectedRating,
    selectedLanguages,
    selectedCountry,
    sortBy,
    sortOrder,
  ]);

  // Fetch movies
  const { data, loading } = useQuery(GET_MOVIES, {
    variables: {
      input: {
        page,
        limit: 20,
        searchTerm: debouncedSearchTerm,
        genres: selectedGenres.length > 0 ? selectedGenres : undefined,
        rated: selectedRating || undefined,
        languages: selectedLanguages.length > 0 ? selectedLanguages : undefined,
        country: selectedCountry || undefined,
        sortBy,
        sortOrder,
      },
    },
    skip: activeTab !== "search",
    onCompleted: (data) => {
      if (page === 1) {
        setAllMovies(data.movies.movies);
      } else {
        setAllMovies((prev) => [...prev, ...data.movies.movies]);
      }
    },
  });

  // Fetch movie detail
  const { data: movieDetailData, loading: movieDetailLoading } = useQuery(
    GET_MOVIE_DETAIL,
    {
      variables: { id: selectedMovie?.id || "" },
      skip: !selectedMovie?.id,
    }
  );

  const loadMoreMovies = useCallback(() => {
    if (!loading && data?.movies.hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [loading, data?.movies.hasMore]);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGenres([]);
    setSelectedRating("");
    setSelectedLanguages([]);
    setSelectedCountry("");
    setSortBy("year");
    setSortOrder("desc");
  };

  const hasActiveFilters =
    debouncedSearchTerm ||
    selectedGenres.length > 0 ||
    selectedRating ||
    selectedLanguages.length > 0 ||
    selectedCountry;

  const movieFilters = data?.movies.filters;

  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader />

      <main className="container flex-1 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Movie Discovery</h1>
          <p className="text-muted-foreground">
            Search movies or get AI-powered recommendations based on your
            description
          </p>
        </div>

        {/* Tabs for Search vs Recommendations */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Movies
            </TabsTrigger>
            <TabsTrigger value="recommend" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Recommendations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search movies by title or plot..."
                className="pl-9 pr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1">
                    Active
                  </Badge>
                )}
              </Button>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="imdb.rating">IMDB Rating</SelectItem>
                  <SelectItem value="runtime">Runtime</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortOrder}
                onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {debouncedSearchTerm && (
                  <Badge variant="secondary">
                    Search: {debouncedSearchTerm}
                  </Badge>
                )}
                {selectedGenres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    Genre: {genre}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() =>
                        setSelectedGenres((prev) =>
                          prev.filter((g) => g !== genre)
                        )
                      }
                    />
                  </Badge>
                ))}
                {selectedRating && (
                  <Badge variant="secondary">
                    Rating: {selectedRating}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => setSelectedRating("")}
                    />
                  </Badge>
                )}
                {selectedLanguages.map((lang) => (
                  <Badge key={lang} variant="secondary">
                    Language: {lang}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() =>
                        setSelectedLanguages((prev) =>
                          prev.filter((l) => l !== lang)
                        )
                      }
                    />
                  </Badge>
                ))}
                {selectedCountry && (
                  <Badge variant="secondary">
                    Country: {selectedCountry}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => setSelectedCountry("")}
                    />
                  </Badge>
                )}
              </div>
            )}

            {/* Filters Panel */}
            {showFilters && movieFilters && (
              <MovieFilters
                filters={movieFilters}
                selectedGenres={selectedGenres}
                selectedRating={selectedRating}
                selectedLanguages={selectedLanguages}
                selectedCountry={selectedCountry}
                onGenresChange={setSelectedGenres}
                onRatingChange={setSelectedRating}
                onLanguagesChange={setSelectedLanguages}
                onCountryChange={setSelectedCountry}
              />
            )}

            {/* Results */}
            <div className="space-y-4">
              {data?.movies.totalCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  Found {data.movies.totalCount.toLocaleString()} movies
                </p>
              )}

              <MoviesList
                movies={allMovies}
                loading={loading}
                hasMore={data?.movies.hasMore || false}
                onMovieClick={handleMovieClick}
                onLoadMore={loadMoreMovies}
              />
            </div>
          </TabsContent>

          <TabsContent value="recommend" className="space-y-6">
            <MovieRecommendation onMovieClick={handleMovieClick} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Movie Detail Modal */}
      <MovieDetailModal
        movie={selectedMovie}
        movieDetail={movieDetailData?.movie}
        loading={movieDetailLoading}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}
