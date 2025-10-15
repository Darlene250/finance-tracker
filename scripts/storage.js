/**
 * localStorage management with import/export functionality
 * Handles data persistence with error recovery
 */

const Storage = {
    // Storage keys
    KEYS: {
        TRANSACTIONS: 'financeTracker:transactions',
        SETTINGS: 'financeTracker:settings',
        MIGRATION: 'financeTracker:migration'
    },

    // Default settings
    DEFAULT_SETTINGS: {
        baseCurrency: 'USD',
        currencies: {
            EUR: 0.85,
            GBP: 0.73,
            JPY: 110.0,
            CAD: 1.25
        },
        budgetCap: 500,
        theme: 'light',
        dateFormat: 'YYYY-MM-DD',
        decimalPlaces: 2
    },

    /**
     * Load transactions from localStorage
     * @returns {Array} Array of transactions
     */
    loadTransactions() {
        try {
            const data = localStorage.getItem(this.KEYS.TRANSACTIONS);
            if (!data) return [];

            const transactions = JSON.parse(data);
            
            // Validate structure
            if (!Array.isArray(transactions)) {
                console.warn('Invalid transactions data structure, resetting...');
                return [];
            }

            // Migrate old data if needed
            return this.migrateTransactions(transactions);
        } catch (error) {
            console.error('Error loading transactions:', error);
            this.handleCorruptedData(this.KEYS.TRANSACTIONS);
            return [];
        }
    },

    /**
     * Save transactions to localStorage
     * @param {Array} transactions - Transactions array
     */
    saveTransactions(transactions) {
        try {
            if (!Array.isArray(transactions)) {
                throw new Error('Transactions must be an array');
            }

            // Validate each transaction
            const validTransactions = transactions.filter(tx => 
                tx && 
                typeof tx.id === 'string' &&
                typeof tx.description === 'string' &&
                typeof tx.amount === 'number' &&
                typeof tx.category === 'string' &&
                typeof tx.date === 'string'
            );

            localStorage.setItem(this.KEYS.TRANSACTIONS, JSON.stringify(validTransactions));
        } catch (error) {
            console.error('Error saving transactions:', error);
            throw new Error('Failed to save transactions: ' + error.message);
        }
    },

    /**
     * Load settings from localStorage
     * @returns {Object} Settings object
     */
    loadSettings() {
        try {
            const data = localStorage.getItem(this.KEYS.SETTINGS);
            if (!data) return { ...this.DEFAULT_SETTINGS };

            const settings = JSON.parse(data);
            
            // Merge with defaults to ensure all properties exist
            return { ...this.DEFAULT_SETTINGS, ...settings };
        } catch (error) {
            console.error('Error loading settings:', error);
            this.handleCorruptedData(this.KEYS.SETTINGS);
            return { ...this.DEFAULT_SETTINGS };
        }
    },

    /**
     * Save settings to localStorage
     * @param {Object} settings - Settings object
     */
    saveSettings(settings) {
        try {
            if (typeof settings !== 'object' || settings === null) {
                throw new Error('Settings must be an object');
            }

            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
            throw new Error('Failed to save settings: ' + error.message);
        }
    },

    /**
     * Handle corrupted data by backing up and resetting
     * @param {string} key - Storage key
     */
    handleCorruptedData(key) {
        try {
            // Backup corrupted data
            const corrupted = localStorage.getItem(key);
            const backupKey = `${key}:corrupted:${Date.now()}`;
            localStorage.setItem(backupKey, corrupted);
            
            // Clear the corrupted data
            localStorage.removeItem(key);
            console.warn(`Corrupted data cleared from ${key}, backup saved to ${backupKey}`);
        } catch (error) {
            console.error('Error handling corrupted data:', error);
        }
    },

    /**
     * Migrate transactions from older versions
     * @param {Array} transactions - Transactions array
     * @returns {Array} Migrated transactions
     */
    migrateTransactions(transactions) {
        const migrationVersion = localStorage.getItem(this.KEYS.MIGRATION) || '1.0';
        
        if (migrationVersion === '1.0') {
            // Add any missing required fields
            transactions = transactions.map(tx => {
                if (!tx.id) {
                    tx.id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                }
                if (!tx.createdAt) {
                    tx.createdAt = new Date().toISOString();
                }
                if (!tx.updatedAt) {
                    tx.updatedAt = new Date().toISOString();
                }
                return tx;
            });

            localStorage.setItem(this.KEYS.MIGRATION, '1.1');
        }

        return transactions;
    },

    /**
     * Export data as JSON string
     * @param {Array} transactions - Transactions to export
     * @returns {string} JSON string
     */
    exportData(transactions) {
        try {
            const exportData = {
                version: '1.0',
                exportedAt: new Date().toISOString(),
                transactions: transactions,
                metadata: {
                    count: transactions.length,
                    totalAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0)
                }
            };

            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('Error exporting data:', error);
            throw new Error('Failed to export data: ' + error.message);
        }
    },

    /**
     * Import data from JSON string
     * @param {string} jsonString - JSON data string
     * @returns {Array} Imported transactions
     */
    importData(jsonString) {
        try {
            if (!jsonString || typeof jsonString !== 'string') {
                throw new Error('Invalid import data');
            }

            const data = JSON.parse(jsonString);
            
            // Support both raw array and structured export format
            let transactions;
            if (Array.isArray(data)) {
                transactions = data;
            } else if (data.transactions && Array.isArray(data.transactions)) {
                transactions = data.transactions;
            } else {
                throw new Error('Invalid data format: expected array or object with transactions array');
            }

            // Validate transaction structure
            const validTransactions = transactions.filter(tx => 
                tx && 
                typeof tx.description === 'string' &&
                typeof tx.amount === 'number' &&
                typeof tx.category === 'string' &&
                typeof tx.date === 'string'
            );

            if (validTransactions.length !== transactions.length) {
                console.warn('Some transactions were invalid and filtered out during import');
            }

            // Generate new IDs and timestamps for imported transactions
            const importedTransactions = validTransactions.map(tx => ({
                ...tx,
                id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: tx.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }));

            return importedTransactions;
        } catch (error) {
            console.error('Error importing data:', error);
            throw new Error('Failed to import data: ' + error.message);
        }
    },

    /**
     * Clear all application data
     */
    clearAllData() {
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.error('Error clearing data:', error);
            throw new Error('Failed to clear data: ' + error.message);
        }
    },

    /**
     * Get storage statistics
     * @returns {Object} Storage stats
     */
    getStats() {
        const stats = {
            totalSize: 0,
            items: {}
        };

        Object.values(this.KEYS).forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                stats.items[key] = {
                    size: new Blob([data]).size,
                    length: data.length
                };
                stats.totalSize += new Blob([data]).size;
            }
        });

        return stats;
    },

    /**
     * Check if storage is available
     * @returns {boolean} Storage availability
     */
    isAvailable() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.error('localStorage not available:', error);
            return false;
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}