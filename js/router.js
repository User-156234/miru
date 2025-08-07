/**
 * Simple Hash-based Router for Client-side Navigation
 * Handles routing without page refreshes
 */

class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.init();
    }

    /**
     * Initialize router and set up event listeners
     */
    init() {
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRouteChange());
        window.addEventListener('load', () => this.handleRouteChange());
    }

    /**
     * Register a route with its handler
     */
    route(path, handler) {
        this.routes[path] = handler;
        return this;
    }

    /**
     * Navigate to a specific route
     */
    navigate(path) {
        if (path.startsWith('#')) {
            window.location.hash = path;
        } else {
            window.location.hash = `#${path}`;
        }
    }

    /**
     * Get current route path
     */
    getCurrentPath() {
        return window.location.hash.slice(1) || '/';
    }

    /**
     * Parse route parameters from path
     */
    parseParams(routePath, actualPath) {
        const routeParts = routePath.split('/');
        const actualParts = actualPath.split('/');
        const params = {};

        for (let i = 0; i < routeParts.length; i++) {
            const routePart = routeParts[i];
            const actualPart = actualParts[i];

            if (routePart.startsWith(':')) {
                const paramName = routePart.slice(1);
                params[paramName] = actualPart;
            }
        }

        return params;
    }

    /**
     * Check if a route matches the current path
     */
    matchRoute(routePath, actualPath) {
        const routeParts = routePath.split('/');
        const actualParts = actualPath.split('/');

        if (routeParts.length !== actualParts.length) {
            return false;
        }

        return routeParts.every((part, index) => {
            return part.startsWith(':') || part === actualParts[index];
        });
    }

    /**
     * Handle route changes
     */
    async handleRouteChange() {
        const currentPath = this.getCurrentPath();
        
        // Find matching route
        let matchedRoute = null;
        let params = {};

        for (const [routePath, handler] of Object.entries(this.routes)) {
            if (this.matchRoute(routePath, currentPath)) {
                matchedRoute = handler;
                params = this.parseParams(routePath, currentPath);
                break;
            }
        }

        // Execute route handler or show 404
        if (matchedRoute) {
            this.currentRoute = currentPath;
            try {
                await matchedRoute(params);
            } catch (error) {
                console.error('Route handler error:', error);
                this.show404();
            }
        } else {
            this.show404();
        }
    }

    /**
     * Show 404 page
     */
    show404() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="error-page">
                <div class="error-content">
                    <h1 class="error-title">404</h1>
                    <p class="error-message">Page not found</p>
                    <a href="#/" class="back-button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m15 18-6-6 6-6"/>
                        </svg>
                        Back to Home
                    </a>
                </div>
            </div>
            <style>
                .error-page {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 60vh;
                    text-align: center;
                }
                .error-title {
                    font-size: 6rem;
                    font-weight: 700;
                    background: var(--primary);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 1rem;
                }
                .error-message {
                    font-size: 1.5rem;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 2rem;
                }
            </style>
        `;
    }

    /**
     * Go back to previous page
     */
    goBack() {
        window.history.back();
    }
}

// Create global router instance
window.router = new Router();