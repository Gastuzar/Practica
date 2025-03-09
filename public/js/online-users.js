// Add to your main.js file (or create a new online-users.js file)

// Variable to track online users
let onlineUsers = [];

// Create a container for online users display (add to your HTML)
// Actualización de la función setupOnlineUsersDisplay para el nuevo diseño

function setupOnlineUsersDisplay() {
    // Crear el contenedor si no existe
    if (!document.getElementById('onlineUsersContainer')) {
        const chatContainer = document.querySelector('.chat-container');
        const onlineUsersContainer = document.createElement('div');
        onlineUsersContainer.id = 'onlineUsersContainer';
        onlineUsersContainer.className = 'online-users-container';
        
        // Agregar el título
        const title = document.createElement('h3');
        title.textContent = 'Usuarios en línea:';
        title.className = 'online-users-title';
        onlineUsersContainer.appendChild(title);
        
        // Agregar el contenedor para los iconos de usuarios
        const userBubbles = document.createElement('div');
        userBubbles.id = 'userBubbles';
        userBubbles.className = 'user-bubbles';
        onlineUsersContainer.appendChild(userBubbles);
        
        // Insertar después del h1 en chat-container
        const h1 = chatContainer.querySelector('h1');
        h1.parentNode.insertBefore(onlineUsersContainer, h1.nextSibling);
    }
}

// El resto del código permanece igual

// Function to update online users display
function updateOnlineUsersDisplay() {
    const userBubbles = document.getElementById('userBubbles');
    userBubbles.innerHTML = ''; // Clear current users
    
    onlineUsers.forEach(user => {
        const userBubble = document.createElement('div');
        userBubble.className = 'user-bubble';
        
        // Display initials (first letter of nickname)
        const initials = user.nickname.charAt(0).toUpperCase();
        userBubble.textContent = initials;
        
        // Set tooltip with nickname
        userBubble.title = user.nickname;
        
        // Add to container
        userBubbles.appendChild(userBubble);
    });
}

// Add these to your socket event listeners
socket.on('connect', () => {
    // When we connect, emit our user info if we're logged in
    if (user) {
        socket.emit('userConnected', { user });
    }
});

// Listen for updated online users list
socket.on('updateOnlineUsers', (users) => {
    onlineUsers = users;
    updateOnlineUsersDisplay();
});

// Update the setupChat function
function setupChat() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    // Set up online users display
    setupOnlineUsersDisplay();
    
    // Let the server know we're connected
    socket.emit('userConnected', { user });
}