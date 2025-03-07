import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { userMongoDAO } from '../DAO/userMongoDAO.js';

export const authMiddleware = async (req, res, next) => {
    try {
        // Obtener token desde las cookies
        const token = req.cookies.jwt;
        
        if (!token) {
            return res.status(401).json({ message: 'No autorizado, token no proporcionado' });
        }
        
        // Verificar token
        const decoded = jwt.verify(token, config.SECRET);
        
        // Buscar usuario
        const user = await userMongoDAO.getUserById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ message: 'No autorizado, usuario no encontrado' });
        }
        
        // Agregar usuario a la solicitud
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado' });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token inválido' });
        }
        
        res.status(500).json({ message: 'Error de autenticación' });
    }
};