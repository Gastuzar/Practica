// Script para la API de Spotify
document.addEventListener('DOMContentLoaded', () => {
    // Obtención de token
    async function getSpotifyToken() {
        const clientId = 'f78975ef2d8d4af48b6e67c0a55a0d6f';
        const clientSecret = '2db84864f7314bc598d5cc700d87709b';

        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    // Usar btoa para codificar en Base64 en navegadores
                    'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
                },
                body: 'grant_type=client_credentials'
            });

            if (!response.ok) {
                throw new Error(`Error al obtener el token: ${response.status}`);
            }

            const data = await response.json();
            return data.access_token;
        } catch (error) {
            console.error('Error obteniendo el token:', error);
            return null;
        }
    }

    // Elementos del DOM
    const spotifySearch = document.getElementById('spotifySearch');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    const spotifyPlayer = document.getElementById('spotifyPlayer');

    // Función para buscar canciones en Spotify
    async function searchTracks(query) {
        const token = await getSpotifyToken(); // Esperar a que se resuelva el token
        if (!token) {
            console.error('No se pudo obtener el token');
            return [];
        }
        
        try {
            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

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

    // Función para mostrar los resultados de la búsqueda
    function displaySearchResults(tracks) {
        searchResults.innerHTML = ''; // Limpiar resultados anteriores

        if (tracks.length === 0) {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.textContent = 'No se encontraron resultados.';
            searchResults.appendChild(listItem);
            return;
        }

        tracks.forEach(track => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.textContent = `${track.name} by ${track.artists.map(artist => artist.name).join(', ')}`;
            listItem.style.cursor = 'pointer';
            listItem.addEventListener('click', () => playTrack(track.uri));
            searchResults.appendChild(listItem);
        });
    }

    // Función para reproducir una canción
    function playTrack(trackUri) {
        const trackId = trackUri.split(':')[2];
        const embedUrl = `https://open.spotify.com/embed/track/${trackId}`;
        spotifyPlayer.src = embedUrl;
    }

    // Evento para buscar canciones
    if (spotifySearch && searchButton && searchResults && spotifyPlayer) {
        searchButton.addEventListener('click', async () => {
            const query = spotifySearch.value.trim();
            if (query) {
                const tracks = await searchTracks(query);
                displaySearchResults(tracks);
            } else {
                searchResults.innerHTML = '<li class="list-group-item">Por favor, ingresa un término de búsqueda.</li>';
            }
        });

        // Añadir evento para buscar al presionar Enter
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
});