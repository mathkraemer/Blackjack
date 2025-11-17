// authRoutes.js
// This file defines the routes for authentication endpoints

import express from 'express';
import { register, login, logout, getProfile } from '../controllers/AuthController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', getProfile);

export default router;