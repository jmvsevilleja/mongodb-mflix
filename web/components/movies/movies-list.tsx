import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Heart, Loader2 } from "lucide-react";
import Image from "next/image";
import { Movie } from "@/app/movies/page";

type MoviesListProps = {
  displayedMovies: Movie[];
  searchTerm: string;
  isLoadingMore: boolean;
  hasMoreMovies: boolean;
};

export function MoviesList({
  displayedMovies,
  searchTerm,
  isLoadingMore,
  hasMoreMovies,
}: MoviesListProps) {
  return (
    <section className="mb-8 md:mb-10">
      <h2 className="mb-4 text-xl font-semibold md:mb-6 md:text-2xl">
        {searchTerm ? `Results for "${searchTerm}"` : "Movie Gallery"}
      </h2>
      {displayedMovies.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {displayedMovies.map((movie) => (
            <Card
              key={movie.id}
              className="flex flex-col overflow-hidden shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-xl dark:border-gray-700 cursor-pointer"
            >
              <CardHeader className="relative p-0">
                <div className="aspect-square w-full overflow-hidden">
                  <Image
                    src={movie.imageUrl}
                    alt={`Movie of ${movie.name}`}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                    priority={false}
                    unoptimized
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4">
                <CardTitle
                  className="mb-1 text-lg font-semibold line-clamp-1"
                  title={movie.name}
                >
                  {movie.name}
                </CardTitle>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <p>
                    Created:{" "}
                    {movie.createdAt ? movie.createdAt.toLocaleString() : ""}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{movie.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{movie.likes.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No movies found matching your criteria.
        </p>
      )}

      {/* Loading indicator */}
      {isLoadingMore && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading more movies...</span>
          </div>
        </div>
      )}

      {/* End of results indicator */}
      {!hasMoreMovies && displayedMovies.length > 0 && (
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            You've reached the end of the gallery!
          </p>
        </div>
      )}
    </section>
  );
}
