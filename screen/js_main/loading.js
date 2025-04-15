// Loading Screen Handler
class LoadingScreen {
    constructor() {
        this.spinnerModal = document.getElementById('spinnerModal');
        this.initializeLoadingHandlers();
        this.checkBackdropSupport();
    }

    checkBackdropSupport() {
        if (!CSS.supports('backdrop-filter', 'blur(8px)')) {
            // Fallback for browsers that don't support backdrop-filter
            this.spinnerModal.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            const content = this.spinnerModal.querySelector('.spinner-content');
            if (content) {
                content.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            }
        }
    }

    show() {
        this.spinnerModal.style.display = 'flex';
    }

    hide() {
        this.spinnerModal.style.opacity = '0';
        this.spinnerModal.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            this.spinnerModal.style.display = 'none';
            this.spinnerModal.style.opacity = '1';
        }, 500);
    }

    async showLoadingSpinner() {
        this.show();
        return new Promise(resolve => {
            setTimeout(() => {
                this.hide();
                resolve();
            }, 1500); // Shows spinner for 1.5 seconds
        });
    }

    initializeLoadingHandlers() {
        // Handle navigation links
        document.querySelectorAll('a[href]').forEach(link => {
            link.addEventListener('click', async (e) => {
                const href = link.getAttribute('href');
                
                // Don't show spinner for external links, anchor links, or javascript: links
                if (href.startsWith('http') || 
                    href.startsWith('#') || 
                    href.startsWith('javascript:') ||
                    href === '') {
                    return;
                }
                
                e.preventDefault();
                await this.showLoadingSpinner();
                window.location.href = href;
            });
        });

        // Show loading on initial page load
        if (performance.navigation.type !== performance.navigation.TYPE_RELOAD) {
            this.showLoadingSpinner();
        }

        // Handle form submissions
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', async (e) => {
                if (!form.hasAttribute('data-no-loading')) {
                    await this.showLoadingSpinner();
                }
            });
        });
    }
}

// Initialize loading screen when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.loadingScreen = new LoadingScreen();
});