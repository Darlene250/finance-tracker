/**
 * Advanced regex-powered search with highlighting
 * Includes safety checks and performance optimizations
 */

const SearchEngine = {
    // Search configuration
    config: {
        maxPatternLength: 100,
        timeout: 50, // ms
        highlightClass: 'highlight'
    },

    /**
     * Safe regex compilation with performance guards
     * @param {string} pattern - Search pattern
     * @param {string} flags - Regex flags
     * @returns {RegExp|null} Compiled regex or null if unsafe
     */
    compileSearchPattern(pattern, flags = 'i') {
        if (!pattern || pattern.trim() === '') {
            return null;
        }

        const trimmed = pattern.trim();

        // Length check
        if (trimmed.length > this.config.maxPatternLength) {
            console.warn('Search pattern too long');
            return null;
        }

        // Safety checks
        if (this.isPatternDangerous(trimmed)) {
            console.warn('Potentially dangerous search pattern detected');
            return null;
        }

        try {
            // Test compilation and performance
            return this.testPatternPerformance(trimmed, flags);
        } catch (error) {
            console.warn('Invalid search pattern:', error.message);
            return null;
        }
    },

    /**
     * Check for potentially dangerous patterns
     * @param {string} pattern - Regex pattern
     * @returns {boolean} True if pattern is dangerous
     */
    isPatternDangerous(pattern) {
        const dangerousIndicators = [
            // Catastrophic backtracking patterns
            /\([^)]*\([^)]*\([^)]*\([^)]*\(/, // Deep nesting
            /(\w+\s*){20,}/, // Excessive repetition
            /\.\*\.\*\.\*/, // Multiple wildcards
            /\\?[\s\S]*\\?[\s\S]*\\?[\s\S]*\\?[\s\S]*/, // Multiple complex segments
            
            // Potentially expensive patterns
            /\\b\w*\\b\w*\\b\w*\\b/, // Multiple word boundaries
            /^\s*[\s\S]{100,}\s*$/, // Very long patterns
            
            // Recursive-like patterns
            /\(\?R\)/, // Recursive patterns
            /\\1\\2\\3/, // Multiple backreferences
        ];

        return dangerousIndicators.some(indicator => indicator.test(pattern));
    },

    /**
     * Test pattern performance with timeout
     * @param {string} pattern - Regex pattern
     * @param {string} flags - Regex flags
     * @returns {RegExp|null} Safe regex or null
     */
    testPatternPerformance(pattern, flags) {
        const regex = new RegExp(pattern, flags);
        
        // Performance test with sample data
        const testCases = [
            'sample transaction description',
            '123.45',
            'Food',
            '2024-01-01',
            'a'.repeat(50), // Long string
            'test@example.com' // Complex string
        ];

        const startTime = performance.now();
        
        try {
            for (const testCase of testCases) {
                regex.test(testCase);
                
                // Check timeout
                if (performance.now() - startTime > this.config.timeout) {
                    console.warn('Search pattern too slow');
                    return null;
                }
            }
        } catch (error) {
            console.warn('Pattern test failed:', error);
            return null;
        }

        return regex;
    },

    /**
     * Search transactions with regex pattern
     * @param {Array} transactions - Transactions to search
     * @param {string} searchTerm - Search term (regex pattern)
     * @returns {Array} Filtered transactions
     */
    searchTransactions(transactions, searchTerm) {
        if (!searchTerm || !transactions || !Array.isArray(transactions)) {
            return transactions || [];
        }

        const regex = this.compileSearchPattern(searchTerm);
        if (!regex) {
            // Fallback to simple text search if regex fails
            return this.fallbackSearch(transactions, searchTerm);
        }

        try {
            return transactions.filter(transaction => 
                this.matchesTransaction(transaction, regex)
            );
        } catch (error) {
            console.error('Search error:', error);
            return this.fallbackSearch(transactions, searchTerm);
        }
    },

    /**
     * Check if transaction matches search pattern
     * @param {Object} transaction - Transaction object
     * @param {RegExp} regex - Search regex
     * @returns {boolean} True if matches
     */
    matchesTransaction(transaction, regex) {
        const searchableFields = [
            transaction.description,
            transaction.category,
            transaction.amount.toString(),
            transaction.date
        ];

        return searchableFields.some(field => 
            field && regex.test(field.toString())
        );
    },

    /**
     * Fallback simple text search
     * @param {Array} transactions - Transactions to search
     * @param {string} searchTerm - Search term
     * @returns {Array} Filtered transactions
     */
    fallbackSearch(transactions, searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        
        return transactions.filter(transaction => 
            transaction.description.toLowerCase().includes(lowerSearch) ||
            transaction.category.toLowerCase().includes(lowerSearch) ||
            transaction.amount.toString().includes(lowerSearch) ||
            transaction.date.includes(lowerSearch)
        );
    },

    /**
     * Highlight matches in text with safe HTML
     * @param {string} text - Text to highlight
     * @param {string} searchTerm - Search term
     * @returns {string} HTML string with highlights
     */
    highlightMatches(text, searchTerm) {
        if (!text || !searchTerm) {
            return this.escapeHtml(text);
        }

        const regex = this.compileSearchPattern(searchTerm);
        if (!regex) {
            return this.escapeHtml(text);
        }

        try {
            const escapedText = this.escapeHtml(text);
            return escapedText.replace(regex, match => 
                `<mark class="${this.config.highlightClass}">${this.escapeHtml(match)}</mark>`
            );
        } catch (error) {
            console.error('Highlight error:', error);
            return this.escapeHtml(text);
        }
    },

    /**
     * Escape HTML for safe rendering
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (!text) return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Advanced search with field-specific patterns
     * @param {Array} transactions - Transactions to search
     * @param {Object} searchOptions - Search options
     * @returns {Array} Filtered transactions
     */
    advancedSearch(transactions, searchOptions) {
        const { 
            term = '', 
            field = 'all',
            minAmount = null,
            maxAmount = null,
            startDate = null,
            endDate = null,
            categories = []
        } = searchOptions;

        let results = [...transactions];

        // Text search
        if (term) {
            if (field === 'all') {
                results = this.searchTransactions(results, term);
            } else {
                const regex = this.compileSearchPattern(term);
                if (regex) {
                    results = results.filter(tx => 
                        tx[field] && regex.test(tx[field].toString())
                    );
                }
            }
        }

        // Amount range filter
        if (minAmount !== null) {
            results = results.filter(tx => tx.amount >= minAmount);
        }
        if (maxAmount !== null) {
            results = results.filter(tx => tx.amount <= maxAmount);
        }

        // Date range filter
        if (startDate) {
            results = results.filter(tx => tx.date >= startDate);
        }
        if (endDate) {
            results = results.filter(tx => tx.date <= endDate);
        }

        // Category filter
        if (categories.length > 0) {
            results = results.filter(tx => categories.includes(tx.category));
        }

        return results;
    },

    /**
     * Get search suggestions based on transaction data
     * @param {Array} transactions - Transactions data
     * @param {string} partialTerm - Partial search term
     * @returns {Array} Search suggestions
     */
    getSearchSuggestions(transactions, partialTerm) {
        if (!partialTerm || partialTerm.length < 2) {
            return [];
        }

        const suggestions = new Set();
        const lowerTerm = partialTerm.toLowerCase();

        transactions.forEach(transaction => {
            // Description suggestions
            if (transaction.description.toLowerCase().includes(lowerTerm)) {
                suggestions.add(transaction.description);
            }

            // Category suggestions
            if (transaction.category.toLowerCase().includes(lowerTerm)) {
                suggestions.add(transaction.category);
            }

            // Amount suggestions (exact matches)
            if (transaction.amount.toString().includes(partialTerm)) {
                suggestions.add(transaction.amount.toString());
            }
        });

        return Array.from(suggestions).slice(0, 10); // Limit to 10 suggestions
    },

    /**
     * Parse search query for advanced features
     * @param {string} query - Search query
     * @returns {Object} Parsed search options
     */
    parseSearchQuery(query) {
        const options = {
            term: '',
            field: 'all',
            minAmount: null,
            maxAmount: null,
            startDate: null,
            endDate: null,
            categories: []
        };

        if (!query) return options;

        // Field-specific searches (e.g., "category:food", "amount:>50")
        const fieldPatterns = {
            category: /category:(\w+)/i,
            amount: /amount:([<>]=?)?(\d+(?:\.\d{1,2})?)/i,
            date: /date:(\d{4}-\d{2}-\d{2})/i,
            description: /description:"([^"]+)"/i
        };

        let remainingQuery = query;

        // Extract field-specific patterns
        Object.entries(fieldPatterns).forEach(([field, pattern]) => {
            const match = remainingQuery.match(pattern);
            if (match) {
                remainingQuery = remainingQuery.replace(pattern, '').trim();
                
                switch (field) {
                    case 'category':
                        options.categories.push(match[1]);
                        break;
                    case 'amount':
                        const operator = match[1] || '=';
                        const value = parseFloat(match[2]);
                        if (operator === '>') options.minAmount = value;
                        else if (operator === '<') options.maxAmount = value;
                        else if (operator === '>=') options.minAmount = value;
                        else if (operator === '<=') options.maxAmount = value;
                        break;
                    case 'date':
                        options.startDate = match[1];
                        options.endDate = match[1];
                        break;
                    case 'description':
                        options.term = match[1];
                        options.field = 'description';
                        break;
                }
            }
        });

        // Remaining text is the general search term
        if (remainingQuery && !options.term) {
            options.term = remainingQuery;
        }

        return options;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchEngine;
}