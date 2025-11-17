# Blackjack Game Deployment and Development Guide

This document provides comprehensive instructions for setting up the development environment and deploying the Blackjack game application.

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Running the Application Locally](#running-the-application-locally)
3. [Testing](#testing)
4. [Production Deployment](#production-deployment)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)

## Development Environment Setup

### Prerequisites

- Node.js (v16.x or higher)
- npm (v7.x or higher)
- Git
- SQLite (for local development)
- A code editor (VS Code recommended)

### Initial Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd blackjack
   ```

2. Install dependencies for all projects:
   ```bash
   npm run install:all
   ```
   
   This will install dependencies for:
   - Root project
   - Backend
   - Frontend

3. Set up environment variables:
   
   **Backend (.env file in backend/ directory)**
   ```
   PORT=3001
   DB_PATH=./database.sqlite
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   ```
   
   **Frontend (.env file in frontend/ directory)**
   ```
   VITE_API_URL=http://localhost:3001/api
   ```

4. Initialize the database:
   ```bash
   cd backend
   npm run db:migrate
   ```

### IDE Configuration

#### VS Code Recommended Extensions

- ESLint
- Prettier
- SQLite Viewer
- REST Client
- React Developer Tools

#### VS Code Settings

Create a `.vscode/settings.json` file in the project root:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript", "javascriptreact"],
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true
  }
}
```

## Running the Application Locally

### Development Mode

1. Start both backend and frontend concurrently:
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server at http://localhost:3001
   - Frontend development server at http://localhost:3000

2. To run only the backend:
   ```bash
   npm run dev:backend
   ```

3. To run only the frontend:
   ```bash
   npm run dev:frontend
   ```

### Building for Production

1. Build both backend and frontend:
   ```bash
   npm run build
   ```

2. To build only the backend:
   ```bash
   npm run build:backend
   ```

3. To build only the frontend:
   ```bash
   npm run build:frontend
   ```

### Running Production Build Locally

1. After building, start the production server:
   ```bash
   npm run start
   ```

   This will serve both the backend API and the frontend static files from the backend server.

## Testing

### Backend Testing

1. Run backend tests:
   ```bash
   cd backend
   npm test
   ```

2. Run tests with coverage:
   ```bash
   cd backend
   npm run test:coverage
   ```

### Frontend Testing

1. Run frontend tests:
   ```bash
   cd frontend
   npm test
   ```

2. Run tests with coverage:
   ```bash
   cd frontend
   npm run test:coverage
   ```

### API Testing

You can test the API endpoints using Postman or Insomnia:

1. Import the API collection from `docs/blackjack-api-collection.json`
2. Set the base URL to `http://localhost:3001/api`
3. Use the provided endpoints to test the API

## Production Deployment

### Option 1: Traditional Server Deployment

#### Server Requirements

- Node.js (v16.x or higher)
- npm (v7.x or higher)
- SQLite or another database (if switching from SQLite)
- Nginx (recommended for reverse proxy)
- PM2 (for process management)

#### Deployment Steps

1. Clone the repository on your server:
   ```bash
   git clone <repository-url>
   cd blackjack
   ```

2. Install dependencies and build the application:
   ```bash
   npm run install:all
   npm run build
   ```

3. Set up environment variables for production:
   
   **Backend (.env file in backend/ directory)**
   ```
   PORT=3001
   DB_PATH=/path/to/production/database.sqlite
   JWT_SECRET=your-secure-production-secret
   NODE_ENV=production
   ```

4. Set up PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start backend/dist/server.js --name blackjack
   pm2 save
   pm2 startup
   ```

5. Configure Nginx as a reverse proxy:
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;

     location / {
       proxy_pass http://localhost:3001;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

6. Set up SSL with Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Option 2: Docker Deployment

#### Prerequisites

- Docker
- Docker Compose

#### Deployment Steps

1. Create a `Dockerfile` in the project root:
   ```dockerfile
   FROM node:16-alpine as builder

   WORKDIR /app
   COPY package*.json ./
   COPY backend/package*.json ./backend/
   COPY frontend/package*.json ./frontend/

   RUN npm run install:all

   COPY . .
   RUN npm run build

   FROM node:16-alpine

   WORKDIR /app
   COPY --from=builder /app/backend/dist ./backend/dist
   COPY --from=builder /app/frontend/dist ./frontend/dist
   COPY --from=builder /app/backend/package.json ./backend/
   COPY --from=builder /app/backend/node_modules ./backend/node_modules

   EXPOSE 3001

   CMD ["node", "backend/dist/server.js"]
   ```

2. Create a `docker-compose.yml` file:
   ```yaml
   version: '3'
   services:
     blackjack:
       build: .
       ports:
         - "3001:3001"
       environment:
         - PORT=3001
         - DB_PATH=/app/data/database.sqlite
         - JWT_SECRET=your-secure-production-secret
         - NODE_ENV=production
       volumes:
         - ./data:/app/data
   ```

3. Build and run the Docker container:
   ```bash
   docker-compose up -d
   ```

### Option 3: Cloud Deployment

#### Deploying to Heroku

1. Create a `Procfile` in the project root:
   ```
   web: node backend/dist/server.js
   ```

2. Add Heroku-specific scripts to the root `package.json`:
   ```json
   "scripts": {
     "heroku-postbuild": "npm run install:all && npm run build"
   }
   ```

3. Deploy to Heroku:
   ```bash
   heroku create blackjack-game
   git push heroku main
   ```

4. Set environment variables:
   ```bash
   heroku config:set JWT_SECRET=your-secure-production-secret
   heroku config:set NODE_ENV=production
   ```

#### Deploying to Vercel

1. Create a `vercel.json` file in the project root:
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "backend/dist/server.js", "use": "@vercel/node" },
       { "src": "frontend/dist/**", "use": "@vercel/static" }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "backend/dist/server.js" },
       { "src": "/(.*)", "dest": "frontend/dist/$1" }
     ]
   }
   ```

2. Deploy to Vercel:
   ```bash
   vercel
   ```

## CI/CD Pipeline

### GitHub Actions

Create a `.github/workflows/ci-cd.yml` file:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, development ]
  pull_request:
    branches: [ main, development ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      - name: Install dependencies
        run: npm run install:all
      - name: Run backend tests
        run: cd backend && npm test
      - name: Run frontend tests
        run: cd frontend && npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      - name: Install dependencies
        run: npm run install:all
      - name: Build
        run: npm run build
      - name: Upload backend artifact
        uses: actions/upload-artifact@v3
        with:
          name: backend-dist
          path: backend/dist
      - name: Upload frontend artifact
        uses: actions/upload-artifact@v3
        with:
          name: frontend-dist
          path: frontend/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v3
      - name: Download backend artifact
        uses: actions/download-artifact@v3
        with:
          name: backend-dist
          path: backend/dist
      - name: Download frontend artifact
        uses: actions/download-artifact@v3
        with:
          name: frontend-dist
          path: frontend/dist
      # Add deployment steps here based on your hosting provider
```

## Monitoring and Maintenance

### Logging

1. Set up application logging with Winston:
   ```bash
   cd backend
   npm install winston
   ```

2. Create a logger utility:
   ```javascript
   // backend/src/utils/logger.js
   import winston from 'winston';

   const logger = winston.createLogger({
     level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.json()
     ),
     transports: [
       new winston.transports.Console(),
       new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
       new winston.transports.File({ filename: 'logs/combined.log' })
     ]
   });

   export default logger;
   ```

### Database Backups

For SQLite database backups:

1. Create a backup script:
   ```javascript
   // scripts/backup-db.js
   const fs = require('fs');
   const path = require('path');
   const { exec } = require('child_process');

   const DB_PATH = process.env.DB_PATH || './database.sqlite';
   const BACKUP_DIR = path.join(__dirname, '../backups');

   // Create backup directory if it doesn't exist
   if (!fs.existsSync(BACKUP_DIR)) {
     fs.mkdirSync(BACKUP_DIR, { recursive: true });
   }

   const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
   const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}.sqlite`);

   // Copy the database file
   fs.copyFileSync(DB_PATH, backupPath);
   console.log(`Backup created at: ${backupPath}`);
   ```

2. Add a backup script to package.json:
   ```json
   "scripts": {
     "backup-db": "node scripts/backup-db.js"
   }
   ```

3. Set up a cron job for regular backups:
   ```bash
   crontab -e
   # Add this line to run daily backups at 2 AM
   0 2 * * * cd /path/to/blackjack && npm run backup-db
   ```

### Health Checks

1. Add a health check endpoint to the backend:
   ```javascript
   // backend/src/routes/index.js
   router.get('/health', (req, res) => {
     res.status(200).json({
       status: 'UP',
       timestamp: new Date(),
       uptime: process.uptime()
     });
   });
   ```

2. Set up uptime monitoring with a service like UptimeRobot or Pingdom.

## Troubleshooting

### Common Issues and Solutions

#### Backend Won't Start

1. Check if the port is already in use:
   ```bash
   lsof -i :3001
   ```
   
   Solution: Kill the process or change the port in the .env file.

2. Database connection issues:
   
   Solution: Verify the DB_PATH in the .env file and ensure the directory exists.

#### Frontend API Calls Failing

1. CORS issues:
   
   Solution: Verify the CORS configuration in the backend:
   ```javascript
   app.use(cors({
     origin: process.env.NODE_ENV === 'production' 
       ? 'https://your-domain.com' 
       : 'http://localhost:3000'
   }));
   ```

2. API URL misconfiguration:
   
   Solution: Check the VITE_API_URL in the frontend .env file.

#### Database Migration Issues

1. SQLite file permission problems:
   
   Solution: Check file permissions and ownership:
   ```bash
   chmod 644 database.sqlite
   ```

#### Authentication Problems

1. JWT token issues:
   
   Solution: Verify the JWT_SECRET is consistent and check token expiration settings.

### Debugging Tips

1. Enable verbose logging in development:
   ```javascript
   // backend/src/utils/logger.js
   if (process.env.NODE_ENV !== 'production') {
     logger.add(new winston.transports.Console({
       format: winston.format.combine(
         winston.format.colorize(),
         winston.format.simple()
       )
     }));
   }
   ```

2. Use React Developer Tools for frontend debugging.

3. Check browser console for frontend errors.

4. Use Postman or Insomnia to test API endpoints directly.