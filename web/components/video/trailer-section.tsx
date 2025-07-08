"use client";

import { useState } from "react";
import { VideoPlayer } from "./video-player";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, ExternalLink, Film, AlertCircle } from "lucide-react";
import { Movie } from "@/app/movies/page";
import { VercelBlobUploader } from "./vercel-blob-uploader";

interface TrailerSectionProps {
  movie: Movie;
}

export function TrailerSection({ movie }: TrailerSectionProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Check if movie has a trailer URL (MP4 from Vercel Blob)
  const hasTrailer = movie.trailer;

  // Validate if the trailer URL is a valid MP4 or video URL
  const isValidVideoUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();
      return (
        pathname.endsWith(".mp4") ||
        pathname.endsWith(".webm") ||
        pathname.endsWith(".mov") ||
        pathname.endsWith(".avi") ||
        urlObj.hostname.includes("blob.vercel-storage.com")
      );
    } catch {
      return false;
    }
  };

  const handlePlayTrailer = () => {
    if (hasTrailer && isValidVideoUrl(movie.trailer!)) {
      setShowPlayer(true);
      setVideoError(false);
    }
  };

  const handleVideoError = () => {
    setVideoError(true);
  };

  // If no trailer is available, don't render the section
  if (!hasTrailer) {
    return null;
  }

  // If trailer URL is not valid, show error state
  if (!isValidVideoUrl(movie.trailer!)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5 text-blue-500" />
            Trailer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              Trailer URL is not valid or accessible
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="h-5 w-5 text-blue-500" />
          Official Trailer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showPlayer ? (
          <div className="space-y-4">
            <VideoPlayer
              url={movie.trailer!}
              title={`${movie.title} - Official Trailer`}
              poster={movie.poster}
              className="aspect-video"
              autoPlay={true}
              onError={handleVideoError}
            />

            {videoError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  Failed to load trailer. The video file may be unavailable.
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  Official Trailer
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {movie.title} ({movie.year})
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPlayer(false)}
                >
                  Close Player
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(movie.trailer!, "_blank")}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Trailer Thumbnail */}
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden group cursor-pointer">
              {movie.poster ? (
                <div
                  className="w-full h-full bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${movie.poster})` }}
                  onClick={handlePlayTrailer}
                >
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                    <Button
                      size="lg"
                      className="rounded-full h-16 w-16 p-0 bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="h-6 w-6 ml-1" fill="white" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center bg-muted cursor-pointer"
                  onClick={handlePlayTrailer}
                >
                  <Button
                    size="lg"
                    className="rounded-full h-16 w-16 p-0 bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="h-6 w-6 ml-1" fill="white" />
                  </Button>
                </div>
              )}
            </div>

            {/* Trailer Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Official Trailer</h4>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Film className="h-3 w-3" />
                  MP4 Video
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                Watch the official trailer for {movie.title}
                {movie.year && ` (${movie.year})`}
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={handlePlayTrailer}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Play Trailer
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.open(movie.trailer!, "_blank")}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>

            {/* Video Info */}
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
              <p className="font-medium mb-1">Video Source:</p>
              <p className="break-all">{movie.trailer}</p>
            </div>
          </div>
        )}
      </CardContent>
      {/* Admin Upload Section - Only show if no trailer exists */}
      {!hasTrailer && (
        <div className="border-t pt-6">
          <VercelBlobUploader
            movieId={movie.id}
            movieTitle={movie.title}
            onUploadComplete={(url) => {
              console.log("Trailer uploaded:", url);
              // In a real app, you would update the movie record here
            }}
          />
        </div>
      )}
    </Card>
  );
}
