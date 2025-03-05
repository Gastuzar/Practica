console.log('Client connected');

const socket = io();

let user;

const chatBox = document.getElementById('chatBox');
const sendButton = document.getElementById('sendButton');
const messageLogs = document.getElementById('messageLogs');

Swal.fire({
    title: 'Identificate',
    input: 'text',
    text: 'Ingresa tu usuario',
    inputValidator: (value) => {
        return !value && 'Escribe algo para identificarte';
    },
    allowOutsideClick: false
}).then(result => {
    user = result.value;
});

chatBox.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

sendButton.addEventListener('click', sendMessage);

function sendMessage() {
    if (chatBox.value.trim().length > 0) {
        socket.emit('message', { 
            user: user, 
            message: chatBox.value 
        });
        chatBox.value = '';
    }
}

socket.on('messageLogs', (data) => {
    let messages = '';
    data.forEach(message => {
        messages += `${message.user} dice: ${message.message} <br>`;
    });
    messageLogs.innerHTML = messages;
});

export { socket }; 