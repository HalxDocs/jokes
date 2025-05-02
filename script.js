document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const jokeContainer = document.querySelector('.joke-container');
    const jokeText = document.querySelector('.joke-text');
    const jokeType = document.querySelector('.joke-type');
    const loader = document.querySelector('.loader');
    const getJokeBtn = document.getElementById('getJokeBtn');
    const getProgrammingJokeBtn = document.getElementById('getProgrammingJokeBtn');
    const getDadJokeBtn = document.getElementById('getDadJokeBtn');
    const saveFavoriteBtn = document.getElementById('saveFavoriteBtn');
    const favoritesBtn = document.getElementById('favoritesBtn');
    const favoritesPanel = document.getElementById('favoritesPanel');
    const closeFavoritesBtn = document.getElementById('closeFavoritesBtn');
    const favoritesList = document.getElementById('favoritesList');
    const favoritesCount = document.getElementById('favoritesCount');
    
    // State
    let currentJoke = null;
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    // Update UI
    updateFavoritesUI();
    
    // Event Listeners
    getJokeBtn.addEventListener('click', () => fetchJoke('general'));
    getProgrammingJokeBtn.addEventListener('click', () => fetchJoke('programming'));
    getDadJokeBtn.addEventListener('click', fetchDadJoke);
    saveFavoriteBtn.addEventListener('click', saveFavorite);
    favoritesBtn.addEventListener('click', toggleFavoritesPanel);
    closeFavoritesBtn.addEventListener('click', toggleFavoritesPanel);
    
    // Initial joke
    fetchJoke('general');
    
    // Functions
    async function fetchJoke(type) {
        try {
            showLoader();
            
            let jokeData;
            if (type === 'programming') {
                const response = await fetch('https://v2.jokeapi.dev/joke/Programming?blacklistFlags=nsfw,religious,political,racist,sexist,explicit');
                jokeData = await response.json();
            } else {
                const response = await fetch('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit');
                jokeData = await response.json();
            }
            
            currentJoke = {
                text: jokeData.type === 'twopart' 
                    ? `${jokeData.setup} ... ${jokeData.delivery}`
                    : jokeData.joke,
                type: type
            };
            
            displayJoke(currentJoke);
        } catch (error) {
            jokeText.textContent = "Oops! Couldn't fetch a joke. Try again later.";
            jokeType.textContent = "error";
            console.error("Error fetching joke:", error);
        } finally {
            hideLoader();
        }
    }
    
    async function fetchDadJoke() {
        try {
            showLoader();
            
            const response = await fetch('https://icanhazdadjoke.com/', {
                headers: {
                    'Accept': 'application/json'
                }
            });
            const jokeData = await response.json();
            
            currentJoke = {
                text: jokeData.joke,
                type: 'dad'
            };
            
            displayJoke(currentJoke);
        } catch (error) {
            jokeText.textContent = "Oops! Couldn't fetch a dad joke. Try again later.";
            jokeType.textContent = "error";
            console.error("Error fetching dad joke:", error);
        } finally {
            hideLoader();
        }
    }
    
    function displayJoke(joke) {
        jokeText.textContent = joke.text;
        jokeType.textContent = joke.type;
        
        // Trigger animation
        jokeText.style.animation = 'none';
        void jokeText.offsetWidth; // Trigger reflow
        jokeText.style.animation = 'fadeIn 0.5s forwards';
    }
    
    function showLoader() {
        loader.style.display = 'block';
        jokeText.style.opacity = '0';
    }
    
    function hideLoader() {
        loader.style.display = 'none';
    }
    
    function saveFavorite() {
        if (!currentJoke) return;
        
        // Check if already in favorites
        const isAlreadyFavorite = favorites.some(
            fav => fav.text === currentJoke.text && fav.type === currentJoke.type
        );
        
        if (isAlreadyFavorite) {
            alert('This joke is already in your favorites!');
            return;
        }
        
        favorites.push(currentJoke);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoritesUI();
        
        // Visual feedback
        saveFavoriteBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        setTimeout(() => {
            saveFavoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Save to Favorites';
        }, 2000);
    }
    
    function updateFavoritesUI() {
        favoritesCount.textContent = favorites.length;
        
        if (favorites.length === 0) {
            favoritesList.innerHTML = '<div class="empty-favorites">No favorites yet. Save some jokes!</div>';
            return;
        }
        
        favoritesList.innerHTML = '';
        favorites.forEach((joke, index) => {
            const favoriteItem = document.createElement('div');
            favoriteItem.className = 'favorite-item';
            favoriteItem.innerHTML = `
                <div>
                    <small>${joke.type}</small>
                    <p>${joke.text}</p>
                </div>
                <button class="remove-favorite" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            favoritesList.appendChild(favoriteItem);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-favorite').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removeFavorite(index);
            });
        });
    }
    
    function removeFavorite(index) {
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoritesUI();
    }
    
    function toggleFavoritesPanel() {
        favoritesPanel.classList.toggle('show');
    }
});

// Handle window resize and orientation changes
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);

function checkOrientation() {
    if (window.innerHeight < 500 && window.innerWidth > window.innerHeight) {
        document.body.classList.add('landscape');
    } else {
        document.body.classList.remove('landscape');
    }
}

// Initial check
checkOrientation();