import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true, // Correcto: dentro de un objeto
    },
    last_name: {
        type: String,
        required: false, // Correcto: dentro de un objeto
        unique: true,    // Correcto: dentro de un objeto
    },
    email: {
        type: String,
        required: false,
        unique: true,
        sparse: true,  // Permitir múltiples valores null
        default: function() {
            // Generar un email único basado en el timestamp si no se proporciona
            return this.nickname ? `${this.nickname}_${Date.now()}@example.com` : null;
        }
    },
    password: {
        type: String,
        required: true, // Correcto: dentro de un objeto
    },
    role: {
        type: String,
        default: 'user', // Correcto: dentro de un objeto
    },
    nickname: {
        type: String,
        required: true, // Correcto: dentro de un objeto
    },
});

export const usersModel = mongoose.model('User', userSchema);
