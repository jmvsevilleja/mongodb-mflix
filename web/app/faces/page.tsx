"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MainHeader } from "@/components/layout/main-header";
import { Heart, Eye, Loader2, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FacesList } from "../../components/faces/faces-list";

// Update GraphQL query to include pagination and sorting parameters
const GET_ALL_FACES = gql`
  query GetAllFaces(
    $input: AllFacesInput! # Changed to use the AllFacesInput DTO
  ) {
    allFaces(
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

const GET_WALLET = gql`
  query GetWallet {
    myWallet {
      id
      credits
    }
  }
`;

const INCREMENT_FACE_VIEW = gql`
  mutation IncrementFaceView($faceId: ID!) {
    incrementFaceView(faceId: $faceId) {
      id
      views
    }
  }
`;

const TOGGLE_FACE_LIKE = gql`
  mutation ToggleFaceLike($faceId: ID!) {
    toggleFaceLike(faceId: $faceId) {
      id
      likes
      isLiked
    }
  }
`;

const DEDUCT_CREDITS = gql`
  mutation DeductCredits($amount: Int!, $description: String!) {
    deductCredits(amount: $amount, description: $description) {
      success
      newBalance
    }
  }
`;

export interface Face {
  id: string;
  name: string;
  imageUrl: string;
  views: number;
  likes: number;
  createdAt: Date;
  isLiked?: boolean;
  isViewed?: boolean;
}

export default function FacesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  // State for faces and UI
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // State for image viewing
  const [selectedFace, setSelectedFace] = useState<Face | null>(null);
  const [showCreditPrompt, setShowCreditPrompt] = useState(false);
  const [viewedFaces, setViewedFaces] = useState<Set<string>>(new Set());

  // GraphQL queries and mutations
  const { data: walletData, refetch: refetchWallet } = useQuery(GET_WALLET, {
    skip: !session,
  });

  // State for pagination and filtering
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "views" | "likes">(
    "views"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [allFaces, setAllFaces] = useState<Face[]>([]);
  const [displayedFaces, setDisplayedFaces] = useState<Face[]>([]);
  const [hasMoreFaces, setHasMoreFaces] = useState(true);

  // Fetch faces with pagination
  const { data, loading, error, fetchMore } = useQuery(GET_ALL_FACES, {
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
      if (data.allFaces.length === 0) {
        setHasMoreFaces(false);
        return;
      }

      if (page === 1) {
        setAllFaces(data.allFaces);
        setDisplayedFaces(data.allFaces);
      } else {
        setAllFaces((prev) => [...prev, ...data.allFaces]);
        setDisplayedFaces((prev) => [...prev, ...data.allFaces]);
      }
    },
  });

  // Handle loading more faces
  const loadMoreFaces = () => {
    if (!loading && hasMoreFaces) {
      setPage((prev) => prev + 1);
    }
  };

  // Implement search and filter logic
  useEffect(() => {
    if (searchTerm) {
      const filtered = allFaces.filter((face) =>
        face.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setDisplayedFaces(filtered);
    } else {
      setDisplayedFaces(allFaces);
    }
  }, [searchTerm, allFaces]);

  // Implement sorting logic
  useEffect(() => {
    const sorted = [...displayedFaces].sort((a, b) => {
      if (sortOrder === "asc") {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });
    setDisplayedFaces(sorted);
  }, [sortBy, sortOrder]);

  const [incrementFaceView] = useMutation(INCREMENT_FACE_VIEW);
  const [toggleFaceLike] = useMutation(TOGGLE_FACE_LIKE);
  const [deductCredits] = useMutation(DEDUCT_CREDITS, {
    onCompleted: () => {
      refetchWallet();
    },
  });

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMoreFaces();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreFaces]);

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

  const handleFaceClick = async (face: Face) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view larger images",
        variant: "destructive",
      });
      router.push("/auth/signin");
      return;
    }

    const userCredits = walletData?.myWallet?.credits || 0;
    const hasAlreadyViewed = viewedFaces.has(face.id);

    if (!hasAlreadyViewed && userCredits < 1) {
      setShowCreditPrompt(true);
      return;
    }

    setSelectedFace(face);
  };

  const handleImageView = async () => {
    if (!selectedFace || !session) return;
    const hasAlreadyViewed = selectedFace.isViewed;

    try {
      // Deduct credit if user hasn't viewed this face before
      if (!hasAlreadyViewed) {
        await deductCredits({
          variables: {
            amount: 1,
            description: `Viewed larger image of ${selectedFace.name}`,
          },
        });

        // Increment view count
        await incrementFaceView({
          variables: {
            faceId: selectedFace.id,
          },
        });

        // Update local state
        setAllFaces((prev) =>
          prev.map((face) =>
            face.id === selectedFace.id
              ? { ...face, views: face.views + 1, isViewed: true }
              : face
          )
        );
      }

      toast({
        title: "Image Viewed",
        description: hasAlreadyViewed
          ? "Viewing larger image (no credit deducted)"
          : "1 credit deducted for viewing larger image",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process image view",
        variant: "destructive",
      });
    }
  };

  const handleLike = async (face: Face, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like faces",
        variant: "destructive",
      });
      router.push("/auth/signin");
      return;
    }

    try {
      await toggleFaceLike({
        variables: {
          faceId: face.id,
        },
      });

      // Update local state
      setAllFaces((prev) =>
        prev.map((f) =>
          f.id === face.id
            ? {
                ...f,
                likes: f.isLiked ? f.likes - 1 : f.likes + 1,
                isLiked: !f.isLiked,
              }
            : f
        )
      );

      toast({
        title: face.isLiked ? "Unliked" : "Liked",
        description: `You ${face.isLiked ? "unliked" : "liked"} ${face.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  const getButtonClass = (value: "createdAt" | "views" | "likes") => {
    return `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      sortBy === value
        ? "bg-primary text-primary-foreground"
        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
    }`;
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
              placeholder="Search faces by name..."
              className="w-full"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              onClick={() => handleSortByChange("views")}
              className={getButtonClass("views")}
            >
              Most Viewed
            </Button>
            <Button
              onClick={() => handleSortByChange("likes")}
              className={getButtonClass("likes")}
            >
              Most Liked
            </Button>
            <Button
              onClick={() => handleSortByChange("createdAt")}
              className={getButtonClass("createdAt")}
            >
              Latest
            </Button>
          </div>
        </div>

        {/* Faces List */}
        <FacesList
          displayedFaces={displayedFaces}
          searchTerm={searchTerm}
          isLoadingMore={isLoadingMore}
          hasMoreFaces={hasMoreFaces}
          handleFaceClick={handleFaceClick}
          handleLike={handleLike}
        />

        {/* Loading More Indicator */}
      </main>

      {/* Image View Dialog */}
      <Dialog open={!!selectedFace} onOpenChange={() => setSelectedFace(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedFace?.name}</DialogTitle>
            <DialogDescription>
              {viewedFaces.has(selectedFace?.id || "")
                ? "Viewing larger image (no credit will be deducted)"
                : "Viewing this larger image will deduct 1 credit from your wallet"}
            </DialogDescription>
          </DialogHeader>
          {selectedFace && (
            <div className="space-y-4">
              <div className="aspect-square w-full overflow-hidden rounded-lg">
                <Image
                  src={selectedFace.imageUrl}
                  alt={`Large view of ${selectedFace.name}`}
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                  unoptimized
                  onLoad={handleImageView}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{selectedFace.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{selectedFace.likes.toLocaleString()} likes</span>
                  </div>
                </div>
                <Button
                  variant={selectedFace.isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => handleLike(selectedFace, e)}
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${
                      selectedFace.isLiked ? "fill-current" : ""
                    }`}
                  />
                  {selectedFace.isLiked ? "Liked" : "Like"}
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
