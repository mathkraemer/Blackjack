// GameController.js
// This file will handle game logic and endpoints for the backend

import { BlackjackService } from '../services/BlackjackService.js';

export const startNewGame = (req, res) => {
  const userId = req.body.userId;
  const game = BlackjackService.startGame(userId);
  res.status(200).json({ success: true, data: game });
};

export const hit = (req, res) => {
  const { gameId } = req.params;
  const game = BlackjackService.hit(gameId);
  res.status(200).json({ success: true, data: game });
};

export const stand = (req, res) => {
  const { gameId } = req.params;
  const game = BlackjackService.stand(gameId);
  res.status(200).json({ success: true, data: game });
};

export const getGameState = (req, res) => {
  const { gameId } = req.params;
  const game = BlackjackService.getGameState(gameId);
  res.status(200).json({ success: true, data: game });
};

export const getGameHistory = (req, res) => {
  const userId = req.body.userId;
  const history = BlackjackService.getGameHistory(userId);
  res.status(200).json({ success: true, data: history });
};