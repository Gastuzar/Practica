import express from 'express';
import exphbs from 'express-handlebars';
import { Server } from 'socket.io';
import { Router } from './routes/views.router.js';
import { conectarDB } from './ConnDB.js';
import passport from 'passport';
import { iniciarPassport } from './config/passport.js';
import cookieParser from 'cookie-parser';
import { config } from './config/config.js';

const PORT = config.PORT;
const app=express();

//configuramos handlebars
app.engine('handlebars', exphbs.engine()); //nombre del motor y la funcion que lo ejecuta cuando lo encuentre
app.set('view engine', 'handlebars'); //establecemos el motor de vistas
app.set('views', './views'); //establecemos la carpeta donde estan las vistas

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/public', express.static('public'));
app.use(cookieParser())

iniciarPassport();
app.use(passport.initialize());

app.get('/', (req, res) => {
    res.render('index');
})
// Rutas de la API
app.use('/api', Router);

const httpServer = app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto:${PORT}`);
}); 


const io = new Server(httpServer);

let messages = [];

const connectedUsers = new Map(); // Map socket ID to user info

io.on('connection', (socket) => {
    console.log(` Nuevo cliente conectado: ${socket.id}`);
    
    // Handle user connected event
    socket.on('userConnected', (data) => {
        if (data.user) {
            // Store user data with socket ID
            connectedUsers.set(socket.id, data.user);
            
            // Broadcast updated user list to all clients
            broadcastConnectedUsers();
        }
    });
    
    // Handle message event (your existing code)
    socket.on('message', (data) => {
        // Your existing message handling code
        messages.push(data);
        io.emit('messageLogs', messages);
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
        // Remove user from connected users
        connectedUsers.delete(socket.id);
        
        // Broadcast updated user list
        broadcastConnectedUsers();
    });
    
    // Function to broadcast connected users to all clients
    function broadcastConnectedUsers() {
        const users = Array.from(connectedUsers.values());
        io.emit('updateOnlineUsers', users);
    }
});

conectarDB(config.MONGO_URL, config.DB_NAME)

export default app;


// {
//   "name": "chat-websocket",
//   "version": "1.0.0",
//   "type": "module",
//   "main": "index.js",
//   "engines": {
//     "node": ">=16.0.0",
//     "npm": "10.2.4"
//   },
//   "scripts": {
//     "start": "node app.js"
//   },