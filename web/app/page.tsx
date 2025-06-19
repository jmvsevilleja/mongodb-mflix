import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainHeader } from "@/components/layout/main-header";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader />
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
              Search movies with ease
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              A simple, efficient movie app to keep track of favorite movies.
            </p>
            <div className="space-x-4">
              <Link href="/movies">
                <Button size="lg" className="px-8">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="container space-y-6 py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Features
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Everything you need to keep track of your favorite movies in one
              place
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <div className="mt-4 space-y-2">
                <h3 className="font-bold">Movie Search</h3>
                <p className="text-sm text-muted-foreground">
                  Search for movies by title, genre, or year. Get detailed
                  information about each movie
                </p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <div className="mt-4 space-y-2">
                <h3 className="font-bold">Advance Search</h3>
                <p className="text-sm text-muted-foreground">
                  Using AI that can analyze your movie descriptions and suggest
                  related movies
                </p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <div className="mt-4 space-y-2">
                <h3 className="font-bold">Responsive Design</h3>
                <p className="text-sm text-muted-foreground">
                  Access your movies from any device, anytime
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            &copy; {new Date().getFullYear()} Movies App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
