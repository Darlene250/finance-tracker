/**
 * Centralized state management with observer pattern
 * Manages application state and notifies subscribers of changes
 */

// Simple validation functions (fallback if validators.js is not available)
function validateField(field, value) {
    switch (field) {
        case 'description':
            if (!value || value.trim().length === 0) {
                return 'Description is required';
            }
            if (value.trim().length < 2) {
                return 'Description must be at least 2 characters';
            }
            if (value.trim().length > 100) {
                return 'Description must be less than 100 characters';
            }
            return null;

        case 'amount':
            if (!value || value.toString().trim().length === 0) {
                return 'Amount is required';
            }
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
                return 'Amount must be a valid number';
            }
            if (numValue <= 0) {
                return 'Amount must be greater than 0';
            }
            if (numValue > 999999) {
                return 'Amount must be less than 1,000,000';
            }
            return null;

        case 'date':
            if (!value) {
                return 'Date is required';
            }
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return 'Please enter a valid date';
            }
            const today = new Date();
            const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
            const oneYearFromNow = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
            
            if (date < oneYearAgo) {
                return 'Date cannot be more than 1 year ago';
            }
            if (date > oneYearFromNow) {
                return 'Date cannot be more than 1 year in the future';
            }
            return null;

        case 'category':
            const validCategories = ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other'];
            if (!validCategories.includes(value)) {
                return 'Please select a valid category';
            }
            return null;

        default:
            return null;
    }
}

function validateTransaction(transaction) {
    const errors = {};
    const fields = ['description', 'amount', 'category', 'date'];
    
    fields.forEach(field => {
        const error = validateField(field, transaction[field]);
        if (error) {
            errors[field] = error;
        }
    });
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

class AppState {
    constructor() {
        this.state = {
            transactions: [],
            settings: {},
            currentPage: 'home',
            searchTerm: '',
            sortConfig: { key: 'date', direction: 'desc' },
            editingId: null,
            notification: null,
            loading: false,
            errors: {}
        };

        this.subscribers = [];
        this.initialized = false;
    }

    /**
     * Initialize state from storage
     */
    async initialize() {
        if (this.initialized) return;

        try {
            this.setState({ loading: true });

            // Load initial data
            const transactions = Storage.loadTransactions();
            const settings = Storage.loadSettings();

            this.setState({
                transactions,
                settings,
                loading: false
            });

            this.initialized = true;

            // Apply theme
            this.applyTheme(settings.theme);

        } catch (error) {
            console.error('Failed to initialize state:', error);
            this.setState({ 
                loading: false,
                errors: { initialization: 'Failed to load application data' }
            });
        }
    }

    /**
     * Subscribe to state changes
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.subscribers.push(callback);
        
        // Return unsubscribe function
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    /**
     * Notify all subscribers of state changes
     */
    notifySubscribers() {
        this.subscribers.forEach(callback => {
            try {
                callback(this.state);
            } catch (error) {
                console.error('Error in state subscriber:', error);
            }
        });
    }

    /**
     * Update state and notify subscribers
     * @param {Object} updates - State updates
     */
    setState(updates) {
        const previousState = { ...this.state };
        
        this.state = {
            ...this.state,
            ...updates
        };

        // Notify subscribers if state actually changed
        if (JSON.stringify(previousState) !== JSON.stringify(this.state)) {
            this.notifySubscribers();
        }
    }

    /**
     * Get current state
     * @returns {Object} Current state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Navigation actions
     */
    navigateTo(page) {
        if (this.state.currentPage !== page) {
            this.setState({ 
                currentPage: page,
                editingId: null // Cancel any active editing
            });
        }
    }

    /**
     * Transaction actions
     */
    addTransaction(transaction) {
        try {
            const newTransaction = {
                id: Date.now().toString(),
                ...transaction,
                amount: parseFloat(transaction.amount)
            };

            this.state.transactions.push(newTransaction);
            this.saveState();
            this.showNotification('Transaction added successfully', 'success');
            this.notifySubscribers();
            
            return { success: true };
        } catch (error) {
            console.error('Failed to add transaction:', error);
            this.showNotification('Failed to add transaction', 'error');
            return { success: false, error: error.message };
        }
    }

    updateTransaction(id, updates) {
        try {
            const index = this.state.transactions.findIndex(t => t.id === id);
            if (index === -1) {
                throw new Error('Transaction not found');
            }

            const transaction = this.state.transactions[index];
            this.state.transactions[index] = {
                ...transaction,
                ...updates,
                amount: updates.amount ? parseFloat(updates.amount) : transaction.amount
            };

            this.saveState();
            this.cancelEditing();
            this.showNotification('Transaction updated successfully', 'success');
            this.notifySubscribers();
            
            return { success: true };
        } catch (error) {
            console.error('Failed to update transaction:', error);
            this.showNotification('Failed to update transaction', 'error');
            return { success: false, error: error.message };
        }
    }

    deleteTransaction(id) {
        try {
            const index = this.state.transactions.findIndex(t => t.id === id);
            if (index === -1) {
                throw new Error('Transaction not found');
            }

            this.state.transactions.splice(index, 1);
            this.saveState();
            this.showNotification('Transaction deleted successfully', 'success');
            this.notifySubscribers();
            
            return { success: true };
        } catch (error) {
            console.error('Failed to delete transaction:', error);
            this.showNotification('Failed to delete transaction', 'error');
            return { success: false, error: error.message };
        }
    }

    // Editing state
    startEditing(id) {
        this.state.editingId = id;
        window.editData = {};
        
        // Populate edit data with current transaction values
        const transaction = this.state.transactions.find(t => t.id === id);
        if (transaction) {
            window.editData = { ...transaction };
        }
        
        this.notifySubscribers();
    }

    cancelEditing() {
        this.state.editingId = null;
        window.editData = {};
        this.notifySubscribers();
    }

    saveState() {
        Storage.saveTransactions(this.state.transactions);
    }

    /**
     * Search and sort actions
     */
    setSearchTerm(term) {
        this.setState({ searchTerm: term });
    }

    setSortConfig(key, direction = null) {
        const currentConfig = this.state.sortConfig;
        
        if (direction) {
            this.setState({ sortConfig: { key, direction } });
        } else {
            // Toggle direction if same key, otherwise set to desc
            const newDirection = currentConfig.key === key && currentConfig.direction === 'asc' 
                ? 'desc' 
                : 'asc';
            
            this.setState({ sortConfig: { key, direction: newDirection } });
        }
    }

    /**
     * Settings actions
     */
    updateSettings(updates) {
        try {
            const newSettings = { ...this.state.settings, ...updates };
            
            Storage.saveSettings(newSettings);
            this.setState({ settings: newSettings });

            // Apply theme immediately if it changed
            if (updates.theme && updates.theme !== this.state.settings.theme) {
                this.applyTheme(updates.theme);
            }
            
            // Only show notification for non-theme changes
            if (!updates.theme) {
                this.showNotification('Settings updated successfully');
            }
            return { success: true };

        } catch (error) {
            console.error('Error updating settings:', error);
            this.showNotification('Failed to update settings', 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * Data management actions
     */
    exportData() {
        try {
            const exportString = Storage.exportData(this.state.transactions);
            const blob = new Blob([exportString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `finance-tracker-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            this.showNotification('Data exported successfully');
            
            return { success: true };

        } catch (error) {
            console.error('Error exporting data:', error);
            this.showNotification('Failed to export data', 'error');
            return { success: false, error: error.message };
        }
    }

    importData(jsonString) {
        try {
            const importedTransactions = Storage.importData(jsonString);
            const updatedTransactions = [...this.state.transactions, ...importedTransactions];
            
            Storage.saveTransactions(updatedTransactions);
            this.setState({ transactions: updatedTransactions });
            
            this.showNotification(`Successfully imported ${importedTransactions.length} transactions`);
            return { success: true, count: importedTransactions.length };

        } catch (error) {
            console.error('Error importing data:', error);
            this.showNotification('Failed to import data: ' + error.message, 'error');
            return { success: false, error: error.message };
        }
    }

    clearAllData() {
        try {
            Storage.clearAllData();
            this.setState({ 
                transactions: [],
                searchTerm: '',
                editingId: null 
            });
            
            this.showNotification('All data cleared successfully');
            return { success: true };

        } catch (error) {
            console.error('Error clearing data:', error);
            this.showNotification('Failed to clear data', 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * Notification system
     */
    showNotification(message, type = 'success', duration = 3000) {
        this.setState({ 
            notification: { message, type, duration } 
        });

        // Auto-hide notification
        if (duration > 0) {
            setTimeout(() => {
                if (this.state.notification && this.state.notification.message === message) {
                    this.setState({ notification: null });
                }
            }, duration);
        }
    }

    hideNotification() {
        this.setState({ notification: null });
    }

    /**
     * Utility methods
     */
    applyTheme(theme) {
        // Apply theme immediately to the document
        document.documentElement.setAttribute('data-theme', theme);
        
        // Force a reflow to ensure the change is applied immediately
        document.documentElement.offsetHeight;
        
        // Also update the body class for immediate visual feedback
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${theme}`);
    }

    /**
     * Computed state getters
     */
    getFilteredTransactions() {
        const { transactions, searchTerm, sortConfig } = this.state;
        
        // Filter transactions
        let filtered = transactions;
        if (searchTerm) {
            // Simple fallback search since SearchEngine might not be available
            const lowerTerm = searchTerm.toLowerCase();
            filtered = transactions.filter(transaction => 
                transaction.description.toLowerCase().includes(lowerTerm) ||
                transaction.category.toLowerCase().includes(lowerTerm) ||
                transaction.amount.toString().includes(lowerTerm) ||
                transaction.date.includes(lowerTerm)
            );
        }
        
        // Sort transactions
        filtered.sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];
            
            if (sortConfig.key === 'amount') {
                aVal = parseFloat(aVal);
                bVal = parseFloat(bVal);
            }
            
            if (sortConfig.key === 'date') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }
            
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        
        return filtered;
    }

    getDashboardStats() {
        const transactions = this.state.transactions;
        const settings = this.state.settings;
        
        const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
        const totalCount = transactions.length;
        
        // Category totals
        const categoryTotals = transactions.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});
        
        const categoryCounts = transactions.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + 1;
            return acc;
        }, {});
        
        const topCategory = Object.keys(categoryCounts).sort((a, b) => 
            categoryCounts[b] - categoryCounts[a]
        )[0] || 'None';
        
        // Weekly trend
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toISOString().split('T')[0];
        });

        const dailyTotals = last7Days.map(date => {
            const dayTotal = transactions
                .filter(t => t.date === date)
                .reduce((sum, t) => sum + t.amount, 0);
            return { date, total: dayTotal };
        });

        const maxDaily = Math.max(...dailyTotals.map(d => d.total), 1);

        // Budget status
        const budgetRemaining = settings.budgetCap - totalSpent;
        const budgetStatus = budgetRemaining >= 0 ? 'under' : 'over';
        const budgetPercentage = settings.budgetCap > 0 
            ? Math.min((totalSpent / settings.budgetCap) * 100, 100) 
            : 0;

        return {
            totalSpent,
            totalCount,
            categoryTotals,
            categoryCounts,
            topCategory,
            dailyTotals,
            maxDaily,
            budgetRemaining,
            budgetStatus,
            budgetPercentage
        };
    }

    /**
     * Error handling
     */
    setError(key, message) {
        this.setState({
            errors: { ...this.state.errors, [key]: message }
        });
    }

    clearError(key) {
        const errors = { ...this.state.errors };
        delete errors[key];
        this.setState({ errors });
    }

    clearAllErrors() {
        this.setState({ errors: {} });
    }
}

// Create global state instance
const AppStateInstance = new AppState();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppStateInstance;
}