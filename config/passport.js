import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { usersModel } from '../DAO/models/user.js';
import { config } from './config.js';

const buscaToken = (req) => {
    return req.cookies.jwt || null; 
    //busca el token en las cookies y si no lo encuentra devuelve null
}

export const iniciarPassport = () => {
    const opciones = {
        //siempre pide 2 parametros, el primero es un objeto con las opciones de configuración y el segundo es una función que se ejecuta cuando se valida el token
        jwtFromRequest: ExtractJwt.fromExtractors([buscaToken]),
        secretOrKey: config.SECRET
    };

    passport.use(
        new JwtStrategy(opciones, async (contenidoToken, done) => {
            try {
                console.log("Token recibido en Passport:", contenidoToken);
                if (!contenidoToken || !contenidoToken.id) {
                    return done(null, false, { message: 'Token inválido o no proporcionado' });
                }
    
                const user = await usersModel.findById(contenidoToken.id);
                if (!user) {
                    return done(null, false, { message: 'Usuario no encontrado' });
                }
    
                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        })
    );
}