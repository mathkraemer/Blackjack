# Backend Implementation Plan

## Overview

This document outlines the step-by-step implementation plan for the Blackjack game backend services. The backend will be built using Node.js with Express, using Vite for development tooling, and SQLite with Sequelize ORM for data persistence.

## Project Setup

1. Initialize the backend project:
   ```bash
   mkdir -p backend
   cd backend
   npm init -y
   npm install express sequelize sqlite3 bcrypt jsonwebtoken cors dotenv
   npm install --save-dev vite @vitejs/plugin-node nodemon
   ```

2. Create the basic directory structure:
   ```bash
   mkdir -p src/controllers src/models src/routes src/services src/middleware src/utils
   ```

3. Configure Vite for Node.js development:
   ```javascript
   // vite.config.js
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

4. Create the main server file:
   ```javascript
   // server.js
   import express from 'express';
   import cors from 'cors';
   import dotenv from 'dotenv';
   import routes from './src/routes';
   import { sequelize } from './src/models';

   dotenv.config();

   const app = express();
   const PORT = process.env.PORT || 3001;

   // Middleware
   app.use(cors());
   app.use(express.json());

   // Routes
   app.use('/api', routes);

   // Database sync and server start
   sequelize.sync().then(() => {
     app.listen(PORT, () => {
       console.log(`Server running on port ${PORT}`);
     });
   });

   export default app;
## Database Models Implementation

1. Create the database connection:
   ```javascript
   // src/models/index.js
   import { Sequelize } from 'sequelize';
   import dotenv from 'dotenv';

   dotenv.config();

   const sequelize = new Sequelize({
     dialect: 'sqlite',
     storage: process.env.DB_PATH || './database.sqlite',
     logging: false
   });

   export { sequelize };
   export * from './User';
   export * from './Game';
   export * from './UserStats';
   ```

2. Implement the User model:
   ```javascript
   // src/models/User.js
   import { DataTypes } from 'sequelize';
   import { sequelize } from './index';
   import bcrypt from 'bcrypt';

   const User = sequelize.define('User', {
     id: {
       type: DataTypes.INTEGER,
       primaryKey: true,
       autoIncrement: true
     },
     username: {
       type: DataTypes.STRING(50),
       allowNull: false,
       unique: true
     },
     email: {
       type: DataTypes.STRING(100),
       allowNull: false,
       unique: true,
       validate: {
         isEmail: true
       }
     },
     password_hash: {
       type: DataTypes.STRING(255),
       allowNull: false
     }
   }, {
     timestamps: true,
     createdAt: 'created_at',
     updatedAt: 'updated_at',
     hooks: {
       beforeCreate: async (user) => {
         const salt = await bcrypt.genSalt(10);
         user.password_hash = await bcrypt.hash(user.password_hash, salt);
       }
     }
   });

   User.prototype.validatePassword = async function(password) {
     return bcrypt.compare(password, this.password_hash);
   };

   export { User };
   ```

3. Implement the Game model:
   ```javascript
   // src/models/Game.js
   import { DataTypes } from 'sequelize';
   import { sequelize } from './index';
   import { User } from './User';

   const Game = sequelize.define('Game', {
     id: {
       type: DataTypes.INTEGER,
       primaryKey: true,
       autoIncrement: true
     },
     user_id: {
       type: DataTypes.INTEGER,
       allowNull: false,
       references: {
         model: User,
         key: 'id'
       }
     },
     player_hand: {
       type: DataTypes.JSON,
       allowNull: false
     },
     dealer_hand: {
       type: DataTypes.JSON,
       allowNull: false
     },
     player_score: {
       type: DataTypes.INTEGER,
       allowNull: false
     },
     dealer_score: {
       type: DataTypes.INTEGER,
       allowNull: false
     },
     result: {
       type: DataTypes.ENUM('win', 'loss', 'tie'),
       allowNull: false
     }
   }, {
     timestamps: true,
     createdAt: 'created_at',
     updatedAt: false
   });

   Game.belongsTo(User, { foreignKey: 'user_id' });
   User.hasMany(Game, { foreignKey: 'user_id' });

   export { Game };
   ```

4. Implement the UserStats model:
   ```javascript
   // src/models/UserStats.js
   import { DataTypes } from 'sequelize';
   import { sequelize } from './index';
   import { User } from './User';

   const UserStats = sequelize.define('UserStats', {
     id: {
       type: DataTypes.INTEGER,
       primaryKey: true,
       autoIncrement: true
     },
     user_id: {
       type: DataTypes.INTEGER,
       allowNull: false,
       unique: true,
       references: {
         model: User,
         key: 'id'
       }
     },
     total_games: {
       type: DataTypes.INTEGER,
       defaultValue: 0
     },
     wins: {
       type: DataTypes.INTEGER,
       defaultValue: 0
     },
     losses: {
       type: DataTypes.INTEGER,
       defaultValue: 0
     },
     ties: {
       type: DataTypes.INTEGER,
       defaultValue: 0
     },
     win_percentage: {
       type: DataTypes.DECIMAL(5, 2),
       defaultValue: 0.00
     }
   }, {
     timestamps: true,
     createdAt: false,
     updatedAt: 'updated_at'
   });

   UserStats.belongsTo(User, { foreignKey: 'user_id' });
   User.hasOne(UserStats, { foreignKey: 'user_id' });

   export { UserStats };
   ```
## Services Implementation

1. Create the Deck Service:
   ```javascript
   // src/services/DeckService.js
   class DeckService {
     constructor() {
       this.suits = ['hearts', 'diamonds', 'clubs', 'spades'];
       this.ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
     }

     createDeck() {
       const deck = [];
       for (const suit of this.suits) {
         for (const rank of this.ranks) {
           const value = this.getCardValue(rank);
           deck.push({ suit, rank, value });
         }
       }
       return this.shuffleDeck(deck);
     }

     shuffleDeck(deck) {
       const shuffled = [...deck];
       for (let i = shuffled.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
       }
       return shuffled;
     }

     getCardValue(rank) {
       if (rank === 'A') return 11; // Ace initially counts as 11
       if (['J', 'Q', 'K'].includes(rank)) return 10;
       return parseInt(rank);
     }

     dealCards(deck, count) {
       return deck.splice(0, count);
     }
   }

   export default new DeckService();
   ```

2. Create the Blackjack Service:
   ```javascript
   // src/services/BlackjackService.js
   import DeckService from './DeckService';

   class BlackjackService {
     constructor() {
       this.DEALER_STAND_THRESHOLD = 17;
     }

     startNewGame() {
       const deck = DeckService.createDeck();
       const playerHand = DeckService.dealCards(deck, 2);
       const dealerHand = DeckService.dealCards(deck, 2);
       
       return {
         deck,
         playerHand,
         dealerHand,
         playerScore: this.calculateHandScore(playerHand),
         dealerScore: this.calculateHandScore(dealerHand),
         isPlayerTurn: true,
         isGameOver: false,
         gameStatus: 'active'
       };
     }

     calculateHandScore(hand) {
       let score = 0;
       let aceCount = 0;
       
       // Sum all card values
       for (const card of hand) {
         score += card.value;
         if (card.rank === 'A') aceCount++;
       }
       
       // Adjust for aces if needed
       while (score > 21 && aceCount > 0) {
         score -= 10; // Convert an Ace from 11 to 1
         aceCount--;
       }
       
       return score;
     }

     playerHit(gameState) {
       const { deck, playerHand } = gameState;
       const newCard = DeckService.dealCards(deck, 1)[0];
       playerHand.push(newCard);
       
       const playerScore = this.calculateHandScore(playerHand);
       let isGameOver = false;
       let gameStatus = 'active';
       
       // Check if player busts
       if (playerScore > 21) {
         isGameOver = true;
         gameStatus = 'player_bust';
       }
       
       return {
         ...gameState,
         playerHand,
         playerScore,
         isGameOver,
         gameStatus
       };
     }

     playerStand(gameState) {
       let { deck, dealerHand, playerScore } = gameState;
       let dealerScore = this.calculateHandScore(dealerHand);
       let isGameOver = true;
       let gameStatus = 'active';
       
       // Dealer draws cards until reaching stand threshold
       while (dealerScore < this.DEALER_STAND_THRESHOLD) {
         const newCard = DeckService.dealCards(deck, 1)[0];
         dealerHand.push(newCard);
         dealerScore = this.calculateHandScore(dealerHand);
       }
       
       // Determine game outcome
       if (dealerScore > 21) {
         gameStatus = 'dealer_bust';
       } else if (dealerScore > playerScore) {
         gameStatus = 'dealer_win';
       } else if (playerScore > dealerScore) {
         gameStatus = 'player_win';
       } else {
         gameStatus = 'tie';
       }
       
       return {
         ...gameState,
         dealerHand,
         dealerScore,
         isPlayerTurn: false,
         isGameOver,
         gameStatus
       };
     }

     determineGameResult(gameStatus) {
       switch (gameStatus) {
         case 'player_bust':
         case 'dealer_win':
           return 'loss';
         case 'dealer_bust':
         case 'player_win':
           return 'win';
         case 'tie':
           return 'tie';
         default:
           return null; // Game not over yet
       }
     }
   }

   export default new BlackjackService();
   ```

3. Create the Game Service:
   ```javascript
   // src/services/GameService.js
   import { Game, UserStats } from '../models';
   import BlackjackService from './BlackjackService';
   import { sequelize } from '../models';

   class GameService {
     async createNewGame(userId) {
       const gameState = BlackjackService.startNewGame();
       
       // Store initial game state
       const game = await Game.create({
         user_id: userId,
         player_hand: gameState.playerHand,
         dealer_hand: gameState.dealerHand,
         player_score: gameState.playerScore,
         dealer_score: gameState.dealerScore,
         result: 'active' // Placeholder until game ends
       });
       
       return {
         gameId: game.id,
         ...gameState
       };
     }

     async getGameById(gameId, userId) {
       const game = await Game.findOne({
         where: {
           id: gameId,
           user_id: userId
         }
       });
       
       if (!game) {
         throw new Error('Game not found');
       }
       
       return {
         gameId: game.id,
         playerHand: game.player_hand,
         dealerHand: game.dealer_hand,
         playerScore: game.player_score,
         dealerScore: game.dealer_score,
         result: game.result
       };
     }

     async playerHit(gameId, userId, gameState) {
       const updatedState = BlackjackService.playerHit(gameState);
       
       // Update game in database if game is over
       if (updatedState.isGameOver) {
         await this.finalizeGame(gameId, userId, updatedState);
       }
       
       return updatedState;
     }

     async playerStand(gameId, userId, gameState) {
       const updatedState = BlackjackService.playerStand(gameState);
       
       // Game is always over after stand
       await this.finalizeGame(gameId, userId, updatedState);
       
       return updatedState;
     }

     async finalizeGame(gameId, userId, gameState) {
       const result = BlackjackService.determineGameResult(gameState.gameStatus);
       
       const transaction = await sequelize.transaction();
       
       try {
         // Update game record
         await Game.update({
           player_hand: gameState.playerHand,
           dealer_hand: gameState.dealerHand,
           player_score: gameState.playerScore,
           dealer_score: gameState.dealerScore,
           result
         }, {
           where: { id: gameId },
           transaction
         });
         
         // Update user stats
         const [userStats] = await UserStats.findOrCreate({
           where: { user_id: userId },
           defaults: {
             user_id: userId,
             total_games: 0,
             wins: 0,
             losses: 0,
             ties: 0,
             win_percentage: 0
           },
           transaction
         });
         
         userStats.total_games += 1;
         
         if (result === 'win') {
           userStats.wins += 1;
         } else if (result === 'loss') {
           userStats.losses += 1;
         } else {
           userStats.ties += 1;
         }
         
         userStats.win_percentage = (userStats.wins / userStats.total_games) * 100;
         
         await userStats.save({ transaction });
         
         await transaction.commit();
       } catch (error) {
         await transaction.rollback();
         throw error;
       }
     }

     async getUserGameHistory(userId, limit = 10, offset = 0) {
       return Game.findAndCountAll({
         where: { user_id: userId },
         order: [['created_at', 'DESC']],
         limit,
         offset
       });
     }
   }

   export default new GameService();
   ```

4. Create the User Service:
   ```javascript
   // src/services/UserService.js
   import { User, UserStats } from '../models';
   import jwt from 'jsonwebtoken';

   class UserService {
     async registerUser(username, email, password) {
       try {
         const user = await User.create({
           username,
           email,
           password_hash: password // Will be hashed by model hook
         });
         
         // Initialize user stats
         await UserStats.create({
           user_id: user.id
         });
         
         return this.generateUserResponse(user);
       } catch (error) {
         if (error.name === 'SequelizeUniqueConstraintError') {
           throw new Error('Username or email already exists');
         }
         throw error;
       }
     }

     async loginUser(email, password) {
       const user = await User.findOne({ where: { email } });
       
       if (!user) {
         throw new Error('User not found');
       }
       
       const isPasswordValid = await user.validatePassword(password);
       
       if (!isPasswordValid) {
         throw new Error('Invalid password');
       }
       
       return this.generateUserResponse(user);
     }

     async getUserProfile(userId) {
       const user = await User.findByPk(userId, {
         include: [{ model: UserStats }],
         attributes: { exclude: ['password_hash'] }
       });
       
       if (!user) {
         throw new Error('User not found');
       }
       
       return user;
     }

     generateUserResponse(user) {
       const token = jwt.sign(
         { id: user.id, username: user.username },
         process.env.JWT_SECRET || 'your-secret-key',
         { expiresIn: '24h' }
       );
       
       return {
         id: user.id,
         username: user.username,
         email: user.email,
         token
       };
     }
   }

   export default new UserService();
   ```
## Controllers Implementation

1. Create the Auth Controller:
   ```javascript
   // src/controllers/AuthController.js
   import UserService from '../services/UserService';

   class AuthController {
     async register(req, res) {
       try {
         const { username, email, password } = req.body;
         
         if (!username || !email || !password) {
           return res.status(400).json({
             success: false,
             error: {
               code: 'MISSING_FIELDS',
               message: 'Username, email and password are required'
             }
           });
         }
         
         const user = await UserService.registerUser(username, email, password);
         
         return res.status(201).json({
           success: true,
           data: user,
           message: 'User registered successfully'
         });
       } catch (error) {
         return res.status(400).json({
           success: false,
           error: {
             code: 'REGISTRATION_ERROR',
             message: error.message
           }
         });
       }
     }

     async login(req, res) {
       try {
         const { email, password } = req.body;
         
         if (!email || !password) {
           return res.status(400).json({
             success: false,
             error: {
               code: 'MISSING_FIELDS',
               message: 'Email and password are required'
             }
           });
         }
         
         const user = await UserService.loginUser(email, password);
         
         return res.status(200).json({
           success: true,
           data: user,
           message: 'Login successful'
         });
       } catch (error) {
         return res.status(401).json({
           success: false,
           error: {
             code: 'AUTHENTICATION_ERROR',
             message: error.message
           }
         });
       }
     }

     async getProfile(req, res) {
       try {
         const userId = req.user.id;
         const profile = await UserService.getUserProfile(userId);
         
         return res.status(200).json({
           success: true,
           data: profile,
           message: 'Profile retrieved successfully'
         });
       } catch (error) {
         return res.status(404).json({
           success: false,
           error: {
             code: 'PROFILE_ERROR',
             message: error.message
           }
         });
       }
     }

     logout(req, res) {
       // JWT tokens are stateless, so we just return success
       // In a real app, you might want to invalidate the token on the client side
       return res.status(200).json({
         success: true,
         message: 'Logged out successfully'
       });
     }
   }

   export default new AuthController();
   ```

2. Create the Game Controller:
   ```javascript
   // src/controllers/GameController.js
   import GameService from '../services/GameService';

   class GameController {
     async newGame(req, res) {
       try {
         const userId = req.user.id;
         const gameState = await GameService.createNewGame(userId);
         
         return res.status(201).json({
           success: true,
           data: gameState,
           message: 'New game started'
         });
       } catch (error) {
         return res.status(500).json({
           success: false,
           error: {
             code: 'GAME_CREATION_ERROR',
             message: error.message
           }
         });
       }
     }

     async getGame(req, res) {
       try {
         const { gameId } = req.params;
         const userId = req.user.id;
         
         const game = await GameService.getGameById(gameId, userId);
         
         return res.status(200).json({
           success: true,
           data: game,
           message: 'Game retrieved successfully'
         });
       } catch (error) {
         return res.status(404).json({
           success: false,
           error: {
             code: 'GAME_NOT_FOUND',
             message: error.message
           }
         });
       }
     }

     async hit(req, res) {
       try {
         const { gameId } = req.params;
         const userId = req.user.id;
         const { gameState } = req.body;
         
         if (!gameState) {
           return res.status(400).json({
             success: false,
             error: {
               code: 'MISSING_GAME_STATE',
               message: 'Game state is required'
             }
           });
         }
         
         const updatedState = await GameService.playerHit(gameId, userId, gameState);
         
         return res.status(200).json({
           success: true,
           data: updatedState,
           message: 'Player hit successfully'
         });
       } catch (error) {
         return res.status(400).json({
           success: false,
           error: {
             code: 'HIT_ERROR',
             message: error.message
           }
         });
       }
     }

     async stand(req, res) {
       try {
         const { gameId } = req.params;
         const userId = req.user.id;
         const { gameState } = req.body;
         
         if (!gameState) {
           return res.status(400).json({
             success: false,
             error: {
               code: 'MISSING_GAME_STATE',
               message: 'Game state is required'
             }
           });
         }
         
         const updatedState = await GameService.playerStand(gameId, userId, gameState);
         
         return res.status(200).json({
           success: true,
           data: updatedState,
           message: 'Player stand successfully'
         });
       } catch (error) {
         return res.status(400).json({
           success: false,
           error: {
             code: 'STAND_ERROR',
             message: error.message
           }
         });
       }
     }

     async getHistory(req, res) {
       try {
         const userId = req.user.id;
         const { limit = 10, offset = 0 } = req.query;
         
         const history = await GameService.getUserGameHistory(
           userId, 
           parseInt(limit), 
           parseInt(offset)
         );
         
         return res.status(200).json({
           success: true,
           data: history,
           message: 'Game history retrieved successfully'
         });
       } catch (error) {
         return res.status(500).json({
           success: false,
           error: {
             code: 'HISTORY_ERROR',
             message: error.message
           }
         });
       }
     }
   }

   export default new GameController();
   ```

3. Create the Stats Controller:
   ```javascript
   // src/controllers/StatsController.js
   import { UserStats, User } from '../models';

   class StatsController {
     async getUserStats(req, res) {
       try {
         const { userId } = req.params;
         
         const stats = await UserStats.findOne({
           where: { user_id: userId },
           include: [{
             model: User,
             attributes: ['username']
           }]
         });
         
         if (!stats) {
           return res.status(404).json({
             success: false,
             error: {
               code: 'STATS_NOT_FOUND',
               message: 'User stats not found'
             }
           });
         }
         
         return res.status(200).json({
           success: true,
           data: stats,
           message: 'User stats retrieved successfully'
         });
       } catch (error) {
         return res.status(500).json({
           success: false,
           error: {
             code: 'STATS_ERROR',
             message: error.message
           }
         });
       }
     }

     async getLeaderboard(req, res) {
       try {
         const { limit = 10 } = req.query;
         
         const leaderboard = await UserStats.findAll({
           order: [['win_percentage', 'DESC']],
           limit: parseInt(limit),
           include: [{
             model: User,
             attributes: ['username']
           }]
         });
         
         return res.status(200).json({
           success: true,
           data: leaderboard,
           message: 'Leaderboard retrieved successfully'
         });
       } catch (error) {
         return res.status(500).json({
           success: false,
           error: {
             code: 'LEADERBOARD_ERROR',
             message: error.message
           }
         });
       }
     }
   }

   export default new StatsController();
   ```

## Middleware Implementation

1. Create the Authentication Middleware:
   ```javascript
   // src/middleware/authMiddleware.js
   import jwt from 'jsonwebtoken';
   import { User } from '../models';

   export const authenticate = async (req, res, next) => {
     try {
       const authHeader = req.headers.authorization;
       
       if (!authHeader || !authHeader.startsWith('Bearer ')) {
         return res.status(401).json({
           success: false,
           error: {
             code: 'UNAUTHORIZED',
             message: 'Authentication token is required'
           }
         });
       }
       
       const token = authHeader.split(' ')[1];
       const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
       
       const user = await User.findByPk(decoded.id);
       
       if (!user) {
         return res.status(401).json({
           success: false,
           error: {
             code: 'INVALID_TOKEN',
             message: 'Invalid authentication token'
           }
         });
       }
       
       req.user = decoded;
       next();
     } catch (error) {
       return res.status(401).json({
         success: false,
         error: {
           code: 'AUTHENTICATION_ERROR',
           message: 'Authentication failed'
         }
       });
     }
   };
   ```

## Routes Implementation

1. Create the main routes file:
   ```javascript
   // src/routes/index.js
   import express from 'express';
   import authRoutes from './authRoutes';
   import gameRoutes from './gameRoutes';
   import statsRoutes from './statsRoutes';

   const router = express.Router();

   router.use('/auth', authRoutes);
   router.use('/game', gameRoutes);
   router.use('/stats', statsRoutes);

   export default router;
   ```

2. Create the authentication routes:
   ```javascript
   // src/routes/authRoutes.js
   import express from 'express';
   import AuthController from '../controllers/AuthController';
   import { authenticate } from '../middleware/authMiddleware';

   const router = express.Router();

   router.post('/register', AuthController.register);
   router.post('/login', AuthController.login);
   router.post('/logout', AuthController.logout);
   router.get('/profile', authenticate, AuthController.getProfile);

   export default router;
   ```

3. Create the game routes:
   ```javascript
   // src/routes/gameRoutes.js
   import express from 'express';
   import GameController from '../controllers/GameController';
   import { authenticate } from '../middleware/authMiddleware';

   const router = express.Router();

   // Apply authentication middleware to all game routes
   router.use(authenticate);

   router.post('/new', GameController.newGame);
   router.get('/:gameId', GameController.getGame);
   router.post('/:gameId/hit', GameController.hit);
   router.post('/:gameId/stand', GameController.stand);
   router.get('/history', GameController.getHistory);

   export default router;
   ```

4. Create the stats routes:
   ```javascript
   // src/routes/statsRoutes.js
   import express from 'express';
   import StatsController from '../controllers/StatsController';
   import { authenticate } from '../middleware/authMiddleware';

   const router = express.Router();

   // Apply authentication middleware to all stats routes
   router.use(authenticate);

   router.get('/user/:userId', StatsController.getUserStats);
   router.get('/leaderboard', StatsController.getLeaderboard);

   export default router;
   ```

## Utility Functions

1. Create error handling utilities:
   ```javascript
   // src/utils/errorHandler.js
   export class AppError extends Error {
     constructor(code, message, statusCode) {
       super(message);
       this.code = code;
       this.statusCode = statusCode;
     }
   }

   export const catchAsync = (fn) => {
     return (req, res, next) => {
       fn(req, res, next).catch(next);
     };
   };

   export const errorHandler = (err, req, res, next) => {
     const statusCode = err.statusCode || 500;
     const code = err.code || 'SERVER_ERROR';
     const message = err.message || 'Something went wrong';
     
     res.status(statusCode).json({
       success: false,
       error: {
         code,
         message
       }
     });
   };
   ```

2. Create validation utilities:
   ```javascript
   // src/utils/validation.js
   export const validateEmail = (email) => {
     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     return re.test(email);
   };

   export const validatePassword = (password) => {
     // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
     const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
     return re.test(password);
   };
   ```

## Environment Configuration

1. Create a sample .env file:
   ```
   # .env.example
   PORT=3001
   DB_PATH=./database.sqlite
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

2. Create a .gitignore file:
   ```
   # .gitignore
   node_modules/
   .env
   *.sqlite
   dist/
   ```

## Scripts Configuration

1. Update package.json scripts:
   ```json
   "scripts": {
     "dev": "vite",
     "build": "vite build",
     "start": "node dist/server.js",
     "db:migrate": "node scripts/migrate.js"
   }
   ```

2. Create a database migration script:
   ```javascript
   // scripts/migrate.js
   import { sequelize } from '../src/models';

   async function migrate() {
     try {
       await sequelize.sync({ force: true });
       console.log('Database migrated successfully');
       process.exit(0);
     } catch (error) {
       console.error('Migration failed:', error);
       process.exit(1);
     }
   }

   migrate();
   ```