
const socket = io();
let user;
const chatBox = document.getElementById('chatBox');
const sendButton = document.getElementById('sendButton');
const messageLogs = document.getElementById('messageLogs');

// Función principal de autenticación
async function initializeAuth() {
    try {
        const response = await fetch('/api/auth/verify', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            user = data.user;

            Swal.fire({
                title: '¡Bienvenido de nuevo!',
                text: `Sesión activa como ${user.nickname}`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            setupChat();
        } else {
            authenticate();
        }
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        authenticate();
    }
}

// Función para autenticar
async function authenticate() {
    const { value: formValues, dismiss } = await Swal.fire({
        title: 'Identificate',
        html:
            '<input id="swal-nickname" class="swal2-input" placeholder="Nickname">' +
            '<input id="swal-password" type="password" class="swal2-input" placeholder="Contraseña">',
        focusConfirm: false,
        showCancelButton: true,
        cancelButtonText: 'Registrarse',
        confirmButtonText: 'Iniciar sesión',
        allowOutsideClick: false,
        preConfirm: () => {
            const nickname = document.getElementById('swal-nickname').value;
            const password = document.getElementById('swal-password').value;

            if (!nickname || !password) {
                Swal.showValidationMessage('Nickname y contraseña son requeridos');
                return false;
            }

            return { nickname, password };
        }
    });

    if (dismiss === Swal.DismissReason.backdrop || dismiss === Swal.DismissReason.esc) {
        return authenticate();
    }

    if (formValues) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formValues),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                user = data.user;
                Swal.fire({
                    title: '¡Bienvenido!',
                    text: `Has iniciado sesión como ${user.nickname}`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });

                setupChat();
            } else {
                Swal.fire({
                    title: 'Error',
                    text: data.message,
                    icon: 'error',
                    confirmButtonText: 'Intentar de nuevo'
                }).then(() => {
                    authenticate();
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Ha ocurrido un error en la autenticación',
                icon: 'error',
                confirmButtonText: 'Intentar de nuevo'
            }).then(() => {
                authenticate();
            });
        }
    } else {
        await showRegistrationForm();
    }
}

// Función para mostrar el formulario de registro
async function showRegistrationForm() {
    const { value: formValues, dismiss } = await Swal.fire({
        title: 'Registrarse',
        html:
            '<input id="reg-name" class="swal2-input" placeholder="Nombre">' +
            '<input id="reg-nickname" class="swal2-input" placeholder="Nickname">' +
            '<input id="reg-email" class="swal2-input" type="email" placeholder="Email (opcional)">' +
            '<input id="reg-password" class="swal2-input" type="password" placeholder="Contraseña">',
        focusConfirm: false,
        showCancelButton: true,
        cancelButtonText: 'Volver al login',
        confirmButtonText: 'Registrarse',
        preConfirm: () => {
            const nickname = document.getElementById('reg-nickname').value;
            const password = document.getElementById('reg-password').value;

            if (!nickname || !password) {
                Swal.showValidationMessage('Nickname y contraseña son requeridos');
                return false;
            }

            return {
                name: document.getElementById('reg-name').value,
                nickname,
                email: document.getElementById('reg-email').value || null,
                password
            };
        }
    });

    if (dismiss === Swal.DismissReason.backdrop || dismiss === Swal.DismissReason.esc) {
        return showRegistrationForm();
    }

    if (formValues) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formValues),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                user = data.user;
                Swal.fire({
                    title: '¡Registro exitoso!',
                    text: `Te has registrado como ${user.nickname}`,
                    icon: 'success',
                    confirmButtonText: 'Continuar al chat'
                }).then(() => {
                    setupChat();
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: data.message,
                    icon: 'error',
                    confirmButtonText: 'Intentar de nuevo'
                }).then(() => {
                    showRegistrationForm();
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Ha ocurrido un error en el registro',
                icon: 'error',
                confirmButtonText: 'Intentar de nuevo'
            }).then(() => {
                showRegistrationForm();
            });
        }
    } else {
        authenticate();
    }
}

// Configurar la funcionalidad del chat
function setupChat() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
}

// Manejar el cierre de sesión
async function handleLogout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            user = null;
            Swal.fire({
                title: 'Sesión cerrada',
                text: 'Has cerrado sesión correctamente',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                authenticate();
            });
        }
    } catch (error) {
        Swal.fire('Error', 'No se pudo cerrar la sesión', 'error');
    }
}

// Funcionalidad del chat
chatBox.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

sendButton.addEventListener('click', sendMessage);

function sendMessage() {
    if (chatBox.value.trim().length > 0 && user) {
        socket.emit('message', {
            user: user.nickname,
            message: chatBox.value
        });
        chatBox.value = '';
    }
}

socket.on('messageLogs', (data) => {
    let messages = '';
    data.forEach(message => {
        messages += `${message.user} dice: ${message.message}<br>`;
    });
    messageLogs.innerHTML = messages;
});

// Iniciar el flujo de autenticación cuando se carga la página
document.addEventListener('DOMContentLoaded', initializeAuth);
