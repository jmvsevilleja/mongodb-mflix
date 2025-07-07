"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Search, Loader2, Brain, Zap } from "lucide-react";
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

export function MovieRecommendation({
  onMovieClick,
}: MovieRecommendationProps) {
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

  const recommendations: MovieRecommendation[] =
    data?.recommendMovies?.recommendations || [];

  const getRelevanceColor = (similarity: number) => {
    if (similarity >= 0.9) return "bg-green-500";
    if (similarity >= 0.75) return "bg-blue-500";
    if (similarity >= 0.6) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const getRelevanceIcon = (reason: string) => {
    if (reason.includes("Perfect Match") || reason.includes("🎯")) return "🎯";
    if (reason.includes("Excellent Match") || reason.includes("⭐"))
      return "⭐";
    if (reason.includes("Great Match") || reason.includes("✨")) return "✨";
    if (reason.includes("Top") || reason.includes("🏆")) return "🏆";
    return "👍";
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Recommendation Search Bar */}
      <Card className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <Sparkles className="h-4 w-4" />
            </div>
            AI-Powered Movie Discovery
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
            <Zap className="h-4 w-4" />
            <span>
              Enhanced with LangChain + Mistral AI for intelligent filtering
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Describe the kind of movie you're looking for... (e.g., 'a story where a cowboy and astronaut become friends')"
              className="pl-4 pr-12 py-3 text-base border-purple-200 dark:border-purple-700 focus:border-purple-400 dark:focus:border-purple-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button
              onClick={handleSearch}
              disabled={description.length < 10 || loading || isSearching}
              className="absolute right-1 top-1 h-8 w-8 p-0 bg-purple-600 hover:bg-purple-700"
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
              Please enter at least 10 characters for better AI analysis
            </p>
          )}

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
              Error getting recommendations. Please try again.
            </div>
          )}

          {/* AI Processing Indicator */}
          {(loading || isSearching) && debouncedDescription && (
            <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-md">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Brain className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">
                  AI Analysis in Progress...
                </span>
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                • Creating semantic embeddings with Mistral AI
                <br />
                • Searching vector database for similar movies
                <br />
                • Applying LangChain intelligent filtering
                <br />• Generating personalized explanations
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Recommendations Results */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI Recommendations for: &ldquo;
              {data.recommendMovies.searchDescription}&rdquo;
            </h3>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {data.recommendMovies.totalCount} intelligent matches
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((recommendation, index) => (
              <Card
                key={recommendation.movie.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 relative overflow-hidden border-l-4 border-l-purple-500"
                onClick={() => onMovieClick(recommendation.movie)}
              >
                {/* Enhanced Similarity Badge */}
                <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                  <Badge
                    className={`${getRelevanceColor(
                      recommendation.similarity
                    )} text-white text-xs px-2 py-1`}
                  >
                    {Math.round(recommendation.similarity * 100)}% match
                  </Badge>
                  <Badge className="bg-white/90 text-purple-700 text-xs px-2 py-1">
                    {getRelevanceIcon(recommendation.reason)} AI Ranked
                  </Badge>
                </div>

                {/* Ranking Badge */}
                <Badge className="absolute top-2 left-2 z-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
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
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 flex items-center justify-center">
                        <div className="text-center">
                          <Brain className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                          <span className="text-purple-600 dark:text-purple-400 text-sm">
                            AI Recommended
                          </span>
                        </div>
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
                    {/* Enhanced AI Reason */}
                    <div className="bg-purple-50 dark:bg-purple-950/20 p-2 rounded-md">
                      <p className="text-xs text-purple-700 dark:text-purple-300 font-medium leading-relaxed">
                        {recommendation.reason}
                      </p>
                    </div>

                    {recommendation.movie.plot && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {recommendation.movie.plot}
                      </p>
                    )}

                    {recommendation.movie.genres &&
                      recommendation.movie.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {recommendation.movie.genres
                            .slice(0, 2)
                            .map((genre) => (
                              <Badge
                                key={genre}
                                variant="outline"
                                className="text-xs border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300"
                              >
                                {genre}
                              </Badge>
                            ))}
                          {recommendation.movie.genres.length > 2 && (
                            <Badge
                              variant="outline"
                              className="text-xs border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300"
                            >
                              +{recommendation.movie.genres.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}

                    {recommendation.movie.imdb?.rating && (
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-yellow-500">★</span>
                        <span>{recommendation.movie.imdb.rating}/10</span>
                        <span className="text-muted-foreground">IMDB</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Technology Footer */}
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
              <Brain className="h-4 w-4" />
              <span>
                Powered by Mistral AI embeddings + LangChain intelligent
                filtering
              </span>
            </div>
          </div>
        </div>
      )}

      {(loading || isSearching) && debouncedDescription && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Brain className="h-8 w-8 animate-pulse text-purple-600" />
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              AI is analyzing your request and finding perfect matches...
            </p>
            <div className="text-xs text-muted-foreground max-w-md">
              Using advanced semantic understanding to go beyond simple keyword
              matching
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
