document.addEventListener('DOMContentLoaded', () => {
    const clientId = 'f78975ef2d8d4af48b6e67c0a55a0d6f';
    const clientSecret = '2db84864f7314bc598d5cc700d87709b';
    const redirectUri = 'https://cooperative-darkened-track.glitch.me/';
    let accessToken = localStorage.getItem('spotifyAccessToken') || null;
    let player = null; // Variable para el reproductor SDK

    // Elementos del DOM
    const spotifySearch = document.getElementById('spotifySearch');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    const spotifyPlayer = document.getElementById('spotifyPlayer');
    const loginButton = document.getElementById('loginButton');
    const playerContainer = document.getElementById('player-container');
    
    // Crear un div para el Web Playback SDK
    if (!document.getElementById('spotify-web-player')) {
        const webPlayer = document.createElement('div');
        webPlayer.id = 'spotify-web-player';
        webPlayer.style.marginTop = '20px';
        if (playerContainer) {
            playerContainer.appendChild(webPlayer);
        } else {
            // Si no existe playerContainer, añadirlo después del iframe
            spotifyPlayer.insertAdjacentHTML('afterend', '<div id="player-container"><div id="spotify-web-player"></div></div>');
        }
    }

    // Actualizar el estado del botón de login según si tenemos token o no
    function updateLoginButtonState() {
        if (accessToken) {
            loginButton.textContent = 'Cerrar sesión de Spotify';
            loginButton.classList.remove('btn-success');
            loginButton.classList.add('btn-danger');
            // Habilitar la búsqueda
            spotifySearch.disabled = false;
            searchButton.disabled = false;
            
            // Inicializar el Web Playback SDK si el usuario está autenticado
            initializePlayer();
        } else {
            loginButton.textContent = 'Iniciar sesión en Spotify';
            loginButton.classList.remove('btn-danger');
            loginButton.classList.add('btn-success');
            // Deshabilitar la búsqueda
            spotifySearch.disabled = true;
            searchButton.disabled = true;
            
            // Desconectar el reproductor si existe
            if (player) {
                player.disconnect();
                player = null;
            }
        }
    }

    // Inicializar el Web Playback SDK
    function initializePlayer() {
        if (!accessToken) return;
        
        // Cargar el script del SDK si no está ya cargado
        if (!window.Spotify) {
            const script = document.createElement('script');
            script.src = 'https://sdk.scdn.co/spotify-player.js';
            script.async = true;
            document.body.appendChild(script);
            
            window.onSpotifyWebPlaybackSDKReady = () => {
                createPlayer();
            };
        } else if (!player) {
            createPlayer();
        }
    }
    
    // Crear el reproductor de Spotify
    function createPlayer() {
        player = new Spotify.Player({
            name: 'Web Playback SDK para Julian',
            getOAuthToken: cb => { cb(accessToken); },
            volume: 0.5
        });

        // Error handling
        player.addListener('initialization_error', ({ message }) => { 
            console.error('Failed to initialize', message);
            showPlayerStatus('Error: No se pudo inicializar el reproductor. Es posible que necesites una cuenta Premium.');
        });
        player.addListener('authentication_error', ({ message }) => { 
            console.error('Failed to authenticate', message);
            showPlayerStatus('Error de autenticación. Intenta iniciar sesión nuevamente.');
        });
        player.addListener('account_error', ({ message }) => { 
            console.error('Failed to validate account', message);
            showPlayerStatus('Error: Se requiere cuenta Premium de Spotify para usar el reproductor web.');
        });
        player.addListener('playback_error', ({ message }) => { 
            console.error('Failed to perform playback', message);
        });

        // Estado del reproductor
        player.addListener('player_state_changed', state => {
            if (!state) return;
            
            // Actualizar la interfaz con la canción actual
            if (state.track_window && state.track_window.current_track) {
                const track = state.track_window.current_track;
                updateNowPlaying(track);
            }
        });

        // Reproductor listo
        player.addListener('ready', ({ device_id }) => {
            console.log('El reproductor está listo con device ID:', device_id);
            localStorage.setItem('spotifyDeviceId', device_id);
            showPlayerStatus('Reproductor listo. Busca y selecciona una canción para reproducir.');
        });

        // Reproductor desconectado
        player.addListener('not_ready', ({ device_id }) => {
            console.log('El reproductor se ha desconectado:', device_id);
            localStorage.removeItem('spotifyDeviceId');
        });

        // Conectar el reproductor
        player.connect();
    }
    
    // Mostrar estado del reproductor
    function showPlayerStatus(message) {
        const statusElement = document.getElementById('player-status') || document.createElement('div');
        statusElement.id = 'player-status';
        statusElement.className = 'alert alert-info mt-3';
        statusElement.textContent = message;
        
        const webPlayer = document.getElementById('spotify-web-player');
        if (webPlayer && !document.getElementById('player-status')) {
            webPlayer.appendChild(statusElement);
        }
    }
    
    // Actualizar información de lo que está sonando
    function updateNowPlaying(track) {
        const webPlayer = document.getElementById('spotify-web-player');
        if (!webPlayer) return;
        
        // Crear o actualizar el contenedor de "Now Playing"
        let nowPlaying = document.getElementById('now-playing');
        if (!nowPlaying) {
            nowPlaying = document.createElement('div');
            nowPlaying.id = 'now-playing';
            nowPlaying.className = 'mt-3 p-3 border rounded';
            webPlayer.appendChild(nowPlaying);
        }
        
        // Actualizar el contenido
        nowPlaying.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${track.album.images[0].url}" alt="Album cover" style="width: 60px; margin-right: 15px;">
                <div>
                    <h5 class="mb-0">${track.name}</h5>
                    <p class="mb-0 text-muted">${track.artists.map(a => a.name).join(', ')}</p>
                    <small>${track.album.name}</small>
                </div>
            </div>
            <div class="mt-3 btn-group">
                <button id="btn-prev" class="btn btn-sm btn-outline-secondary">Anterior</button>
                <button id="btn-play" class="btn btn-sm btn-outline-primary">Play/Pause</button>
                <button id="btn-next" class="btn btn-sm btn-outline-secondary">Siguiente</button>
            </div>
        `;
        
        // Añadir controles de reproducción
        document.getElementById('btn-play').addEventListener('click', () => {
            player.togglePlay();
        });
        document.getElementById('btn-prev').addEventListener('click', () => {
            player.previousTrack();
        });
        document.getElementById('btn-next').addEventListener('click', () => {
            player.nextTrack();
        });
    }

    // Función para redirigir al usuario a la página de autorización de Spotify
    function redirectToSpotifyLogin() {
        if (accessToken) {
            accessToken = null;
            localStorage.removeItem('spotifyAccessToken');
            localStorage.removeItem('spotifyRefreshToken');
            localStorage.removeItem('spotifyDeviceId');
            updateLoginButtonState();
            searchResults.innerHTML = '<li class="list-group-item">Has cerrado sesión.</li>';
            spotifyPlayer.src = '';
            // Limpiar el reproductor web
            const webPlayer = document.getElementById('spotify-web-player');
            if (webPlayer) webPlayer.innerHTML = '';
        } else {
            const state = Math.random().toString(36).substring(2, 15);
            localStorage.setItem('spotify_auth_state', state);
            
            // Solicitar permisos adicionales para reproducción
            const scopes = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state streaming user-read-recently-played';
            const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}`;
            window.location.href = authUrl;
        }
    }

    // Función para obtener el token de acceso usando el código de autorización
    async function getAccessToken(code) {
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: redirectUri
                })
            });

            if (!response.ok) {
                throw new Error(`Error al obtener el token: ${response.status}`);
            }

            const data = await response.json();
            accessToken = data.access_token;
            localStorage.setItem('spotifyAccessToken', accessToken);
            
            if (data.refresh_token) {
                localStorage.setItem('spotifyRefreshToken', data.refresh_token);
            }
            
            updateLoginButtonState();
            return accessToken;
        } catch (error) {
            console.error('Error obteniendo el token:', error);
            return null;
        }
    }

    // Función para buscar canciones en Spotify
    async function searchTracks(query) {
        if (!accessToken) {
            console.error('No se ha obtenido el token de acceso');
            return [];
        }

        try {
            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.status === 401) {
                const refreshToken = localStorage.getItem('spotifyRefreshToken');
                if (refreshToken) {
                    const newToken = await refreshAccessToken(refreshToken);
                    if (newToken) {
                        return searchTracks(query);
                    }
                }
                accessToken = null;
                localStorage.removeItem('spotifyAccessToken');
                updateLoginButtonState();
                searchResults.innerHTML = '<li class="list-group-item">La sesión ha expirado. Por favor, inicia sesión de nuevo.</li>';
                return [];
            }

            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }

            const data = await response.json();
            return data.tracks.items;
        } catch (error) {
            console.error('Error buscando canciones:', error);
            return [];
        }
    }

    // Función para refrescar el token de acceso
    async function refreshAccessToken(refreshToken) {
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                })
            });

            if (!response.ok) {
                throw new Error(`Error al refrescar el token: ${response.status}`);
            }

            const data = await response.json();
            accessToken = data.access_token;
            localStorage.setItem('spotifyAccessToken', accessToken);
            
            if (data.refresh_token) {
                localStorage.setItem('spotifyRefreshToken', data.refresh_token);
            }
            
            updateLoginButtonState();
            return accessToken;
        } catch (error) {
            console.error('Error refrescando el token:', error);
            return null;
        }
    }

    // Función para mostrar los resultados de la búsqueda
    function displaySearchResults(tracks) {
        searchResults.innerHTML = '';

        if (tracks.length === 0) {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.textContent = 'No se encontraron resultados.';
            searchResults.appendChild(listItem);
            return;
        }

        tracks.forEach(track => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex align-items-center';
            
            if (track.album && track.album.images && track.album.images.length > 0) {
                const albumImg = document.createElement('img');
                albumImg.src = track.album.images[track.album.images.length - 1].url;
                albumImg.alt = 'Album cover';
                albumImg.style.width = '50px';
                albumImg.style.marginRight = '10px';
                listItem.appendChild(albumImg);
            }
            
            const trackInfo = document.createElement('div');
            trackInfo.innerHTML = `<strong>${track.name}</strong><br>
                                 <small>${track.artists.map(artist => artist.name).join(', ')} - ${track.album.name}</small>`;
            listItem.appendChild(trackInfo);
            
            listItem.style.cursor = 'pointer';
            listItem.addEventListener('click', () => {
                playTrack(track.uri, track.id);
            });
            searchResults.appendChild(listItem);
        });
    }

    // Función para reproducir una canción
    function playTrack(trackUri, trackId) {
        // Mostrar en el iframe para compatibilidad
        spotifyPlayer.src = `https://open.spotify.com/embed/track/${trackId}`;
        
        // Si tenemos el reproductor SDK y un device ID, reproducir directamente
        const deviceId = localStorage.getItem('spotifyDeviceId');
        if (player && deviceId) {
            fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uris: [trackUri]
                })
            }).catch(error => {
                console.error('Error al reproducir:', error);
                showPlayerStatus('Error al reproducir. Verifica que tengas una cuenta Premium de Spotify.');
            });
        } else if (player && !deviceId) {
            showPlayerStatus('Reproductor no inicializado completamente. Espera unos segundos y vuelve a intentar.');
        } else {
            showPlayerStatus('Para reproducción completa, necesitas una cuenta Premium de Spotify.');
        }
    }

    // Eventos para la búsqueda
    if (searchButton && spotifySearch) {
        searchButton.addEventListener('click', async () => {
            const query = spotifySearch.value.trim();
            if (query) {
                const tracks = await searchTracks(query);
                displaySearchResults(tracks);
            } else {
                searchResults.innerHTML = '<li class="list-group-item">Por favor, ingresa un término de búsqueda.</li>';
            }
        });

        spotifySearch.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const query = spotifySearch.value.trim();
                if (query) {
                    const tracks = await searchTracks(query);
                    displaySearchResults(tracks);
                } else {
                    searchResults.innerHTML = '<li class="list-group-item">Por favor, ingresa un término de búsqueda.</li>';
                }
            }
        });
    }

    // Evento para el botón de login/logout
    if (loginButton) {
        loginButton.addEventListener('click', redirectToSpotifyLogin);
    }

    // Verificar código de autorización
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const savedState = localStorage.getItem('spotify_auth_state');

    if (code && state === savedState) {
        getAccessToken(code).then(token => {
            if (token) {
                console.log('Token de acceso obtenido:', token);
                window.history.replaceState({}, document.title, redirectUri);
            }
        });
        localStorage.removeItem('spotify_auth_state');
    } else if (code) {
        console.error('Estado inválido, posible ataque CSRF');
        localStorage.removeItem('spotify_auth_state');
        window.history.replaceState({}, document.title, redirectUri);
    }

    // Inicializar el estado del botón de login
    updateLoginButtonState();
});