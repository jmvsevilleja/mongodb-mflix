"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Search, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Movie } from "@/app/movies/page";
import Image from "next/image";

const RECOMMEND_MOVIES = gql`
  query RecommendMovies($input: RecommendMoviesInput!) {
    recommendMovies(input: $input) {
      recommendations {
        movie {
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
          }
          directors
          cast
        }
        similarity
        reason
      }
      totalCount
      hasMore
      searchDescription
    }
  }
`;

interface MovieRecommendation {
  movie: Movie;
  similarity: number;
  reason: string;
}

interface MovieRecommendationProps {
  onMovieClick: (movie: Movie) => void;
}

export function MovieRecommendation({ onMovieClick }: MovieRecommendationProps) {
  const [description, setDescription] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const debouncedDescription = useDebounce(description, 1000);

  const { data, loading, error } = useQuery(RECOMMEND_MOVIES, {
    variables: {
      input: {
        description: debouncedDescription,
        limit: 6,
        page: 1,
      },
    },
    skip: !debouncedDescription || debouncedDescription.length < 10,
    onCompleted: () => setIsSearching(false),
    onError: () => setIsSearching(false),
  });

  const handleSearch = () => {
    if (description.length >= 10) {
      setIsSearching(true);
    }
  };

  const recommendations: MovieRecommendation[] = data?.recommendMovies?.recommendations || [];

  return (
    <div className="space-y-6">
      {/* Recommendation Search Bar */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <Sparkles className="h-5 w-5" />
            AI Movie Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Describe the kind of movie you're looking for... (e.g., 'a story where a cowboy and astronaut become friends')"
              className="pl-4 pr-12 py-3 text-base"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              onClick={handleSearch}
              disabled={description.length < 10 || loading || isSearching}
              className="absolute right-1 top-1 h-8 w-8 p-0"
              size="sm"
            >
              {loading || isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {description.length > 0 && description.length < 10 && (
            <p className="text-sm text-muted-foreground">
              Please enter at least 10 characters for better recommendations
            </p>
          )}

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              Error getting recommendations. Please try again.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations Results */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Recommended for: "{data.recommendMovies.searchDescription}"
            </h3>
            <Badge variant="secondary">
              {data.recommendMovies.totalCount} matches
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((recommendation, index) => (
              <Card
                key={recommendation.movie.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 relative overflow-hidden"
                onClick={() => onMovieClick(recommendation.movie)}
              >
                {/* Similarity Badge */}
                <Badge 
                  className="absolute top-2 right-2 z-10"
                  variant={recommendation.similarity > 0.7 ? "default" : "secondary"}
                >
                  {Math.round(recommendation.similarity * 100)}% match
                </Badge>

                {/* Ranking Badge */}
                <Badge 
                  className="absolute top-2 left-2 z-10 bg-purple-600 text-white"
                >
                  #{index + 1}
                </Badge>

                <CardHeader className="p-0">
                  <div className="aspect-[2/3] relative overflow-hidden">
                    {recommendation.movie.poster ? (
                      <Image
                        src={recommendation.movie.poster}
                        alt={recommendation.movie.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No Image</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  <div>
                    <h4 className="font-semibold line-clamp-1">
                      {recommendation.movie.title}
                    </h4>
                    {recommendation.movie.year && (
                      <p className="text-sm text-muted-foreground">
                        {recommendation.movie.year}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                      {recommendation.reason}
                    </p>

                    {recommendation.movie.plot && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {recommendation.movie.plot}
                      </p>
                    )}

                    {recommendation.movie.genres && recommendation.movie.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {recommendation.movie.genres.slice(0, 2).map((genre) => (
                          <Badge key={genre} variant="outline" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                        {recommendation.movie.genres.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{recommendation.movie.genres.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    {recommendation.movie.imdb?.rating && (
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-yellow-500">★</span>
                        <span>{recommendation.movie.imdb.rating}/10</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {(loading || isSearching) && debouncedDescription && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
            <p className="text-sm text-muted-foreground">
              Finding perfect movie recommendations...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}