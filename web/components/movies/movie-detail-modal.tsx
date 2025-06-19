"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Clock, Calendar, Globe, Award, Users, Loader2 } from "lucide-react";
import { Movie } from "@/app/movies/page";
import { format } from "date-fns";

interface MovieDetailModalProps {
  movie: Movie | null;
  movieDetail?: Movie;
  loading: boolean;
  onClose: () => void;
}

export function MovieDetailModal({
  movie,
  movieDetail,
  loading,
  onClose,
}: MovieDetailModalProps) {
  const detailData = movieDetail || movie;

  if (!movie) return null;

  return (
    <Dialog open={!!movie} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">{detailData?.title}</DialogTitle>
              {detailData?.year && (
                <DialogDescription>
                  Released in {detailData.year}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Poster */}
              <div className="space-y-4">
                <div className="aspect-[2/3] relative overflow-hidden rounded-lg">
                  {detailData?.poster ? (
                    <Image
                      src={detailData.poster}
                      alt={detailData.title}
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

                {/* Quick Stats */}
                <div className="space-y-2">
                  {detailData?.imdb?.rating && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{detailData.imdb.rating}/10</span>
                      {detailData.imdb.votes && (
                        <span className="text-sm text-muted-foreground">
                          ({detailData.imdb.votes.toLocaleString()} votes)
                        </span>
                      )}
                    </div>
                  )}

                  {detailData?.runtime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{detailData.runtime} minutes</span>
                    </div>
                  )}

                  {detailData?.released && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(detailData.released), "MMMM dd, yyyy")}</span>
                    </div>
                  )}

                  {detailData?.rated && (
                    <Badge variant="secondary">{detailData.rated}</Badge>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="md:col-span-2 space-y-6">
                {/* Plot */}
                {(detailData?.fullplot || detailData?.plot) && (
                  <div>
                    <h3 className="font-semibold mb-2">Plot</h3>
                    <p className="text-sm leading-relaxed">
                      {detailData.fullplot || detailData.plot}
                    </p>
                  </div>
                )}

                {/* Genres */}
                {detailData?.genres && detailData.genres.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {detailData.genres.map(genre => (
                        <Badge key={genre} variant="outline">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Cast and Crew */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {detailData?.directors && detailData.directors.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Directors
                      </h3>
                      <p className="text-sm">{detailData.directors.join(", ")}</p>
                    </div>
                  )}

                  {detailData?.cast && detailData.cast.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Cast
                      </h3>
                      <p className="text-sm">
                        {detailData.cast.slice(0, 5).join(", ")}
                        {detailData.cast.length > 5 && "..."}
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {detailData?.languages && detailData.languages.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Languages
                      </h3>
                      <p className="text-sm">{detailData.languages.join(", ")}</p>
                    </div>
                  )}

                  {detailData?.countries && detailData.countries.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Countries
                      </h3>
                      <p className="text-sm">{detailData.countries.join(", ")}</p>
                    </div>
                  )}
                </div>

                {/* Awards */}
                {detailData?.awards && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Awards
                    </h3>
                    <p className="text-sm">{detailData.awards.text || "No awards information available"}</p>
                  </div>
                )}

                {/* Tomatoes Rating */}
                {detailData?.tomatoes?.critic?.rating && (
                  <div>
                    <h3 className="font-semibold mb-2">Rotten Tomatoes</h3>
                    <div className="flex gap-4 text-sm">
                      <span>Critics: {detailData.tomatoes.critic.rating}/10</span>
                      {detailData.tomatoes.viewer?.rating && (
                        <span>Audience: {detailData.tomatoes.viewer.rating}/5</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}