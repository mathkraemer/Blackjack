// gameRoutes.js
// This file defines the routes for game-related endpoints

import express from 'express';
import { startNewGame, hit, stand, getGameState, getGameHistory } from '../controllers/GameController.js';

const router = express.Router();

router.post('/new', startNewGame);
router.post('/:gameId/hit', hit);
router.post('/:gameId/stand', stand);
router.get('/:gameId', getGameState);
router.get('/history', getGameHistory);

export default router;