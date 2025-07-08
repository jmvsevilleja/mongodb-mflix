import Link from "next/link";
import { Check, Search, Sparkles, Brain, Zap, Star, Clock, Filter, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MainHeader } from "@/components/layout/main-header";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-indigo-950/20">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container relative space-y-8 pb-16 pt-16 md:pb-24 md:pt-20 lg:pb-32 lg:pt-28">
            <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
              <div className="flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                <Brain className="h-4 w-4" />
                <span>Powered by AI • Mistral AI + LangChain</span>
              </div>
              
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Discover Movies with AI
              </h1>
              
              <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl sm:leading-8">
                Experience the future of movie discovery. Describe what you're looking for in natural language, 
                and our AI will find the perfect movies using advanced semantic understanding and vector search.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/movies">
                  <Button size="lg" className="px-8 py-3 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Try AI Search
                  </Button>
                </Link>
                <Link href="/movies">
                  <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-purple-200 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-950/20">
                    <Search className="mr-2 h-5 w-5" />
                    Browse Movies
                  </Button>
                </Link>
              </div>

              {/* Demo Examples */}
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl">
                <div className="rounded-lg bg-white/60 dark:bg-gray-900/60 p-3 text-sm backdrop-blur-sm border border-purple-200 dark:border-purple-800">
                  <span className="text-purple-600 dark:text-purple-400 font-medium">"cowboy and astronaut become friends"</span>
                  <div className="text-xs text-muted-foreground mt-1">→ Toy Story (95% match)</div>
                </div>
                <div className="rounded-lg bg-white/60 dark:bg-gray-900/60 p-3 text-sm backdrop-blur-sm border border-purple-200 dark:border-purple-800">
                  <span className="text-purple-600 dark:text-purple-400 font-medium">"space battles with lightsabers"</span>
                  <div className="text-xs text-muted-foreground mt-1">→ Star Wars saga</div>
                </div>
                <div className="rounded-lg bg-white/60 dark:bg-gray-900/60 p-3 text-sm backdrop-blur-sm border border-purple-200 dark:border-purple-800 sm:col-span-2 lg:col-span-1">
                  <span className="text-purple-600 dark:text-purple-400 font-medium">"talking animals with life lessons"</span>
                  <div className="text-xs text-muted-foreground mt-1">→ The Lion King, Zootopia</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Technology Section */}
        <section className="container py-16 md:py-24">
          <div className="mx-auto max-w-5xl space-y-12">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400">
                <Brain className="h-6 w-6" />
                <span className="text-sm font-medium uppercase tracking-wider">AI Technology</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold">
                How Our AI Works
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
                Advanced machine learning and semantic understanding to find exactly what you're looking for
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Natural Language</h3>
                  <p className="text-sm text-muted-foreground">
                    Describe movies in your own words, just like talking to a friend
                  </p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Vector Embeddings</h3>
                  <p className="text-sm text-muted-foreground">
                    Mistral AI converts your query into 1024-dimensional vectors
                  </p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                  <Zap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Fast AI Ranking</h3>
                  <p className="text-sm text-muted-foreground">
                    LangChain quickly ranks results by relevance in milliseconds
                  </p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <Star className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Perfect Matches</h3>
                  <p className="text-sm text-muted-foreground">
                    Get semantically relevant results, not just keyword matches
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/50 py-16 md:py-24">
          <div className="container space-y-12">
            <div className="mx-auto max-w-3xl text-center space-y-4">
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold">
                Powerful Features
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need for the ultimate movie discovery experience
              </p>
            </div>

            <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* AI Recommendations */}
              <Card className="relative overflow-hidden border-purple-200 dark:border-purple-800">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full"></div>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">AI-Powered Recommendations</CardTitle>
                      <Badge variant="secondary" className="text-xs">Featured</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Describe what you want to watch in natural language and get semantically relevant movie suggestions
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>Natural language processing</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>Vector similarity search</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>Fast AI ranking</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Search */}
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg">Advanced Search & Filters</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Traditional search with powerful filtering by genre, year, rating, language, and more
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>Multi-criteria filtering</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>Real-time search</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>Sort by relevance</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Movie Details */}
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                      <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <CardTitle className="text-lg">Rich Movie Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comprehensive movie details including cast, crew, ratings, and reviews
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>IMDB & Rotten Tomatoes ratings</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>Cast and crew information</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>Plot summaries and trailers</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fast Performance */}
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                      <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-lg">Lightning Fast</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Optimized for speed with intelligent caching and efficient vector operations
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>Sub-second AI responses</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>Efficient vector search</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>Smart caching</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Responsive Design */}
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <Filter className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <CardTitle className="text-lg">Responsive Design</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Beautiful, responsive interface that works perfectly on all devices
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>Mobile-first design</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>Dark/light mode</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>Accessible interface</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Real-time Updates */}
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                      <Clock className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle className="text-lg">Smart Pagination</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Infinite scroll and smart pagination for seamless browsing experience
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>Infinite scroll loading</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>Smart result caching</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>Optimized performance</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="container py-16 md:py-24">
          <div className="mx-auto max-w-4xl space-y-12">
            <div className="text-center space-y-4">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold">
                Built with Modern Technology
              </h2>
              <p className="text-lg text-muted-foreground">
                Powered by cutting-edge AI and modern web technologies
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    AI & Machine Learning
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mistral AI Embeddings</span>
                    <Badge variant="secondary">1024D Vectors</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">LangChain Framework</span>
                    <Badge variant="secondary">Fast Ranking</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">MongoDB Vector Search</span>
                    <Badge variant="secondary">Cosine Similarity</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    Frontend & Backend
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Next.js 15</span>
                    <Badge variant="secondary">React 19</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">NestJS API</span>
                    <Badge variant="secondary">GraphQL</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tailwind CSS</span>
                    <Badge variant="secondary">Responsive</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center space-y-8 text-white">
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold">
                Ready to Discover Your Next Favorite Movie?
              </h2>
              <p className="text-lg opacity-90">
                Experience the future of movie discovery with AI-powered recommendations. 
                Find exactly what you're looking for, even if you don't know how to describe it.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/movies">
                  <Button size="lg" variant="secondary" className="px-8 py-3 text-lg bg-white text-purple-600 hover:bg-gray-100">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Exploring
                  </Button>
                </Link>
                <Link href="/movies">
                  <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-white text-white hover:bg-white/10">
                    <Search className="mr-2 h-5 w-5" />
                    Browse Movies
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-muted/30">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            &copy; {new Date().getFullYear()} Movies App. Powered by AI for intelligent movie discovery.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              Mistral AI
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              LangChain
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}