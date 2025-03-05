import express from 'express';
import exphbs from 'express-handlebars';
import { Server } from 'socket.io';
import { Router } from './routes/views.router.js';

const PORT=8080;
const app=express();

//configuramos handlebars
app.engine('handlebars', exphbs.engine()); //nombre del motor y la funcion que lo ejecuta cuando lo encuentre
app.set('view engine', 'handlebars'); //establecemos el motor de vistas
app.set('views', './views'); //establecemos la carpeta donde estan las vistas

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/public', express.static('public'));


app.use('/',Router);

const httpServer = app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto:${PORT}`);
}); 


const io = new Server(httpServer);

let messages = [];

io.on('connection', (socket) => {
    console.log(`Un cliente se ha conectado`);

    // Enviar historial de mensajes al conectar
    socket.emit('messageLogs', messages);

    socket.on('message', (data) => {
        messages.push(data);
        // Broadcast a todos los clientes
        io.emit('messageLogs', messages);
    });
});

export default app;