/**
 * Reusable UI Components
 * Contains functions to generate common UI elements
 */

/**
 * Create anime card component
 */
function createAnimeCard(anime) {
    return `
        <div class="anime-card" onclick="router.navigate('/anime/${anime.id}')" data-anime-id="${anime.id}">
            <div class="anime-card-image">
                <img src="${anime.poster}" alt="${anime.title}" loading="lazy">
                <div class="anime-card-overlay"></div>
                <div class="anime-card-rating">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    ${anime.rating}
                </div>
            </div>
            <div class="anime-card-content">
                <h3 class="anime-card-title">${anime.title}</h3>
                <div class="anime-card-genres">
                    ${anime.genres.map(genre => `<span class="genre-tag">${genre}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

/**
 * Create episode card component
 */
function createEpisodeCard(episode) {
    return `
        <div class="episode-card" onclick="openVideoModal('${episode.title}', '${episode.videoUrl}')" data-episode-id="${episode.id}">
            <div class="episode-thumbnail">
                <img src="${episode.thumbnail}" alt="${episode.title}" loading="lazy">
                <div class="episode-duration">${episode.duration}</div>
            </div>
            <div class="episode-info">
                <div class="episode-number">Episode ${episode.episodeNumber}</div>
                <div class="episode-title">${episode.title}</div>
            </div>
        </div>
    `;
}

/**
 * Create skeleton loading card
 */
function createSkeletonCard() {
    return `
        <div class="skeleton-card">
            <div class="skeleton skeleton-image"></div>
            <div class="skeleton-content">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text short"></div>
            </div>
        </div>
    `;
}

/**
 * Create loading grid
 */
function createLoadingGrid(count = 12) {
    const skeletons = Array.from({ length: count }, () => createSkeletonCard()).join('');
    return `
        <div class="anime-grid">
            ${skeletons}
        </div>
    `;
}

/**
 * Show loading overlay
 */
function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.add('active');
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('active');
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `;

    // Add toast styles
    const toastStyles = `
        <style>
            .toast {
                position: fixed;
                top: 120px;
                right: 20px;
                z-index: 1001;
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: var(--radius-lg);
                backdrop-filter: blur(20px);
                padding: var(--space-4);
                max-width: 300px;
                animation: slideIn 0.3s ease-out;
            }
            .toast-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--space-3);
            }
            .toast-message {
                color: var(--white);
                font-size: var(--font-size-sm);
            }
            .toast-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.7);
                cursor: pointer;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .toast-close:hover {
                color: var(--white);
            }
            .toast-error {
                border-color: rgba(239, 68, 68, 0.5);
            }
            .toast-success {
                border-color: rgba(16, 185, 129, 0.5);
            }
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        </style>
    `;

    // Add styles if not already added
    if (!document.querySelector('#toast-styles')) {
        const styleElement = document.createElement('div');
        styleElement.id = 'toast-styles';
        styleElement.innerHTML = toastStyles;
        document.head.appendChild(styleElement);
    }

    document.body.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

/**
 * Open video modal
 */
function openVideoModal(title, videoUrl) {
    const modal = document.getElementById('videoModal');
    const videoPlayer = document.getElementById('videoPlayer');
    
    // For demo purposes, show a placeholder
    videoPlayer.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <h3 style="margin-bottom: 1rem; color: #667eea;">${title}</h3>
            <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
                Video player would be embedded here<br>
                <small>URL: ${videoUrl}</small>
            </p>
            <div style="background: rgba(102, 126, 234, 0.2); padding: 2rem; border-radius: 8px; border: 2px dashed rgba(102, 126, 234, 0.5);">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="color: #667eea; margin-bottom: 1rem;">
                    <polygon points="5,3 19,12 5,21 5,3"></polygon>
                </svg>
                <p style="color: rgba(255, 255, 255, 0.5);">Video Placeholder</p>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Close video modal
 */
function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const videoPlayer = document.getElementById('videoPlayer');
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    videoPlayer.innerHTML = '';
}

/**
 * Initialize background particles
 */
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size between 2-6px
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random animation delay and duration
        particle.style.animationDelay = `${Math.random() * 6}s`;
        particle.style.animationDuration = `${Math.random() * 4 + 4}s`;
        
        particlesContainer.appendChild(particle);
    }
}

// Initialize particles when DOM is loaded
document.addEventListener('DOMContentLoaded', initParticles);