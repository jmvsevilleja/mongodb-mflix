"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
// import { useRouter, usePathname } from "next/navigation";

import { cn, updateUrlParams } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginatorProps extends React.HTMLAttributes<HTMLDivElement> {
  totalCount: number;
  page: number;
  pageSize: number;
  pageSizeSelectOptions?: {
    pageSizeOptions: number[];
  };
}

export function Paginator({
  totalCount,
  page,
  pageSize,
  pageSizeSelectOptions = {
    pageSizeOptions: [5, 10, 25, 50, 100],
  },
  className,
  ...props
}: PaginatorProps) {
  // const router = useRouter();
  // const pathname = usePathname();
  const pageCount = Math.ceil(totalCount / pageSize);
  const siblingCount = 1;

  // Generate page numbers to show
  const generatePages = () => {
    // Always show first and last pages
    const firstPage = 1;
    const lastPage = pageCount;

    // Calculate range around current page based on siblingCount
    const leftSiblingIndex = Math.max(page - siblingCount, 1);
    const rightSiblingIndex = Math.min(page + siblingCount, pageCount);

    // Whether to show ellipses
    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < pageCount - 1;

    // Generate the array of page numbers to display
    const pages = [];

    // Always show page 1
    if (firstPage < leftSiblingIndex) {
      pages.push(1);
      // Add left dots if needed
      if (showLeftDots) pages.push("left-dots");
    }

    // Add the range of pages around the current page
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      pages.push(i);
    }

    // Add right dots and last page if needed
    if (lastPage > rightSiblingIndex) {
      if (showRightDots) pages.push("right-dots");
      if (rightSiblingIndex < lastPage) pages.push(lastPage);
    }

    return pages;
  };

  const handlePageChange = (newPage: number) => {
    updateUrlParams({
      page: newPage.toString(),
      pageSize: pageSize.toString(),
    });
  };

  const handlePageSizeChange = (newSize: string) => {
    updateUrlParams({
      page: "1", // Reset to first page when changing page size
      pageSize: newSize,
    });
  };

  const pages = generatePages();

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row justify-between items-center gap-4",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-4 flex-1">
        <div className="flex items-center gap-4">
          <span className="whitespace-nowrap text-sm">Rows per page</span>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select page size" />
            </SelectTrigger>
            <SelectContent>
              {pageSizeSelectOptions.pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((pageNum, i) => {
          if (pageNum === "left-dots" || pageNum === "right-dots") {
            return (
              <Button
                key={`dots-${i}`}
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            );
          }

          const pageNumber = pageNum as number;
          return (
            <Button
              key={pageNumber}
              variant={pageNumber === page ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(pageNumber)}
              aria-label={`Page ${pageNumber}`}
              aria-current={pageNumber === page ? "page" : undefined}
            >
              {pageNumber}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(Math.min(pageCount, page + 1))}
          disabled={page === pageCount}
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
