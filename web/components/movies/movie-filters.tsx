"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { MovieFiltersType } from "@/app/movies/page";

interface MovieFiltersProps {
  filters: MovieFiltersType;
  selectedGenres: string[];
  selectedRating: string;
  selectedLanguages: string[];
  selectedCountry: string;
  yearRange: { from?: number; to?: number };
  onGenresChange: (genres: string[]) => void;
  onRatingChange: (rating: string) => void;
  onLanguagesChange: (languages: string[]) => void;
  onCountryChange: (country: string) => void;
  onYearRangeChange: (range: { from?: number; to?: number }) => void;
}

export function MovieFilters({
  filters,
  selectedGenres,
  selectedRating,
  selectedLanguages,
  selectedCountry,
  yearRange,
  onGenresChange,
  onRatingChange,
  onLanguagesChange,
  onCountryChange,
  onYearRangeChange,
}: MovieFiltersProps) {
  const [yearFrom, setYearFrom] = useState(yearRange.from?.toString() || "");
  const [yearTo, setYearTo] = useState(yearRange.to?.toString() || "");

  const handleGenreSelect = (genre: string) => {
    if (!selectedGenres.includes(genre)) {
      onGenresChange([...selectedGenres, genre]);
    }
  };

  const handleGenreRemove = (genre: string) => {
    onGenresChange(selectedGenres.filter(g => g !== genre));
  };

  const handleLanguageSelect = (language: string) => {
    if (!selectedLanguages.includes(language)) {
      onLanguagesChange([...selectedLanguages, language]);
    }
  };

  const handleLanguageRemove = (language: string) => {
    onLanguagesChange(selectedLanguages.filter(l => l !== language));
  };

  const handleYearRangeUpdate = () => {
    onYearRangeChange({
      from: yearFrom ? parseInt(yearFrom) : undefined,
      to: yearTo ? parseInt(yearTo) : undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>
          Refine your movie search with these filters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Genres */}
        <div className="space-y-3">
          <Label>Genres</Label>
          <Select onValueChange={handleGenreSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select genres" />
            </SelectTrigger>
            <SelectContent>
              {filters.genres.map(genre => (
                <SelectItem 
                  key={genre} 
                  value={genre}
                  disabled={selectedGenres.includes(genre)}
                >
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedGenres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedGenres.map(genre => (
                <Badge key={genre} variant="secondary">
                  {genre}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => handleGenreRemove(genre)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="space-y-3">
          <Label>Rating</Label>
          <Select value={selectedRating} onValueChange={onRatingChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Ratings</SelectItem>
              {filters.ratings.map(rating => (
                <SelectItem key={rating} value={rating}>
                  {rating}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Languages */}
        <div className="space-y-3">
          <Label>Languages</Label>
          <Select onValueChange={handleLanguageSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select languages" />
            </SelectTrigger>
            <SelectContent>
              {filters.languages.map(language => (
                <SelectItem 
                  key={language} 
                  value={language}
                  disabled={selectedLanguages.includes(language)}
                >
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedLanguages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedLanguages.map(language => (
                <Badge key={language} variant="secondary">
                  {language}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => handleLanguageRemove(language)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Country */}
        <div className="space-y-3">
          <Label>Country</Label>
          <Select value={selectedCountry} onValueChange={onCountryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Countries</SelectItem>
              {filters.countries.map(country => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Range */}
        <div className="space-y-3">
          <Label>Year Range</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="From"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              min={filters.minYear}
              max={filters.maxYear}
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="number"
              placeholder="To"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              min={filters.minYear}
              max={filters.maxYear}
            />
            <Button onClick={handleYearRangeUpdate} size="sm">
              Apply
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Available range: {filters.minYear} - {filters.maxYear}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}