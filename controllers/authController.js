import bcrypt from 'bcrypt';
import { userMongoDAO } from "../DAO/userMongoDAO.js";
import { userService } from "../services/user.service.js";
import { authMiddleware } from '../middleware/authMiddleware.js';

export class authController {
    static async login(req, res) {
        try {
            const { nickname, password } = req.body;
            
            if (!nickname || !password) {
                return res.status(400).json({ message: 'Nickname y contraseña son requeridos' });
            }
            
            const { user, token } = await userService.login(nickname, password);
            
            res.cookie('jwt', token, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24, // 1 día
                secure: false
            });
            
            res.json({ message: 'Login exitoso', user });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }
    
    static async register(req, res) {
        try {
            const { name, nickname, password } = req.body;
            
            if (!nickname || !password) {
                return res.status(400).json({ message: 'Nickname y contraseña son requeridos' });
            }
            
            // Verificar si el usuario ya existe
            const existingUser = await userMongoDAO.getUserByNickname(nickname);
            if (existingUser) {
                return res.status(400).json({ message: 'El nickname ya está en uso' });
            }
            
            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Crear el usuario
            const newUser = await userMongoDAO.createUser({
                first_name: name || nickname, // Si no hay nombre, usar nickname
                nickname,
                password: hashedPassword,
                role: 'user'
            });
            
            // Generar token usando el servicio
            const authData = await userService.generateAuthToken(newUser);
            
            res.cookie('jwt', authData.token, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24, // 1 día
                secure: false
            });
            
            res.json({ 
                message: 'Usuario creado con éxito', 
                user: authData.user 
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    
    static async logout(req, res) {
        try {
            if (req.cookies.jwt) {
                res.clearCookie('jwt');
                if (req.user) {
                    await userService.logoutUser(req.user);
                }
                return res.json({ message: 'Logout exitoso' });
            }
            return res.status(400).json({ message: 'No se encontró token de sesión' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static async verifyAuth(req, res) {
        try {
            // Si el middleware de autenticación permitió llegar hasta aquí,
            // significa que el token es válido y tenemos el usuario en req.user
            if (req.user) {
                return res.json({ 
                    authenticated: true, 
                    user: new userMongoDAO(req.user)
                });
            } else {
                return res.status(401).json({ 
                    authenticated: false, 
                    message: 'No hay sesión activa' 
                });
            }
        } catch (error) {
            res.status(500).json({ 
                authenticated: false, 
                message: error.message 
            });
        }
    }
}