// App.js
// Root component for the frontend application

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import GameBoard from './GameBoard';
import Login from './Login';
import Register from './Register';
import GameHistory from './GameHistory';
import UserProfile from './UserProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GameBoard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/history" element={<GameHistory />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;