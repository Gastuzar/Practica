import express from 'express';
import { authController } from '../controllers/authController.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { userMongoDAO } from '../DAO/userMongoDAO.js';

const router = express.Router();

// Middleware para verificar token y proteger rutas
const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        
        if (!token) {
            return res.status(401).json({ message: 'No autorizado. Inicia sesión primero.' });
        }
        
        const decoded = jwt.verify(token, config.SECRET);
        const user = await userMongoDAO.getUserById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

// Rutas públicas
router.post('/login', authController.login);
router.post('/register', authController.register);

// Rutas protegidas (requieren autenticación)
router.post('/logout', verifyToken, authController.logout);
router.get('/profile', verifyToken, (req, res) => {
    // Enviar información del perfil del usuario
    res.json({ 
        user: {
            nickname: req.user.nickname,
            name: req.user.first_name,
            email: req.user.email,
            role: req.user.role
        }
    });
});

export { router as authRoutes };