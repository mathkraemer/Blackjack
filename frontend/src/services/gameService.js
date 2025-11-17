// gameService.js
// Service functions to interact with the game API

import axios from 'axios';

export const startNewGame = async (userId) => {
  try {
    const response = await axios.post('/api/game/new', { userId });
    return response.data.data;
  } catch (error) {
    console.error('Error starting new game:', error);
    throw error;
  }
};

export const hit = async (gameId) => {
  try {
    const response = await axios.post(`/api/game/${gameId}/hit`);
    return response.data.data;
  } catch (error) {
    console.error('Error hitting:', error);
    throw error;
  }
};

export const stand = async (gameId) => {
  try {
    const response = await axios.post(`/api/game/${gameId}/stand`);
    return response.data.data;
  } catch (error) {
    console.error('Error standing:', error);
    throw error;
  }
};

export const getGameState = async (gameId) => {
  try {
    const response = await axios.get(`/api/game/${gameId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error getting game state:', error);
    throw error;
  }
};

export const getGameHistory = async (userId) => {
  try {
    const response = await axios.get('/api/game/history', { params: { userId } });
    return response.data.data;
  } catch (error) {
    console.error('Error getting game history:', error);
    throw error;
  }
};