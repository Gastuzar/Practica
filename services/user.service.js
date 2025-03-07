import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { userMongoDAO } from '../DAO/userMongoDAO.js';
import { config } from '../config/config.js';

class UserService {
    async login(nickname, password) {
        const user = await userMongoDAO.getUserByNickname(nickname);
        
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        
        if (!bcrypt.compareSync(password, user.password)) {
            throw new Error('Contraseña incorrecta');
        }
        
        return this.generateAuthToken(user);
    }

    async logoutUser(user) {
        if (user) {
            await userMongoDAO.logout(user);
        }
    }

    async generateAuthToken(user) {
        const token = jwt.sign(
            { id: user._id, role: user.role },
            config.SECRET,
            { expiresIn: config.EXPIRACION }
        );

        return { user: new userMongoDAO(user), token };
    }
}

export const userService = new UserService();