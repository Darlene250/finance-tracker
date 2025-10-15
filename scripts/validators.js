/**
         * Validation utilities
         */
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

        /**
         * Search engine for regex-based searching with highlighting
         */
        class SearchEngine {
            static search(items, searchTerm) {
                if (!searchTerm || searchTerm.trim() === '') {
                    return items;
                }

                try {
                    const regex = new RegExp(searchTerm, 'gi');
                    return items.filter(item => {
                        return regex.test(item.description) ||
                               regex.test(item.category) ||
                               regex.test(item.amount.toString()) ||
                               regex.test(item.date);
                    });
                } catch (error) {
                    // If regex is invalid, fall back to simple string search
                    const lowerTerm = searchTerm.toLowerCase();
                    return items.filter(item => {
                        return item.description.toLowerCase().includes(lowerTerm) ||
                               item.category.toLowerCase().includes(lowerTerm) ||
                               item.amount.toString().includes(lowerTerm) ||
                               item.date.includes(lowerTerm);
                    });
                }
            }

            static highlightMatches(text, searchTerm) {
                if (!searchTerm || searchTerm.trim() === '') {
                    return text;
                }

                try {
                    const regex = new RegExp(`(${searchTerm})`, 'gi');
                    return text.replace(regex, '<span class="highlight">$1</span>');
                } catch (error) {
                    // If regex is invalid, fall back to simple highlighting
                    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(`(${escapedTerm})`, 'gi');
                    return text.replace(regex, '<span class="highlight">$1</span>');
                }
            }
        }