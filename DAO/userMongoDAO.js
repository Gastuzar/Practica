import { usersModel } from "./models/user.js";
import bcrypt from 'bcrypt';

export class userMongoDAO {
    constructor(userData) {
        if (userData) {
            this._id = userData._id;
            this.first_name = userData.first_name;
            this.last_name = userData.last_name;
            this.email = userData.email;
            this.nickname = userData.nickname;
            this.role = userData.role;
            // Importante: No incluir la contraseña en el objeto que se devuelve al cliente
        }
    }

    static async getAllUsers() {
        return await usersModel.find().lean();
    }

    static async createUser(userData) {
        try {
            return await usersModel.create(userData);
        } catch (error) {
            throw new Error(`Error al crear usuario: ${error.message}`);
        }
    }

    static async getUserByNickname(nickname) {
        try {
            return await usersModel.findOne({ nickname });
        } catch (error) {
            throw new Error(`Error al buscar usuario: ${error.message}`);
        }
    }

    static async getUserById(id) {
        try {
            return await usersModel.findById(id).lean();
        } catch (error) {
            throw new Error(`Error al buscar usuario: ${error.message}`);
        }
    }

    static async logout(user) {
        // Aquí puedes implementar lógica adicional si es necesario, como
        // invalidar tokens, actualizar el estado del usuario, etc.
        return true;
    }

    // Método para actualizar usuario
    static async updateUser(id, userData) {
        try {
            return await usersModel.findByIdAndUpdate(id, userData, { new: true });
        } catch (error) {
            throw new Error(`Error al actualizar usuario: ${error.message}`);
        }
    }
}