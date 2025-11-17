# Frontend Implementation Plan

## Overview

This document outlines the step-by-step implementation plan for the Blackjack game frontend. The frontend will be built using React with Vite as the build tool, focusing on a clean, responsive user interface that communicates with the backend via REST API.

## Project Setup

1. Initialize the frontend project:
   ```bash
   mkdir -p frontend
   cd frontend
   npm create vite@latest . -- --template react
   npm install axios react-router-dom
   ```

2. Create the basic directory structure:
   ```bash
   mkdir -p src/components src/hooks src/services src/styles src/utils src/pages src/assets
   ```

3. Configure environment variables:
   ```javascript
   // .env.development
   VITE_API_URL=http://localhost:3001/api
   ```

4. Set up the main entry point:
   ```javascript
   // src/main.jsx
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import { BrowserRouter } from 'react-router-dom';
   import App from './App';
   import './styles/index.css';

   ReactDOM.createRoot(document.getElementById('root')).render(
     <React.StrictMode>
       <BrowserRouter>
         <App />
       </BrowserRouter>
     </React.StrictMode>
   );
   ```

5. Create the App component with routing:
   ```javascript
   // src/App.jsx
   import { Routes, Route, Navigate } from 'react-router-dom';
   import { useState, useEffect } from 'react';
   import Login from './pages/Login';
   import Register from './pages/Register';
   import GameBoard from './pages/GameBoard';
   import UserProfile from './pages/UserProfile';
   import GameHistory from './pages/GameHistory';
   import NotFound from './pages/NotFound';
   import ProtectedRoute from './components/ProtectedRoute';
   import { AuthProvider } from './context/AuthContext';
   import './styles/App.css';

   function App() {
     return (
       <AuthProvider>
         <div className="app">
           <Routes>
             <Route path="/login" element={<Login />} />
             <Route path="/register" element={<Register />} />
             <Route path="/" element={<Navigate to="/game" />} />
             <Route 
               path="/game" 
               element={
                 <ProtectedRoute>
                   <GameBoard />
                 </ProtectedRoute>
               } 
             />
             <Route 
               path="/profile" 
               element={
                 <ProtectedRoute>
                   <UserProfile />
                 </ProtectedRoute>
               } 
             />
             <Route 
               path="/history" 
               element={
                 <ProtectedRoute>
                   <GameHistory />
                 </ProtectedRoute>
               } 
             />
             <Route path="*" element={<NotFound />} />
           </Routes>
         </div>
       </AuthProvider>
     );
   }

   export default App;
## Authentication Context

1. Create an authentication context:
   ```javascript
   // src/context/AuthContext.jsx
   import { createContext, useState, useEffect, useContext } from 'react';
   import { useNavigate } from 'react-router-dom';
   import authService from '../services/authService';

   const AuthContext = createContext();

   export const useAuth = () => useContext(AuthContext);

   export const AuthProvider = ({ children }) => {
     const [user, setUser] = useState(null);
     const [loading, setLoading] = useState(true);
     const navigate = useNavigate();

     useEffect(() => {
       // Check if user is already logged in
       const token = localStorage.getItem('token');
       const userData = localStorage.getItem('user');
       
       if (token && userData) {
         setUser(JSON.parse(userData));
       }
       
       setLoading(false);
     }, []);

     const login = async (email, password) => {
       try {
         const response = await authService.login(email, password);
         const { token, ...userData } = response.data;
         
         localStorage.setItem('token', token);
         localStorage.setItem('user', JSON.stringify(userData));
         
         setUser(userData);
         return { success: true };
       } catch (error) {
         return { 
           success: false, 
           message: error.response?.data?.error?.message || 'Login failed' 
         };
       }
     };

     const register = async (username, email, password) => {
       try {
         const response = await authService.register(username, email, password);
         const { token, ...userData } = response.data;
         
         localStorage.setItem('token', token);
         localStorage.setItem('user', JSON.stringify(userData));
         
         setUser(userData);
         return { success: true };
       } catch (error) {
         return { 
           success: false, 
           message: error.response?.data?.error?.message || 'Registration failed' 
         };
       }
     };

     const logout = () => {
       localStorage.removeItem('token');
       localStorage.removeItem('user');
       setUser(null);
       navigate('/login');
     };

     const value = {
       user,
       loading,
       login,
       register,
       logout,
       isAuthenticated: !!user
     };

     return (
       <AuthContext.Provider value={value}>
         {children}
       </AuthContext.Provider>
     );
   };
   ```

2. Create a protected route component:
   ```javascript
   // src/components/ProtectedRoute.jsx
   import { Navigate } from 'react-router-dom';
   import { useAuth } from '../context/AuthContext';

   const ProtectedRoute = ({ children }) => {
     const { isAuthenticated, loading } = useAuth();

     if (loading) {
       return <div>Loading...</div>;
     }

     if (!isAuthenticated) {
       return <Navigate to="/login" />;
     }

     return children;
   };

   export default ProtectedRoute;
   ```
## API Services

1. Create an API client:
   ```javascript
   // src/services/apiClient.js
   import axios from 'axios';

   const apiClient = axios.create({
     baseURL: import.meta.env.VITE_API_URL,
     headers: {
       'Content-Type': 'application/json'
     }
   });

   // Add a request interceptor to include the auth token
   apiClient.interceptors.request.use(
     (config) => {
       const token = localStorage.getItem('token');
       if (token) {
         config.headers.Authorization = `Bearer ${token}`;
       }
       return config;
     },
     (error) => {
       return Promise.reject(error);
     }
   );

   // Add a response interceptor to handle errors
   apiClient.interceptors.response.use(
     (response) => {
       return response.data;
     },
     (error) => {
       // Handle 401 Unauthorized errors
       if (error.response && error.response.status === 401) {
         localStorage.removeItem('token');
         localStorage.removeItem('user');
         window.location.href = '/login';
       }
       return Promise.reject(error);
     }
   );

   export default apiClient;
   ```

2. Create authentication service:
   ```javascript
   // src/services/authService.js
   import apiClient from './apiClient';

   const authService = {
     register: async (username, email, password) => {
       return apiClient.post('/auth/register', { username, email, password });
     },
     
     login: async (email, password) => {
       return apiClient.post('/auth/login', { email, password });
     },
     
     logout: async () => {
       return apiClient.post('/auth/logout');
     },
     
     getProfile: async () => {
       return apiClient.get('/auth/profile');
     }
   };

   export default authService;
   ```

3. Create game service:
   ```javascript
   // src/services/gameService.js
   import apiClient from './apiClient';

   const gameService = {
     newGame: async () => {
       return apiClient.post('/game/new');
     },
     
     getGame: async (gameId) => {
       return apiClient.get(`/game/${gameId}`);
     },
     
     hit: async (gameId, gameState) => {
       return apiClient.post(`/game/${gameId}/hit`, { gameState });
     },
     
     stand: async (gameId, gameState) => {
       return apiClient.post(`/game/${gameId}/stand`, { gameState });
     },
     
     getHistory: async (limit = 10, offset = 0) => {
       return apiClient.get(`/game/history?limit=${limit}&offset=${offset}`);
     }
   };

   export default gameService;
   ```

4. Create stats service:
   ```javascript
   // src/services/statsService.js
   import apiClient from './apiClient';

   const statsService = {
     getUserStats: async (userId) => {
       return apiClient.get(`/stats/user/${userId}`);
     },
     
     getLeaderboard: async (limit = 10) => {
       return apiClient.get(`/stats/leaderboard?limit=${limit}`);
     }
   };

   export default statsService;
   ```
## Custom Hooks

1. Create a game hook:
   ```javascript
   // src/hooks/useGame.js
   import { useState, useCallback } from 'react';
   import gameService from '../services/gameService';

   export const useGame = () => {
     const [gameState, setGameState] = useState(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState(null);

     const startNewGame = useCallback(async () => {
       setLoading(true);
       setError(null);
       
       try {
         const response = await gameService.newGame();
         setGameState(response.data);
         return response.data;
       } catch (err) {
         setError(err.response?.data?.error?.message || 'Failed to start new game');
         return null;
       } finally {
         setLoading(false);
       }
     }, []);

     const hit = useCallback(async () => {
       if (!gameState || !gameState.gameId) {
         setError('No active game');
         return null;
       }
       
       setLoading(true);
       setError(null);
       
       try {
         const response = await gameService.hit(gameState.gameId, gameState);
         setGameState(response.data);
         return response.data;
       } catch (err) {
         setError(err.response?.data?.error?.message || 'Failed to hit');
         return null;
       } finally {
         setLoading(false);
       }
     }, [gameState]);

     const stand = useCallback(async () => {
       if (!gameState || !gameState.gameId) {
         setError('No active game');
         return null;
       }
       
       setLoading(true);
       setError(null);
       
       try {
         const response = await gameService.stand(gameState.gameId, gameState);
         setGameState(response.data);
         return response.data;
       } catch (err) {
         setError(err.response?.data?.error?.message || 'Failed to stand');
         return null;
       } finally {
         setLoading(false);
       }
     }, [gameState]);

     return {
       gameState,
       loading,
       error,
       startNewGame,
       hit,
       stand,
       setGameState
     };
   };
   ```
## UI Components

1. Create a Card component:
   ```javascript
   // src/components/Card.jsx
   import React from 'react';
   import '../styles/Card.css';

   const Card = ({ card, hidden = false }) => {
     if (hidden) {
       return <div className="card card-back"></div>;
     }

     const { suit, rank } = card;
     const isRed = suit === 'hearts' || suit === 'diamonds';
     
     return (
       <div className={`card ${isRed ? 'card-red' : 'card-black'}`}>
         <div className="card-corner top-left">
           <div className="card-rank">{rank}</div>
           <div className="card-suit">{getSuitSymbol(suit)}</div>
         </div>
         <div className="card-center">{getSuitSymbol(suit)}</div>
         <div className="card-corner bottom-right">
           <div className="card-rank">{rank}</div>
           <div className="card-suit">{getSuitSymbol(suit)}</div>
         </div>
       </div>
     );
   };

   const getSuitSymbol = (suit) => {
     switch (suit) {
       case 'hearts': return '♥';
       case 'diamonds': return '♦';
       case 'clubs': return '♣';
       case 'spades': return '♠';
       default: return '';
     }
   };

   export default Card;
   ```

2. Create a Hand component:
   ```javascript
   // src/components/Hand.jsx
   import React from 'react';
   import Card from './Card';
   import '../styles/Hand.css';

   const Hand = ({ cards, score, hideFirstCard = false }) => {
     return (
       <div className="hand">
         <div className="cards">
           {cards.map((card, index) => (
             <Card 
               key={`${card.suit}-${card.rank}-${index}`} 
               card={card} 
               hidden={hideFirstCard && index === 0} 
             />
           ))}
         </div>
         {score !== undefined && <div className="score">Score: {score}</div>}
       </div>
     );
   };

   export default Hand;
   ```

3. Create a GameControls component:
   ```javascript
   // src/components/GameControls.jsx
   import React from 'react';
   import '../styles/GameControls.css';

   const GameControls = ({ onHit, onStand, onNewGame, isGameOver, isPlayerTurn }) => {
     return (
       <div className="game-controls">
         {isGameOver ? (
           <button 
             className="btn btn-primary" 
             onClick={onNewGame}
           >
             New Game
           </button>
         ) : (
           <>
             <button 
               className="btn btn-success" 
               onClick={onHit} 
               disabled={!isPlayerTurn}
             >
               Hit
             </button>
             <button 
               className="btn btn-danger" 
               onClick={onStand} 
               disabled={!isPlayerTurn}
             >
               Stand
             </button>
           </>
         )}
       </div>
     );
   };

   export default GameControls;
   ```

4. Create a GameResult component:
   ```javascript
   // src/components/GameResult.jsx
   import React from 'react';
   import '../styles/GameResult.css';

   const GameResult = ({ gameStatus }) => {
     if (!gameStatus || gameStatus === 'active') {
       return null;
     }

     let message = '';
     let resultClass = '';

     switch (gameStatus) {
       case 'player_bust':
         message = 'Bust! You went over 21.';
         resultClass = 'result-lose';
         break;
       case 'dealer_bust':
         message = 'Dealer busts! You win!';
         resultClass = 'result-win';
         break;
       case 'player_win':
         message = 'You win!';
         resultClass = 'result-win';
         break;
       case 'dealer_win':
         message = 'Dealer wins.';
         resultClass = 'result-lose';
         break;
       case 'tie':
         message = "It's a tie!";
         resultClass = 'result-tie';
         break;
       default:
         return null;
     }

     return (
       <div className={`game-result ${resultClass}`}>
         <h2>{message}</h2>
       </div>
     );
   };

   export default GameResult;
   ```

5. Create a Header component:
   ```javascript
   // src/components/Header.jsx
   import React from 'react';
   import { Link } from 'react-router-dom';
   import { useAuth } from '../context/AuthContext';
   import '../styles/Header.css';

   const Header = () => {
     const { user, logout, isAuthenticated } = useAuth();

     return (
       <header className="header">
         <div className="logo">
           <Link to="/">Blackjack</Link>
         </div>
         <nav className="nav">
           {isAuthenticated ? (
             <>
               <Link to="/game">Play</Link>
               <Link to="/profile">Profile</Link>
               <Link to="/history">History</Link>
               <button onClick={logout} className="btn-link">Logout</button>
               <span className="username">Hello, {user.username}</span>
             </>
           ) : (
             <>
               <Link to="/login">Login</Link>
               <Link to="/register">Register</Link>
             </>
           )}
         </nav>
       </header>
     );
   };

   export default Header;
   ```
## Page Components

1. Create the Login page:
   ```javascript
   // src/pages/Login.jsx
   import React, { useState } from 'react';
   import { useNavigate, Link } from 'react-router-dom';
   import { useAuth } from '../context/AuthContext';
   import '../styles/Auth.css';

   const Login = () => {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState('');
     const [loading, setLoading] = useState(false);
     const { login } = useAuth();
     const navigate = useNavigate();

     const handleSubmit = async (e) => {
       e.preventDefault();
       setError('');
       setLoading(true);
       
       if (!email || !password) {
         setError('Please enter both email and password');
         setLoading(false);
         return;
       }
       
       const result = await login(email, password);
       
       if (result.success) {
         navigate('/game');
       } else {
         setError(result.message);
       }
       
       setLoading(false);
     };

     return (
       <div className="auth-container">
         <div className="auth-card">
           <h2>Login</h2>
           {error && <div className="error-message">{error}</div>}
           <form onSubmit={handleSubmit}>
             <div className="form-group">
               <label htmlFor="email">Email</label>
               <input
                 type="email"
                 id="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
               />
             </div>
             <div className="form-group">
               <label htmlFor="password">Password</label>
               <input
                 type="password"
                 id="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
               />
             </div>
             <button 
               type="submit" 
               className="btn btn-primary" 
               disabled={loading}
             >
               {loading ? 'Logging in...' : 'Login'}
             </button>
           </form>
           <p className="auth-link">
             Don't have an account? <Link to="/register">Register</Link>
           </p>
         </div>
       </div>
     );
   };

   export default Login;
   ```

2. Create the Register page:
   ```javascript
   // src/pages/Register.jsx
   import React, { useState } from 'react';
   import { useNavigate, Link } from 'react-router-dom';
   import { useAuth } from '../context/AuthContext';
   import '../styles/Auth.css';

   const Register = () => {
     const [username, setUsername] = useState('');
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [confirmPassword, setConfirmPassword] = useState('');
     const [error, setError] = useState('');
     const [loading, setLoading] = useState(false);
     const { register } = useAuth();
     const navigate = useNavigate();

     const handleSubmit = async (e) => {
       e.preventDefault();
       setError('');
       setLoading(true);
       
       if (!username || !email || !password) {
         setError('Please fill in all fields');
         setLoading(false);
         return;
       }
       
       if (password !== confirmPassword) {
         setError('Passwords do not match');
         setLoading(false);
         return;
       }
       
       const result = await register(username, email, password);
       
       if (result.success) {
         navigate('/game');
       } else {
         setError(result.message);
       }
       
       setLoading(false);
     };

     return (
       <div className="auth-container">
         <div className="auth-card">
           <h2>Register</h2>
           {error && <div className="error-message">{error}</div>}
           <form onSubmit={handleSubmit}>
             <div className="form-group">
               <label htmlFor="username">Username</label>
               <input
                 type="text"
                 id="username"
                 value={username}
                 onChange={(e) => setUsername(e.target.value)}
                 required
               />
             </div>
             <div className="form-group">
               <label htmlFor="email">Email</label>
               <input
                 type="email"
                 id="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
               />
             </div>
             <div className="form-group">
               <label htmlFor="password">Password</label>
               <input
                 type="password"
                 id="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
               />
             </div>
             <div className="form-group">
               <label htmlFor="confirmPassword">Confirm Password</label>
               <input
                 type="password"
                 id="confirmPassword"
                 value={confirmPassword}
                 onChange={(e) => setConfirmPassword(e.target.value)}
                 required
               />
             </div>
             <button 
               type="submit" 
               className="btn btn-primary" 
               disabled={loading}
             >
               {loading ? 'Registering...' : 'Register'}
             </button>
           </form>
           <p className="auth-link">
             Already have an account? <Link to="/login">Login</Link>
           </p>
         </div>
       </div>
     );
   };

   export default Register;
   ```

3. Create the GameBoard page:
   ```javascript
   // src/pages/GameBoard.jsx
   import React, { useEffect } from 'react';
   import Header from '../components/Header';
   import Hand from '../components/Hand';
   import GameControls from '../components/GameControls';
   import GameResult from '../components/GameResult';
   import { useGame } from '../hooks/useGame';
   import '../styles/GameBoard.css';

   const GameBoard = () => {
     const { 
       gameState, 
       loading, 
       error, 
       startNewGame, 
       hit, 
       stand 
     } = useGame();

     useEffect(() => {
       if (!gameState) {
         startNewGame();
       }
     }, [gameState, startNewGame]);

     if (loading && !gameState) {
       return <div className="loading">Loading game...</div>;
     }

     if (error) {
       return <div className="error">{error}</div>;
     }

     if (!gameState) {
       return <div className="loading">Starting new game...</div>;
     }

     const { 
       playerHand, 
       dealerHand, 
       playerScore, 
       dealerScore, 
       isPlayerTurn, 
       isGameOver,
       gameStatus 
     } = gameState;

     // Only show dealer's score if game is over
     const displayDealerScore = isGameOver ? dealerScore : undefined;

     return (
       <div className="game-board">
         <Header />
         <div className="game-container">
           <h2>Dealer's Hand</h2>
           <Hand 
             cards={dealerHand} 
             score={displayDealerScore} 
             hideFirstCard={!isGameOver} 
           />
           
           <GameResult gameStatus={gameStatus} />
           
           <h2>Your Hand</h2>
           <Hand cards={playerHand} score={playerScore} />
           
           <GameControls 
             onHit={hit} 
             onStand={stand} 
             onNewGame={startNewGame} 
             isGameOver={isGameOver} 
             isPlayerTurn={isPlayerTurn} 
           />
         </div>
       </div>
     );
   };

   export default GameBoard;
   ```
4. Create the UserProfile page:
   ```javascript
   // src/pages/UserProfile.jsx
   import React, { useState, useEffect } from 'react';
   import Header from '../components/Header';
   import { useAuth } from '../context/AuthContext';
   import statsService from '../services/statsService';
   import '../styles/UserProfile.css';

   const UserProfile = () => {
     const { user } = useAuth();
     const [stats, setStats] = useState(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);

     useEffect(() => {
       const fetchStats = async () => {
         try {
           const response = await statsService.getUserStats(user.id);
           setStats(response.data);
         } catch (err) {
           setError('Failed to load user statistics');
         } finally {
           setLoading(false);
         }
       };

       fetchStats();
     }, [user.id]);

     if (loading) {
       return (
         <div className="profile-page">
           <Header />
           <div className="loading">Loading profile...</div>
         </div>
       );
     }

     if (error) {
       return (
         <div className="profile-page">
           <Header />
           <div className="error">{error}</div>
         </div>
       );
     }

     return (
       <div className="profile-page">
         <Header />
         <div className="profile-container">
           <h2>User Profile</h2>
           <div className="profile-info">
             <p><strong>Username:</strong> {user.username}</p>
             <p><strong>Email:</strong> {user.email}</p>
           </div>
           
           <h3>Game Statistics</h3>
           {stats ? (
             <div className="stats-container">
               <div className="stat-card">
                 <h4>Total Games</h4>
                 <p className="stat-value">{stats.total_games}</p>
               </div>
               <div className="stat-card">
                 <h4>Wins</h4>
                 <p className="stat-value">{stats.wins}</p>
               </div>
               <div className="stat-card">
                 <h4>Losses</h4>
                 <p className="stat-value">{stats.losses}</p>
               </div>
               <div className="stat-card">
                 <h4>Ties</h4>
                 <p className="stat-value">{stats.ties}</p>
               </div>
               <div className="stat-card">
                 <h4>Win Rate</h4>
                 <p className="stat-value">{stats.win_percentage}%</p>
               </div>
             </div>
           ) : (
             <p>No statistics available</p>
           )}
         </div>
       </div>
     );
   };

   export default UserProfile;
   ```

5. Create the GameHistory page:
   ```javascript
   // src/pages/GameHistory.jsx
   import React, { useState, useEffect } from 'react';
   import Header from '../components/Header';
   import gameService from '../services/gameService';
   import '../styles/GameHistory.css';

   const GameHistory = () => {
     const [history, setHistory] = useState([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const [page, setPage] = useState(0);
     const [hasMore, setHasMore] = useState(true);
     const limit = 10;

     const fetchHistory = async (pageNum) => {
       try {
         setLoading(true);
         const offset = pageNum * limit;
         const response = await gameService.getHistory(limit, offset);
         
         const { rows, count } = response.data;
         
         if (pageNum === 0) {
           setHistory(rows);
         } else {
           setHistory(prev => [...prev, ...rows]);
         }
         
         setHasMore(offset + rows.length < count);
       } catch (err) {
         setError('Failed to load game history');
       } finally {
         setLoading(false);
       }
     };

     useEffect(() => {
       fetchHistory(0);
     }, []);

     const loadMore = () => {
       const nextPage = page + 1;
       setPage(nextPage);
       fetchHistory(nextPage);
     };

     const formatDate = (dateString) => {
       const date = new Date(dateString);
       return date.toLocaleString();
     };

     const getResultClass = (result) => {
       switch (result) {
         case 'win': return 'result-win';
         case 'loss': return 'result-loss';
         case 'tie': return 'result-tie';
         default: return '';
       }
     };

     if (loading && history.length === 0) {
       return (
         <div className="history-page">
           <Header />
           <div className="loading">Loading history...</div>
         </div>
       );
     }

     if (error && history.length === 0) {
       return (
         <div className="history-page">
           <Header />
           <div className="error">{error}</div>
         </div>
       );
     }

     return (
       <div className="history-page">
         <Header />
         <div className="history-container">
           <h2>Game History</h2>
           
           {history.length === 0 ? (
             <p>No games played yet</p>
           ) : (
             <>
               <table className="history-table">
                 <thead>
                   <tr>
                     <th>Date</th>
                     <th>Your Score</th>
                     <th>Dealer Score</th>
                     <th>Result</th>
                   </tr>
                 </thead>
                 <tbody>
                   {history.map((game) => (
                     <tr key={game.id}>
                       <td>{formatDate(game.created_at)}</td>
                       <td>{game.player_score}</td>
                       <td>{game.dealer_score}</td>
                       <td className={getResultClass(game.result)}>
                         {game.result.charAt(0).toUpperCase() + game.result.slice(1)}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
               
               {hasMore && (
                 <button 
                   className="btn btn-secondary load-more" 
                   onClick={loadMore}
                   disabled={loading}
                 >
                   {loading ? 'Loading...' : 'Load More'}
                 </button>
               )}
             </>
           )}
         </div>
       </div>
     );
   };

   export default GameHistory;
   ```

6. Create the NotFound page:
   ```javascript
   // src/pages/NotFound.jsx
   import React from 'react';
   import { Link } from 'react-router-dom';
   import '../styles/NotFound.css';

   const NotFound = () => {
     return (
       <div className="not-found">
         <h1>404</h1>
         <h2>Page Not Found</h2>
         <p>The page you are looking for does not exist.</p>
         <Link to="/" className="btn btn-primary">
           Go Home
         </Link>
       </div>
     );
   };

   export default NotFound;
   ```

## CSS Styles

1. Create base styles:
   ```css
   /* src/styles/index.css */
   :root {
     --primary-color: #2c3e50;
     --secondary-color: #3498db;
     --accent-color: #e74c3c;
     --background-color: #ecf0f1;
     --text-color: #2c3e50;
     --card-color: #ffffff;
     --success-color: #2ecc71;
     --danger-color: #e74c3c;
     --warning-color: #f39c12;
     --info-color: #3498db;
   }

   * {
     box-sizing: border-box;
     margin: 0;
     padding: 0;
   }

   body {
     font-family: 'Roboto', sans-serif;
     background-color: var(--background-color);
     color: var(--text-color);
     line-height: 1.6;
   }

   .container {
     max-width: 1200px;
     margin: 0 auto;
     padding: 0 20px;
   }

   .btn {
     display: inline-block;
     padding: 10px 20px;
     border: none;
     border-radius: 4px;
     cursor: pointer;
     font-size: 16px;
     transition: background-color 0.3s, transform 0.1s;
   }

   .btn:hover {
     transform: translateY(-2px);
   }

   .btn:active {
     transform: translateY(0);
   }

   .btn:disabled {
     opacity: 0.7;
     cursor: not-allowed;
   }

   .btn-primary {
     background-color: var(--secondary-color);
     color: white;
   }

   .btn-success {
     background-color: var(--success-color);
     color: white;
   }

   .btn-danger {
     background-color: var(--danger-color);
     color: white;
   }

   .btn-secondary {
     background-color: var(--primary-color);
     color: white;
   }

   .loading {
     display: flex;
     justify-content: center;
     align-items: center;
     height: 100px;
     font-size: 18px;
     color: var(--secondary-color);
   }

   .error {
     padding: 15px;
     background-color: var(--danger-color);
     color: white;
     border-radius: 4px;
     margin: 20px 0;
   }
   ```

2. Create App styles:
   ```css
   /* src/styles/App.css */
   .app {
     min-height: 100vh;
     display: flex;
     flex-direction: column;
   }
   ```

3. Create Card styles:
   ```css
   /* src/styles/Card.css */
   .card {
     width: 100px;
     height: 140px;
     background-color: white;
     border-radius: 8px;
     box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
     position: relative;
     margin: 0 -15px;
     transition: transform 0.3s;
   }

   .card:hover {
     transform: translateY(-10px);
     z-index: 10;
   }

   .card-back {
     background-color: var(--primary-color);
     background-image: repeating-linear-gradient(
       45deg,
       transparent,
       transparent 10px,
       rgba(255, 255, 255, 0.1) 10px,
       rgba(255, 255, 255, 0.1) 20px
     );
   }

   .card-red {
     color: var(--danger-color);
   }

   .card-black {
     color: var(--text-color);
   }

   .card-corner {
     position: absolute;
     display: flex;
     flex-direction: column;
     align-items: center;
     font-size: 16px;
     font-weight: bold;
   }

   .top-left {
     top: 5px;
     left: 5px;
   }

   .bottom-right {
     bottom: 5px;
     right: 5px;
     transform: rotate(180deg);
   }

   .card-center {
     position: absolute;
     top: 50%;
     left: 50%;
     transform: translate(-50%, -50%);
     font-size: 30px;
   }

   .card-rank {
     font-size: 16px;
   }

   .card-suit {
     font-size: 18px;
   }
   ```

4. Create additional component styles for Hand, GameControls, GameResult, Header, etc.

## Final Steps

1. Create a CSS reset file:
   ```css
   /* src/styles/reset.css */
   html, body, div, span, applet, object, iframe,
   h1, h2, h3, h4, h5, h6, p, blockquote, pre,
   a, abbr, acronym, address, big, cite, code,
   del, dfn, em, img, ins, kbd, q, s, samp,
   small, strike, strong, sub, sup, tt, var,
   b, u, i, center,
   dl, dt, dd, ol, ul, li,
   fieldset, form, label, legend,
   table, caption, tbody, tfoot, thead, tr, th, td,
   article, aside, canvas, details, embed, 
   figure, figcaption, footer, header, hgroup, 
   menu, nav, output, ruby, section, summary,
   time, mark, audio, video {
     margin: 0;
     padding: 0;
     border: 0;
     font-size: 100%;
     font: inherit;
     vertical-align: baseline;
   }
   
   article, aside, details, figcaption, figure, 
   footer, header, hgroup, menu, nav, section {
     display: block;
   }
   
   body {
     line-height: 1;
   }
   
   ol, ul {
     list-style: none;
   }
   
   blockquote, q {
     quotes: none;
   }
   
   blockquote:before, blockquote:after,
   q:before, q:after {
     content: '';
     content: none;
   }
   
   table {
     border-collapse: collapse;
     border-spacing: 0;
   }
   ```

2. Update package.json scripts:
   ```json
   "scripts": {
     "dev": "vite",
     "build": "vite build",
     "preview": "vite preview",
     "lint": "eslint src --ext js,jsx --report-unused-disable-directives --max-warnings 0"
   }
   ```

3. Create a .env.example file:
   ```
   VITE_API_URL=http://localhost:3001/api
   ```