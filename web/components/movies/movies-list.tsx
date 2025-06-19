"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Calendar, Loader2 } from "lucide-react";
import { Movie } from "@/app/movies/page";

interface MoviesListProps {
  movies: Movie[];
  loading: boolean;
  hasMore: boolean;
  onMovieClick: (movie: Movie) => void;
  onLoadMore: () => void;
}

export function MoviesList({
  movies,
  loading,
  hasMore,
  onMovieClick,
  onLoadMore,
}: MoviesListProps) {
  const observerRef = useRef<IntersectionObserver>();
  const lastMovieElementRef = useRef<HTMLDivElement>(null);

  const lastMovieRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, onLoadMore]
  );

  if (loading && movies.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No movies found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {movies.map((movie, index) => (
          <div
            key={movie.id}
            ref={index === movies.length - 1 ? lastMovieRef : null}
          >
            <Card 
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
              onClick={() => onMovieClick(movie)}
            >
              <CardHeader className="p-0">
                <div className="aspect-[2/3] relative overflow-hidden rounded-t-lg">
                  {movie.poster ? (
                    <Image
                      src={movie.poster}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No Image</span>
                    </div>
                  )}
                  {movie.year && (
                    <Badge className="absolute top-2 right-2">
                      {movie.year}
                    </Badge>
                  )}
                  {movie.rated && (
                    <Badge variant="secondary" className="absolute top-2 left-2">
                      {movie.rated}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <CardTitle className="text-sm line-clamp-2 min-h-[2.5rem]">
                  {movie.title}
                </CardTitle>
                
                {movie.plot && (
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {movie.plot}
                  </p>
                )}

                <div className="space-y-2">
                  {movie.genres && movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {movie.genres.slice(0, 2).map(genre => (
                        <Badge key={genre} variant="outline" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                      {movie.genres.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{movie.genres.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {movie.imdb?.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{movie.imdb.rating}</span>
                      </div>
                    )}
                    
                    {movie.runtime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{movie.runtime}m</span>
                      </div>
                    )}
                  </div>

                  {movie.directors && movie.directors.length > 0 && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      Dir: {movie.directors.join(", ")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {!hasMore && movies.length > 0 && (
        <div className="text-center py-4">
          <p className="text-muted-foreground">
            You've reached the end of the results
          </p>
        </div>
      )}
    </div>
  );
}