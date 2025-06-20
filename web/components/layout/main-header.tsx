"use client";

import { ListTodo } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export function MainHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo className="h-6 w-6" />
          <span className="font-semibold">Movies App</span>
        </div>

        <Navigation />

        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
