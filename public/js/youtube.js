document.addEventListener('DOMContentLoaded', () => {
    // YouTube API Key - You'll need to replace this with your own API key
    const apiKey = 'AIzaSyA1MUcevPVXd_-wWnVNfTTdi-TrlSorHXQ';
    
    // DOM Elements
    const youtubeSearch = document.getElementById('youtubeSearch');
    const youtubeSearchButton = document.getElementById('youtubeSearchButton');
    const youtubeResults = document.getElementById('youtubeResults');
    const youtubePlayer = document.getElementById('youtubePlayer');
    
    // Tab elements
    const spotifyTab = document.getElementById('spotifyTab');
    const youtubeTab = document.getElementById('youtubeTab');
    const spotifyContainer = document.getElementById('spotify-container');
    const youtubeContainer = document.getElementById('youtube-container');
    
    // Function to switch tabs
    function switchTab(activeTab, activeContainer, inactiveTab, inactiveContainer) {
        activeTab.classList.add('active');
        activeContainer.classList.add('active');
        inactiveTab.classList.remove('active');
        inactiveContainer.classList.remove('active');
    }
    
    // Event listeners for tabs
    if (spotifyTab && youtubeTab) {
        spotifyTab.addEventListener('click', () => {
            switchTab(spotifyTab, spotifyContainer, youtubeTab, youtubeContainer);
        });
        
        youtubeTab.addEventListener('click', () => {
            switchTab(youtubeTab, youtubeContainer, spotifyTab, spotifyContainer);
        });
    }
    
    // Load YouTube API
    function loadYouTubeAPI() {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    }
    
    // Initialize YouTube API when it's ready
    window.onYouTubeIframeAPIReady = function() {
        console.log('YouTube API ready');
    };
    
    // Function to search YouTube videos
    async function searchVideos(query) {
        try {
            const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`);
            
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }
            
            const data = await response.json();
            return data.items;
        } catch (error) {
            console.error('Error buscando videos:', error);
            return [];
        }
    }
    
    // Function to display search results
    function displaySearchResults(videos) {
        youtubeResults.innerHTML = '';
        
        if (videos.length === 0) {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.textContent = 'No se encontraron resultados.';
            youtubeResults.appendChild(listItem);
            return;
        }
        
        videos.forEach(video => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex align-items-center';
            
            // Thumbnail
            const thumbnail = document.createElement('img');
            thumbnail.src = video.snippet.thumbnails.default.url;
            thumbnail.alt = 'Video thumbnail';
            thumbnail.style.width = '120px';
            thumbnail.style.marginRight = '10px';
            listItem.appendChild(thumbnail);
            
            // Video info
            const videoInfo = document.createElement('div');
            videoInfo.innerHTML = `
                <strong>${video.snippet.title}</strong><br>
                <small>${video.snippet.channelTitle}</small>
            `;
            listItem.appendChild(videoInfo);
            
            // Make item clickable
            listItem.style.cursor = 'pointer';
            listItem.addEventListener('click', () => {
                playVideo(video.id.videoId);
            });
            
            youtubeResults.appendChild(listItem);
        });
    }
    
    // Function to play video
    function playVideo(videoId) {
        // Update iframe src
        youtubePlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    
    // Search button click event
    if (youtubeSearchButton && youtubeSearch) {
        youtubeSearchButton.addEventListener('click', async () => {
            const query = youtubeSearch.value.trim();
            if (query) {
                const videos = await searchVideos(query);
                displaySearchResults(videos);
            } else {
                youtubeResults.innerHTML = '<li class="list-group-item">Por favor, ingresa un término de búsqueda.</li>';
            }
        });
        
        // Search on Enter key press
        youtubeSearch.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const query = youtubeSearch.value.trim();
                if (query) {
                    const videos = await searchVideos(query);
                    displaySearchResults(videos);
                } else {
                    youtubeResults.innerHTML = '<li class="list-group-item">Por favor, ingresa un término de búsqueda.</li>';
                }
            }
        });
    }
    
    // Load YouTube API on page load
    loadYouTubeAPI();
});