class ApiService {
    constructor() {
        this.baseUrl = 'https://anime-backend-jdc9.onrender.com/api/tmdb';
        this.language = 'en-US';
    }

    

    /**
     * Fetch anime list (TV shows as anime proxy)
     */
    async fetchAnime(searchQuery = '') {
        

        const url = searchQuery
            ? `${this.baseUrl}/anime?q=${encodeURIComponent(searchQuery)}`
            : `${this.baseUrl}/anime`;

        const response = await fetch(url);

        if (!response.ok) {
            console.error('Backend fetch failed:', response.status, response.statusText);
            return { success: false, error: 'Failed to fetch anime' };
        }

        const json = await response.json();
        return json;
    }

    /**
     * Fetch anime details by ID
     */
    async fetchAnimeById(id) {
        

        const response = await fetch(`${this.baseUrl}/anime/${id}`);

        if (!response.ok) {
            console.error('Backend fetch failed:', response.status, response.statusText);
            return { success: false, error: 'Anime not found' };
        }

        const json = await response.json();
        return json;
    }

    /**
     * Fetch episodes for a given anime and season
     */
    async fetchEpisodes(animeId, seasonNumber = 1) {
        

        const response = await fetch(`${this.baseUrl}/anime/${animeId}/season/${seasonNumber}`);

        if (!response.ok) {
            console.error('Backend fetch failed:', response.status, response.statusText);
            return { success: false, error: 'Season not found' };
        }

        const json = await response.json();
        return json;
    }

    /**
     * Search with debounce
     */
    async searchAnime(query, signal) {
       
        if (signal && signal.aborted) throw new Error('Search cancelled');
        return this.fetchAnime(query);
    }
}

// Create API instance
window.api = new ApiService();
