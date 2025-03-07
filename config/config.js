import dotenv from 'dotenv';
dotenv.config(); 

export const config = {
    PORT: process.env.PORT || 8080,
    MONGO_URL: process.env.MONGO_URL,
    DB_NAME: process.env.DB_NAME,
    SECRET: process.env.SECRET,
    EXPIRACION: '24h',
    COOKIE_MAX_AGE: 1000 * 60 * 60 * 24
};