# Blackjack Game Project Structure

This document outlines the complete project structure for the Blackjack game implementation, with separate folders for backend and frontend components.

## Root Directory Structure

```
blackjack/
├── backend/             # Node.js backend with Express and SQLite
├── frontend/            # React frontend with Vite
├── .gitignore           # Git ignore file for the entire project
├── README.md            # Project documentation
├── SPECIFICATION.md     # Detailed project specification
└── package.json         # Root package.json for project-wide scripts
```

## Backend Directory Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   │   ├── AuthController.js
│   │   ├── GameController.js
│   │   └── StatsController.js
│   ├── models/          # Database models
│   │   ├── index.js     # Database connection and model exports
│   │   ├── User.js
│   │   ├── Game.js
│   │   └── UserStats.js
│   ├── routes/          # API routes
│   │   ├── index.js     # Route aggregation
│   │   ├── authRoutes.js
│   │   ├── gameRoutes.js
│   │   └── statsRoutes.js
│   ├── services/        # Business logic
│   │   ├── BlackjackService.js
│   │   ├── DeckService.js
│   │   ├── GameService.js
│   │   └── UserService.js
│   ├── middleware/      # Express middleware
│   │   └── authMiddleware.js
│   └── utils/           # Utility functions
│       ├── errorHandler.js
│       └── validation.js
├── scripts/             # Helper scripts
│   └── migrate.js       # Database migration script
├── .env                 # Environment variables (not in git)
├── .env.example         # Example environment variables
├── .gitignore           # Backend-specific gitignore
├── package.json         # Backend dependencies and scripts
├── server.js            # Main application entry point
└── vite.config.js       # Vite configuration for backend
```

## Frontend Directory Structure

```
frontend/
├── src/
│   ├── assets/          # Static assets
│   │   ├── images/      # Image files
│   │   └── fonts/       # Font files
│   ├── components/      # Reusable UI components
│   │   ├── Card.jsx
│   │   ├── GameControls.jsx
│   │   ├── GameResult.jsx
│   │   ├── Hand.jsx
│   │   ├── Header.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/         # React context providers
│   │   └── AuthContext.jsx
│   ├── hooks/           # Custom React hooks
│   │   └── useGame.js
│   ├── pages/           # Page components
│   │   ├── GameBoard.jsx
│   │   ├── GameHistory.jsx
│   │   ├── Login.jsx
│   │   ├── NotFound.jsx
│   │   ├── Register.jsx
│   │   └── UserProfile.jsx
│   ├── services/        # API service clients
│   │   ├── apiClient.js
│   │   ├── authService.js
│   │   ├── gameService.js
│   │   └── statsService.js
│   ├── styles/          # CSS styles
│   │   ├── App.css
│   │   ├── Auth.css
│   │   ├── Card.css
│   │   ├── GameBoard.css
│   │   ├── GameControls.css
│   │   ├── GameHistory.css
│   │   ├── GameResult.css
│   │   ├── Hand.css
│   │   ├── Header.css
│   │   ├── NotFound.css
│   │   ├── UserProfile.css
│   │   ├── index.css
│   │   └── reset.css
│   ├── utils/           # Utility functions
│   │   └── formatters.js
│   ├── App.jsx          # Main App component
│   ├── main.jsx         # Application entry point
│   └── vite-env.d.ts    # Vite type definitions
├── public/              # Public static files
│   ├── favicon.ico
│   └── robots.txt
├── .env                 # Environment variables (not in git)
├── .env.example         # Example environment variables
├── .gitignore           # Frontend-specific gitignore
├── index.html           # HTML entry point
├── package.json         # Frontend dependencies and scripts
└── vite.config.js       # Vite configuration for frontend
```

## Root Package.json Configuration

```json
{
  "name": "blackjack",
  "version": "1.0.0",
  "description": "Blackjack game with React frontend and Node.js backend",
  "scripts": {
    "install:all": "npm install && cd backend && npm install && cd ../frontend && npm install",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "build:backend": "cd backend && npm run build",
    "build:frontend": "cd frontend && npm run build",
    "build": "npm run build:backend && npm run build:frontend",
    "start": "cd backend && npm run start"
  },
  "devDependencies": {
    "concurrently": "^8.0.1"
  }
}
```

## Git Configuration

### Root .gitignore

```
# Dependencies
node_modules/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Database files
*.sqlite
*.sqlite3

# Editor directories and files
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS files
.DS_Store
Thumbs.db
```

## Initial Setup Instructions

1. Create the project structure:
   ```bash
   mkdir -p blackjack/backend/src/{controllers,models,routes,services,middleware,utils}
   mkdir -p blackjack/backend/scripts
   mkdir -p blackjack/frontend/src/{assets/{images,fonts},components,context,hooks,pages,services,styles,utils}
   mkdir -p blackjack/frontend/public
   ```

2. Initialize the root package.json:
   ```bash
   cd blackjack
   npm init -y
   ```

3. Initialize the backend:
   ```bash
   cd backend
   npm init -y
   ```

4. Initialize the frontend with Vite:
   ```bash
   cd ../frontend
   npm create vite@latest . -- --template react
   ```

5. Install root dependencies:
   ```bash
   cd ..
   npm install --save-dev concurrently
   ```

6. Update the package.json files with the appropriate scripts and dependencies as outlined in the implementation plans.

7. Create the necessary configuration files (.env.example, vite.config.js, etc.) in both backend and frontend directories.