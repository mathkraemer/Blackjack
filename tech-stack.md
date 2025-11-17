# Blackjack Game Technology Stack

This document outlines the complete technology stack and dependencies for the Blackjack game implementation, including both backend and frontend components.

## Overview

The Blackjack game is built using a modern JavaScript stack:

- **Backend**: Node.js with Express, SQLite database, and Sequelize ORM
- **Frontend**: React with Vite build tool
- **Communication**: REST API

## Backend Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js    | 18.x+   | JavaScript runtime |
| Express    | 4.18.x  | Web framework |
| SQLite     | 3.x     | Database |
| Sequelize  | 6.x     | ORM for database operations |
| Vite       | 4.x     | Development tooling |

### Backend Dependencies

#### Production Dependencies

```json
{
  "dependencies": {
    "bcrypt": "^5.1.0",        // Password hashing
    "cors": "^2.8.5",          // Cross-Origin Resource Sharing
    "dotenv": "^16.0.3",       // Environment variable management
    "express": "^4.18.2",      // Web framework
    "jsonwebtoken": "^9.0.0",  // JWT authentication
    "sequelize": "^6.31.1",    // ORM
    "sqlite3": "^5.1.6"        // SQLite database driver
  }
}
```

#### Development Dependencies

```json
{
  "devDependencies": {
    "@vitejs/plugin-node": "^3.0.0",  // Vite plugin for Node.js
    "nodemon": "^2.0.22",             // Auto-restart during development
    "vite": "^4.3.5"                  // Build tool
  }
}
```

### Backend Configuration Files

#### Vite Configuration (vite.config.js)

```javascript
import { defineConfig } from 'vite';
import node from '@vitejs/plugin-node';

export default defineConfig({
  plugins: [node()],
  server: {
    port: 3001
  },
  build: {
    target: 'node16',
    outDir: 'dist'
  }
});
```

#### Environment Variables (.env.example)

```
PORT=3001
DB_PATH=./database.sqlite
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

## Frontend Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React      | 18.x    | UI library |
| React Router | 6.x   | Client-side routing |
| Vite       | 4.x     | Build tool |
| Axios      | 1.x     | HTTP client |

### Frontend Dependencies

#### Production Dependencies

```json
{
  "dependencies": {
    "axios": "^1.4.0",                // HTTP client
    "react": "^18.2.0",               // UI library
    "react-dom": "^18.2.0",           // React DOM bindings
    "react-router-dom": "^6.11.1"     // Routing
  }
}
```

#### Development Dependencies

```json
{
  "devDependencies": {
    "@types/react": "^18.2.6",        // TypeScript definitions for React
    "@types/react-dom": "^18.2.4",    // TypeScript definitions for React DOM
    "@vitejs/plugin-react": "^4.0.0", // Vite plugin for React
    "eslint": "^8.40.0",              // Linting
    "eslint-plugin-react": "^7.32.2", // React-specific linting rules
    "eslint-plugin-react-hooks": "^4.6.0", // React hooks linting rules
    "eslint-plugin-react-refresh": "^0.4.1", // React refresh linting rules
    "vite": "^4.3.5"                  // Build tool
  }
}
```

### Frontend Configuration Files

#### Vite Configuration (vite.config.js)

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

#### Environment Variables (.env.example)

```
VITE_API_URL=http://localhost:3001/api
```

## Root Project Configuration

### Root Package.json

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

## Development Tools

### Recommended Development Tools

1. **Visual Studio Code** - Code editor with extensions:
   - ESLint
   - Prettier
   - SQLite Viewer
   - REST Client
   - React Developer Tools

2. **Postman** or **Insomnia** - API testing

3. **SQLite Browser** - Database management

4. **Git** - Version control

## Browser Compatibility

The frontend application is designed to work with modern browsers:

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Node.js Version Requirements

- Backend: Node.js 16.x or higher
- Frontend: Node.js 16.x or higher

## Package Manager

- npm 7.x or higher

## Installation Requirements

### System Requirements

- Operating System: Windows 10+, macOS 10.15+, or Linux
- RAM: 4GB minimum, 8GB recommended
- Disk Space: 1GB free space

### Prerequisites

- Node.js and npm installed
- Git installed
- Basic knowledge of terminal/command line

## Version Control Strategy

- **Main Branch**: Production-ready code
- **Development Branch**: Integration branch for features
- **Feature Branches**: Individual feature development

## Dependency Update Strategy

- Regular updates for security patches
- Quarterly review of dependencies for major updates
- Use of npm audit for security vulnerability detection