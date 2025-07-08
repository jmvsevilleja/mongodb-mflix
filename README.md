# Full-Stack Movie Search Application

This project is a full-stack application featuring a NestJS backend API and a Next.js frontend. It allows users to search for movies using traditional search or AI-powered semantic recommendations using Mistral AI embeddings, MongoDB vector search, and LangChain intelligent filtering.

## Features

- **Traditional Movie Search**: Search movies by title, genre, year, rating, etc.
- **AI-Powered Recommendations**: Describe what you're looking for and get semantically similar movies
- **Vector Search**: Uses MongoDB Atlas Vector Search for efficient similarity matching
- **Mistral AI Integration**: Leverages Mistral's embedding model for semantic understanding
- **LangChain Intelligent Filtering**: Advanced AI filtering and ranking using LangChain + Mistral AI
- **Smart Explanations**: AI-generated explanations for why each movie matches your query

## AI Technology Stack

### Backend AI Components:
- **Mistral AI Embeddings**: Convert movie descriptions and user queries into high-dimensional vectors
- **MongoDB Vector Search**: Efficient similarity search using cosine similarity
- **LangChain Framework**: Orchestrates AI workflows for intelligent filtering
- **Mistral Large Model**: Provides detailed analysis and explanations for recommendations

### AI Workflow:
1. **Embedding Creation**: User query → Mistral AI → 1024-dimensional vector
2. **Vector Search**: MongoDB finds movies with similar embeddings
3. **Fast AI Ranking**: LangChain quickly reorders candidates by relevance
4. **Smart Sorting**: Results ranked by AI-determined relevance in milliseconds
5. **Optimized Display**: Fast, relevant results without detailed explanations

## API

The backend API is built with NestJS and includes:

- User authentication (registration, login)
- Movie search and filtering
- AI-powered movie recommendations using Mistral AI embeddings
- MongoDB vector search integration
- LangChain intelligent filtering and ranking
- GraphQL API

### Key Technologies:
- NestJS with GraphQL
- MongoDB with Vector Search
- Mistral AI for embeddings and LLM analysis
- LangChain for AI workflow orchestration
- JWT authentication

## Web

The frontend is a Next.js application featuring:

- Responsive movie search interface
- AI recommendation system with natural language queries
- Enhanced UI showing AI confidence scores and explanations
- Movie detail modals
- Authentication and user management

### Key Technologies:
- Next.js 15 with App Router
- Apollo Client for GraphQL
- Tailwind CSS for styling
- NextAuth.js for authentication

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- MongoDB Atlas account (for vector search)
- Mistral AI API key

### MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster
2. Create a vector search index named `vector_index` on the `movies` collection:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1024,
      "similarity": "cosine"
    }
  ]
}
```

### API Setup

1. Navigate to the `api` directory: `cd api`
2. Install dependencies: `npm install`
3. Set up environment variables: Copy `api/.env.example` to `api/.env` and fill in:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   MISTRAL_API_KEY=your_mistral_api_key
   JWT_ACCESS_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   ```
4. Run the development server: `npm run start:dev`

### Web Setup

1. Navigate to the `web` directory: `cd web`
2. Install dependencies: `npm install`
3. Set up environment variables: Create `web/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```
4. Run the development server: `npm run dev`

### Initial Data Setup

1. Import movie data into your MongoDB collection
2. Create embeddings for existing movies by calling the GraphQL mutation:
   ```graphql
   mutation {
     createMovieEmbeddings(batchSize: 10)
   }
   ```

## Usage

### Traditional Search
- Use the "Search Movies" tab
- Filter by genre, rating, year, language, country
- Sort by various criteria

### AI Recommendations
- Use the "AI Recommendations" tab
- Enter descriptive text like "a story where a cowboy and astronaut become friends"
- Get semantically similar movies ranked by AI relevance
- See detailed AI explanations for each recommendation

## Example Queries

- "a story where a cowboy and astronaut become friends" → Toy Story (95% match)
- "space battles with lightsabers and the force" → Star Wars movies
- "talking animals in a jungle with life lessons" → The Lion King, Madagascar
- "time travel adventure with a scientist and teenager" → Back to the Future
- "superhero team fighting alien invasion in New York" → The Avengers

## AI Architecture

### Vector Search Flow
1. User enters descriptive text
2. Text is converted to embeddings using Mistral AI
3. MongoDB vector search finds similar movie embeddings
4. LangChain analyzes candidates for relevance
5. AI provides relevance scores (0-100) and explanations
6. Results ranked by AI-determined relevance

### LangChain Filtering Process
1. **Candidate Retrieval**: Vector search gets 3x more results than needed
2. **Fast AI Ranking**: LangChain + Mistral Large quickly ranks candidates
3. **Smart Reordering**: AI reorders movies by relevance in seconds
4. **Optimized Results**: Fast, relevant ranking without detailed analysis
5. **Speed Optimization**: Prioritizes user experience over detailed explanations

### Fallback System
If AI filtering fails, the system falls back to:
1. Basic vector search results
2. Simple similarity-based ranking
3. Fast genre-based reasons
4. Ensures the system remains functional

## Performance Optimizations

- **Batch Processing**: Embeddings created in batches to avoid rate limits
- **Caching**: Vector embeddings stored in MongoDB for reuse
- **Fast AI Ranking**: Optimized LangChain prompts for speed over detail
- **Pagination**: AI filtering applied to paginated results
- **Fallback Logic**: Multiple fallback layers ensure reliability
- **Efficient Queries**: MongoDB aggregation pipelines for optimal performance

## Deployment

### API
- Deploy to platforms supporting Node.js (Vercel, Railway, etc.)
- Ensure MongoDB Atlas is accessible
- Set production environment variables including `MISTRAL_API_KEY`

### Web
- Deploy to Vercel (recommended) or similar platforms
- Configure production API URL
- Set up authentication secrets

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "feat: Add your feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Create a pull request

## License

This project is currently unlicensed. Please refer to the project owner for license information.

## AI Model Information

- **Embedding Model**: `mistral-embed` (1024 dimensions)
- **LLM Model**: `mistral-large-latest` for analysis and explanations
- **Vector Database**: MongoDB Atlas Vector Search
- **AI Framework**: LangChain for workflow orchestration
- **Similarity Metric**: Cosine similarity for vector comparisons