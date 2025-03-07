import express from 'express';
import { authRoutes }  from '../controllers/authRoutes.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authController } from '../controllers/authController.js';

const router = express.Router();

// Rutas de autenticación
router.use('/auth', authRoutes);
router.get('/auth/verify', authMiddleware, authController.verifyAuth);


export { router as Router };