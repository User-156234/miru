// in main.js or index.ts
import { createLoadingGrid, createAnimeCard, createEpisodeCard, showToast, showLoading, hideLoading, openVideoModal, closeVideoModal } from './components.js';


/**
 * Main Application Logic
 * Handles initialization, routing, and main functionality
 */

class AnimeStreamApp {
    constructor() {
        this.searchController = null;
        this.searchTimeout = null;
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.setupRoutes();
        this.setupEventListeners();
        this.setupSearch();
        
        // Set page title
        document.title = 'AnimeStream - Watch Your Favorite Anime';
        
        console.log('AnimeStream App initialized');
    }

    /**
     * Setup application routes
     */
    setupRoutes() {
        router
            .route('/', () => this.renderHomepage())
            .route('/anime/:id', (params) => this.renderAnimeDetails(params.id))
            .route('/search/:query', (params) => this.renderSearchResults(params.query));
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Video modal close button
        const closeModalBtn = document.getElementById('closeVideoModal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeVideoModal);
        }

        // Close modal on overlay click
        const videoModal = document.getElementById('videoModal');
        if (videoModal) {
            videoModal.addEventListener('click', (e) => {
                if (e.target === videoModal || e.target.classList.contains('video-modal-overlay')) {
                    closeVideoModal();
                }
            });
        }

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeVideoModal();
            }
        });
    }

    /**
     * Setup search functionality with debouncing
     */
    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            // Clear previous timeout
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }

            // Cancel previous search request
            if (this.searchController) {
                this.searchController.abort();
            }

            // Debounce search
            this.searchTimeout = setTimeout(() => {
                if (query.length > 0) {
                    this.performSearch(query);
                } else if (router.getCurrentPath().startsWith('/search/')) {
                    // If we're on search page and query is empty, go back to home
                    router.navigate('/');
                }
            }, 300);
        });

        // Handle enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = e.target.value.trim();
                if (query.length > 0) {
                    this.performSearch(query);
                }
            }
        });
    }

    /**
     * Perform search with loading state
     */
    async performSearch(query) {
        try {
            // Create new AbortController for this search
            this.searchController = new AbortController();
            
            // Navigate to search route
            router.navigate(`/search/${encodeURIComponent(query)}`);
            
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Search error:', error);
                showToast('Search failed. Please try again.', 'error');
            }
        }
    }

    /**
     * Render homepage with anime grid
     */
    async renderHomepage() {
        const mainContent = document.getElementById('mainContent');
        
        // Show loading grid
        mainContent.innerHTML = `
            <div class="homepage">
                <section class="hero-section">
                    <h1 class="hero-title">Discover Amazing Anime</h1>
                    <p class="hero-subtitle">
                        Stream thousands of episodes from your favorite anime series. 
                        Enjoy high-quality content with our beautiful streaming platform.
                    </p>
                </section>
                ${createLoadingGrid(12)}
            </div>
        `;

        try {
            // Fetch anime data
            const response = await window.api.fetchAnime();
            
            if (response.success) {
                this.renderAnimeGrid(response.data);
            } else {
                throw new Error('Failed to fetch anime');
            }
        } catch (error) {
            console.error('Error loading homepage:', error);
            mainContent.innerHTML = `
                <div class="homepage">
                    <section class="hero-section">
                        <h1 class="hero-title">Discover Amazing Anime</h1>
                        <p class="hero-subtitle">
                            Stream thousands of episodes from your favorite anime series.
                        </p>
                    </section>
                    <div class="error-message" style="text-align: center; padding: 4rem; color: rgba(255, 255, 255, 0.7);">
                        <p style="font-size: 1.2rem; margin-bottom: 1rem;">Failed to load anime content</p>
                        <button onclick="router.navigate('/')" class="back-button">Try Again</button>
                    </div>
                </div>
            `;
            showToast('Failed to load content', 'error');
        }
    }

    /**
     * Render search results
     */
    async renderSearchResults(query) {
        const mainContent = document.getElementById('mainContent');
        const decodedQuery = decodeURIComponent(query);
        
        // Update search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput && searchInput.value !== decodedQuery) {
            searchInput.value = decodedQuery;
        }

        // Show loading
        mainContent.innerHTML = `
            <div class="homepage">
                <section class="hero-section">
                    <h1 class="hero-title">Search Results</h1>
                    <p class="hero-subtitle">Showing results for: "${decodedQuery}"</p>
                </section>
                ${createLoadingGrid(8)}
            </div>
        `;

        try {
            // Create new AbortController if needed
            if (!this.searchController) {
                this.searchController = new AbortController();
            }

            const response = await window.api.searchAnime(decodedQuery, this.searchController.signal);
            
            if (response.success) {
                // Show results
                mainContent.innerHTML = `
                    <div class="homepage">
                        <section class="hero-section">
                            <h1 class="hero-title">Search Results</h1>
                            <p class="hero-subtitle">
                                Found ${response.data.length} results for: "${decodedQuery}"
                            </p>
                        </section>
                        <div class="anime-grid">
                            ${response.data.length > 0 
                                ? response.data.map(anime => createAnimeCard(anime)).join('')
                                : '<div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: rgba(255, 255, 255, 0.7);"><p style="font-size: 1.2rem;">No anime found matching your search.</p></div>'
                            }
                        </div>
                    </div>
                `;
            } else {
                throw new Error('Search failed');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Search error:', error);
                showToast('Search failed. Please try again.', 'error');
                router.navigate('/');
            }
        }
    }

    /**
     * Render anime grid
     */
    renderAnimeGrid(animeList) {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="homepage">
                <section class="hero-section">
                    <h1 class="hero-title">Discover Amazing Anime</h1>
                    <p class="hero-subtitle">
                        Stream thousands of episodes from your favorite anime series. 
                        Enjoy high-quality content with our beautiful streaming platform.
                    </p>
                </section>
                <div class="anime-grid">
                    ${animeList.map(anime => createAnimeCard(anime)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render anime details page
     */
    async renderAnimeDetails(animeId) {
        const mainContent = document.getElementById('mainContent');
        
        showLoading();

        try {
            // Fetch anime details and episodes in parallel
            const [animeResponse, episodesResponse] = await Promise.all([
                window.api.fetchAnimeById(animeId),
                window.api.fetchEpisodes(animeId)
            ]);

            hideLoading();

            if (!animeResponse.success) {
                throw new Error('Anime not found');
            }

            if (!episodesResponse.success) {
                throw new Error('Episodes not found');
            }

            const anime = animeResponse.data;
            const episodes = episodesResponse.data;

            // Render details page
            mainContent.innerHTML = `
                <div class="details-page">
                    <a href="#/" class="back-button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m15 18-6-6 6-6"/>
                        </svg>
                        Back to Home
                    </a>

                    <div class="anime-header">
                        <div class="anime-poster">
                            <img src="${anime.poster}" alt="${anime.title}">
                        </div>
                        <div class="anime-info">
                            <h1 class="anime-title">${anime.title}</h1>
                            <div class="anime-meta">
                                <div class="meta-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                    ${anime.rating}/10
                                </div>
                                <div class="meta-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                        <line x1="16" y1="2" x2="16" y2="6"/>
                                        <line x1="8" y1="2" x2="8" y2="6"/>
                                        <line x1="3" y1="10" x2="21" y2="10"/>
                                    </svg>
                                    ${anime.year}
                                </div>
                                <div class="meta-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                        <polyline points="14,2 14,8 20,8"/>
                                    </svg>
                                    ${anime.episodes} Episodes
                                </div>
                                <div class="meta-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12,6 12,12 16,14"/>
                                    </svg>
                                    ${anime.status}
                                </div>
                            </div>
                            <div class="anime-card-genres" style="margin-bottom: 1.5rem;">
                                ${anime.genres.map(genre => `<span class="genre-tag">${genre}</span>`).join('')}
                            </div>
                            <p class="anime-synopsis">${anime.synopsis}</p>
                        </div>
                    </div>

                    <section class="episodes-section">
                        <h2 class="section-title">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="23 7 16 12 23 17 23 7"/>
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                            </svg>
                            Episodes (${episodes.length})
                        </h2>
                        <div class="episodes-grid">
                            ${episodes.map(episode => createEpisodeCard(episode)).join('')}
                        </div>
                    </section>
                </div>
            `;

        } catch (error) {
            hideLoading();
            console.error('Error loading anime details:', error);
            
            mainContent.innerHTML = `
                <div class="details-page">
                    <a href="#/" class="back-button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m15 18-6-6 6-6"/>
                        </svg>
                        Back to Home
                    </a>
                    <div class="error-message" style="text-align: center; padding: 4rem;">
                        <h2 style="color: #ef4444; margin-bottom: 1rem;">Anime Not Found</h2>
                        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
                            The anime you're looking for doesn't exist or couldn't be loaded.
                        </p>
                        <a href="#/" class="back-button">Return to Homepage</a>
                    </div>
                </div>
            `;
            showToast('Failed to load anime details', 'error');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AnimeStreamApp();
});

// Make functions globally available for onclick handlers
window.openVideoModal = openVideoModal;
window.closeVideoModal = closeVideoModal;