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
import { Face } from "@/app/faces/page";

type FacesListProps = {
  displayedFaces: Face[];
  searchTerm: string;
  isLoadingMore: boolean;
  hasMoreFaces: boolean;
  handleFaceClick: (face: Face) => void;
  handleLike: (face: Face, e: React.MouseEvent) => void;
};

export function FacesList({
  displayedFaces,
  searchTerm,
  isLoadingMore,
  hasMoreFaces,
  handleFaceClick,
  handleLike,
}: FacesListProps) {
  return (
    <section className="mb-8 md:mb-10">
      <h2 className="mb-4 text-xl font-semibold md:mb-6 md:text-2xl">
        {searchTerm ? `Results for "${searchTerm}"` : "Face Gallery"}
      </h2>
      {displayedFaces.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {displayedFaces.map((face) => (
            <Card
              key={face.id}
              className="flex flex-col overflow-hidden shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-xl dark:border-gray-700 cursor-pointer"
              onClick={() => handleFaceClick(face)}
            >
              <CardHeader className="relative p-0">
                <div className="aspect-square w-full overflow-hidden">
                  <Image
                    src={face.imageUrl}
                    alt={`Face of ${face.name}`}
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
                  title={face.name}
                >
                  {face.name}
                </CardTitle>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <p>
                    Created:{" "}
                    {face.createdAt ? face.createdAt.toLocaleString() : ""}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{face.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{face.likes.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-2">
                <Button
                  variant={face.isLiked ? "default" : "outline"}
                  className="w-full"
                  onClick={(e) => handleLike(face, e)}
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${
                      face.isLiked ? "fill-current" : ""
                    }`}
                  />
                  {face.isLiked ? "Liked" : "Like"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No faces found matching your criteria.
        </p>
      )}

      {/* Loading indicator */}
      {isLoadingMore && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading more faces...</span>
          </div>
        </div>
      )}

      {/* End of results indicator */}
      {!hasMoreFaces && displayedFaces.length > 0 && (
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            You've reached the end of the gallery!
          </p>
        </div>
      )}
    </section>
  );
}
