"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MainHeader } from "@/components/layout/main-header";
import { Heart, Eye, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MoviesList } from "../../components/movies/movies-list";

// Update GraphQL query to include pagination and sorting parameters
const GET_ALL_MOVIES = gql`
  query GetAllMovies(
    $input: AllMoviesInput! # Changed to use the AllMoviesInput DTO
  ) {
    allMovies(
      input: $input # Pass the entire input object
    ) {
      id
      name
      imageUrl
      views
      likes
      isLiked
      isViewed
      createdAt
      updatedAt
    }
  }
`;

export interface Movie {
  id: string;
  name: string;
  imageUrl: string;
  views: number;
  likes: number;
  createdAt: Date;
  isLiked?: boolean;
  isViewed?: boolean;
}

export default function MoviesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  // State for movies and UI
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // State for image viewing
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showCreditPrompt, setShowCreditPrompt] = useState(false);
  const [viewedMovies, setViewedMovies] = useState<Set<string>>(new Set());

  // GraphQL queries and mutations

  // State for pagination and filtering
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "views" | "likes">(
    "createdAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [displayedMovies, setDisplayedMovies] = useState<Movie[]>([]);
  const [hasMoreMovies, setHasMoreMovies] = useState(true);

  // Fetch movies with pagination
  const { data, loading, error, fetchMore } = useQuery(GET_ALL_MOVIES, {
    variables: {
      input: {
        page,
        limit: 20,
        searchTerm,
        sortBy,
        sortOrder,
        userId: session?.user?.id,
      },
    },
    onCompleted: (data) => {
      if (data.allMovies.length === 0) {
        setHasMoreMovies(false);
        return;
      }

      if (page === 1) {
        setAllMovies(data.allMovies);
        setDisplayedMovies(data.allMovies);
      } else {
        setAllMovies((prev) => [...prev, ...data.allMovies]);
        setDisplayedMovies((prev) => [...prev, ...data.allMovies]);
      }
    },
  });

  // Handle loading more movies
  const loadMoreMovies = () => {
    if (!loading && hasMoreMovies) {
      setPage((prev) => prev + 1);
    }
  };

  // Implement search and filter logic
  useEffect(() => {
    if (searchTerm) {
      const filtered = allMovies.filter((face) =>
        face.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setDisplayedMovies(filtered);
    } else {
      setDisplayedMovies(allMovies);
    }
  }, [searchTerm, allMovies]);

  // Implement sorting logic
  useEffect(() => {
    const sorted = [...displayedMovies].sort((a, b) => {
      if (sortOrder === "asc") {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });
    setDisplayedMovies(sorted);
  }, [sortBy, sortOrder]);

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMoreMovies();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreMovies]);

  // Event Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleSortByChange = (value: "createdAt" | "views" | "likes") => {
    // if (value === "createdAt") {
    //   setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    // }
    setSortBy(value);
    setCurrentPage(1);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader />

      <main className="container flex-1 py-8 space-y-8">
        {/* Search and Filter Section */}

        <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
          <div className="flex-grow md:max-w-xs">
            <Input
              type="search"
              placeholder="Search movies by name..."
              className="w-full"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Movies List */}
        <MoviesList
          displayedMovies={displayedMovies}
          searchTerm={searchTerm}
          isLoadingMore={isLoadingMore}
          hasMoreMovies={hasMoreMovies}
        />

        {/* Loading More Indicator */}
      </main>

      {/* Image View Dialog */}
      <Dialog
        open={!!selectedMovie}
        onOpenChange={() => setSelectedMovie(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMovie?.name}</DialogTitle>
            <DialogDescription>
              {viewedMovies.has(selectedMovie?.id || "")
                ? "Viewing larger image (no credit will be deducted)"
                : "Viewing this larger image will deduct 1 credit from your wallet"}
            </DialogDescription>
          </DialogHeader>
          {selectedMovie && (
            <div className="space-y-4">
              <div className="aspect-square w-full overflow-hidden rounded-lg">
                <Image
                  src={selectedMovie.imageUrl}
                  alt={`Large view of ${selectedMovie.name}`}
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{selectedMovie.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{selectedMovie.likes.toLocaleString()} likes</span>
                  </div>
                </div>
                <Button
                  variant={selectedMovie.isLiked ? "default" : "outline"}
                  size="sm"
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${
                      selectedMovie.isLiked ? "fill-current" : ""
                    }`}
                  />
                  {selectedMovie.isLiked ? "Liked" : "Like"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Credit Purchase Prompt Dialog */}
      <Dialog open={showCreditPrompt} onOpenChange={setShowCreditPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insufficient Credits</DialogTitle>
            <DialogDescription>
              You need at least 1 credit to view larger images. Purchase credits
              to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowCreditPrompt(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowCreditPrompt(false);
                router.push("/wallet");
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Purchase Credits
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
