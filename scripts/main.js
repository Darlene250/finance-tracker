/**
 * Main application initialization
 * Coordinates all modules and handles application lifecycle
 */

class FinanceTrackerApp {
    constructor() {
        this.state = AppStateInstance;
        this.ui = UIInstance;
        this.initialized = false;
    }

    /**
     * Initialize the application
     */
    async initialize() {
        if (this.initialized) return;

        try {
            console.log('Initializing Finance Tracker Application...');

            // Check for required browser features
            if (!this.checkBrowserSupport()) {
                this.showUnsupportedMessage();
                return;
            }

            // Initialize state management
            await this.state.initialize();

            // Initialize UI
            this.ui.initialize();

            // Subscribe to state changes
            this.state.subscribe((state) => this.handleStateChange(state));

            // Set up error handling
            this.setupErrorHandling();

            // Mark as initialized
            this.initialized = true;

            console.log('Finance Tracker Application initialized successfully');

            // Show welcome message
            setTimeout(() => {
                const transactions = this.state.getState().transactions;
                if (transactions.length === 0) {
                    this.state.showNotification('Welcome! Start by adding your first transaction from the Dashboard.', 'success', 2000);
                }
            }, 1000);

        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showErrorMessage('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Check for required browser features
     */
    checkBrowserSupport() {
        const features = {
            localStorage: !!window.localStorage,
            json: !!window.JSON,
            querySelector: !!document.querySelector,
            addEventListener: !!window.addEventListener,
            classList: !!document.body.classList
        };

        const unsupported = Object.keys(features).filter(key => !features[key]);

        if (unsupported.length > 0) {
            console.warn('Unsupported features:', unsupported);
            return false;
        }

        return true;
    }

    /**
     * Show unsupported browser message
     */
    showUnsupportedMessage() {
        document.body.innerHTML = `
            <div style="padding: 2rem; text-align: center; font-family: sans-serif;">
                <h1>Browser Not Supported</h1>
                <p>This application requires a modern browser with JavaScript enabled.</p>
                <p>Please update your browser or try using Chrome, Firefox, Safari, or Edge.</p>
            </div>
        `;
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #dc2626;
            color: white;
            padding: 1rem;
            text-align: center;
            z-index: 10000;
            font-family: sans-serif;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
    }

    /**
     * Set up global error handling
     */
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.state.showNotification('An unexpected error occurred', 'error');
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.state.showNotification('An unexpected error occurred', 'error');
            event.preventDefault();
        });

        // Network status monitoring
        window.addEventListener('online', () => {
            this.state.showNotification('Connection restored', 'success', 2000);
        });

        window.addEventListener('offline', () => {
            this.state.showNotification('You are currently offline', 'warning', 0);
        });
    }

    /**
     * Handle state changes and update UI
     */
    handleStateChange(state) {
        try {
            this.ui.updateUI(state);
        } catch (error) {
            console.error('Error updating UI:', error);
        }
    }

    /**
     * Application lifecycle methods
     */
    destroy() {
        // Clean up resources
        this.initialized = false;
        console.log('Finance Tracker Application destroyed');
    }

    /**
     * Utility methods for global access
     */
    getState() {
        return this.state.getState();
    }

    showNotification(message, type = 'success') {
        this.state.showNotification(message, type);
    }
}

// Global functions for inline event handlers
window.handleEditChange = function(field, value) {
    if (!window.editData) {
        window.editData = {};
    }
    window.editData[field] = value;
    console.log('Edit change:', field, value, window.editData);
};

window.saveEdit = function(id) {
    console.log('Saving edit for ID:', id, 'Data:', window.editData);
    
    if (!window.editData || Object.keys(window.editData).length === 0) {
        AppStateInstance.showNotification('No changes to save', 'warning');
        return;
    }
    
    // Convert amount to number if it's a field being edited
    if (window.editData.amount) {
        window.editData.amount = parseFloat(window.editData.amount);
    }
    
    const result = AppStateInstance.updateTransaction(id, window.editData);
    console.log('Update result:', result);
    
    if (result.success) {
        window.editData = {};
    }
};

window.deleteTransaction = function(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        AppStateInstance.deleteTransaction(id);
    }
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new FinanceTrackerApp();
    window.financeTrackerApp = app; // Make available globally for debugging
    
    app.initialize().catch(error => {
        console.error('Application initialization failed:', error);
    });
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}