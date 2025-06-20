# Full-Stack Movie Search Application

This project is a full-stack application featuring a NestJS backend API and a Next.js frontend. It allows users to manage their todo lists, and includes authentication and user management features.

## API

The backend API is built with NestJS. For more details, see the [API README](./api/README.md).

Key features include:

- User authentication (registration, login)
- User management
- CRUD operations for todo lists and todo items
- ...

## Web

The frontend is a Next.js application. For more details, see the [Web README](./web/README.md).

Key functionalities include:

- User-friendly interface for managing todo lists
- Secure access via authentication
- ...

## Getting Started

To get the application up and running, you'll need to start both the backend API and the frontend web application.

### Prerequisites

- Node.js (a recent LTS version is recommended)
- Yarn (or npm, though these instructions will use Yarn)

### API Setup

1. Navigate to the `api` directory: `cd api`
2. Install dependencies: `yarn install`
3. Set up environment variables: Copy `api/.env.example` to `api/.env` and fill in the necessary values (e.g., database connection strings, JWT secrets). If `api/.env.example` does not exist, you may need to create `api/.env` based on application requirements.
4. Run the development server: `yarn run start:dev`

### Web Setup

1. Navigate to the `web` directory: `cd web` (if you are in the `api` directory, use `cd ../web`)
2. Install dependencies: `yarn install`
3. Set up environment variables: If the frontend needs to connect to the API, create a `web/.env.local` file (if it doesn't exist) and add `NEXT_PUBLIC_API_URL=http://localhost:PORT` (replace PORT with the actual port your API is running on, typically 3001 or 3000 for NestJS). Check `web/README.md` or application code for specific environment variables.
4. Run the development server: `yarn dev`

### Running the Application

Once both the API and Web servers are running, you can typically access the web application at [http://localhost:3000](http://localhost:3000).

## Deployment

### API

The NestJS API can be deployed to various platforms. Refer to the [API Deployment Documentation](./api/README.md#deployment) for more specific instructions and options provided in the API's own README. General NestJS deployment guidance can also be found in the [official NestJS deployment documentation](https://docs.nestjs.com/deployment).

### Web

The Next.js frontend is commonly deployed on platforms like Vercel (recommended by Next.js creators) or Netlify. For more details, see the [Web Deployment Documentation](./web/README.md#deploy-on-vercel) in the web app's README. You can also consult the general [Next.js deployment guides](https://nextjs.org/docs/app/building-your-application/deploying).

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these general guidelines:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix:
    `git checkout -b feature/your-feature-name` or `bugfix/issue-number`.
3.  **Make your changes** and commit them with clear, descriptive messages.
    Example: `git commit -m "feat: Add user authentication"`
4.  **Push your changes** to your fork:
    `git push origin feature/your-feature-name`
5.  **Create a pull request** to the main repository's `main` (or `master`) branch.

Please ensure your code adheres to any existing linting and formatting rules (if applicable). If a `CONTRIBUTING.md` file exists in the repository, please refer to it for more specific guidelines.

## License

This project is currently unlicensed. Please refer to the project owner for license information or consider adding a `LICENSE` file to the repository.
