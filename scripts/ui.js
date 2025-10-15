/**
 * DOM rendering and user interface management
 * Handles all UI updates and user interactions
 */

class UI {
    constructor() {
        this.elements = {};
        this.currentFormData = {};
        this.formErrors = {};
    }

    /**
     * Initialize UI components
     */
    initialize() {
        this.cacheElements();
        this.initializeEventListeners();
        this.renderHomePage();
    }

    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        this.elements = {
            // Navigation
            navHome: document.getElementById('navHome'),
            navDashboard: document.getElementById('navDashboard'),
            navRecords: document.getElementById('navRecords'),
            navSettings: document.getElementById('navSettings'),
            
            // Pages
            pageHome: document.getElementById('pageHome'),
            pageDashboard: document.getElementById('pageDashboard'),
            pageRecords: document.getElementById('pageRecords'),
            pageSettings: document.getElementById('pageSettings'),
            
            // Notification
            notification: document.getElementById('notification'),
            
            // Theme toggle
            themeToggle: document.getElementById('themeToggle'),
            
            // File import
            fileImport: document.getElementById('fileImport')
        };
    }

    /**
     * Initialize global event listeners
     */
    initializeEventListeners() {
        // Navigation
        this.elements.navHome.addEventListener('click', () => this.handleNavigation('home'));
        this.elements.navDashboard.addEventListener('click', () => this.handleNavigation('dashboard'));
        this.elements.navRecords.addEventListener('click', () => this.handleNavigation('records'));
        this.elements.navSettings.addEventListener('click', () => this.handleNavigation('settings'));

        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => this.handleThemeToggle());

        // File import
        this.elements.fileImport.addEventListener('change', (e) => this.handleFileImport(e));

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Close notification on click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.notification')) {
                AppStateInstance.hideNotification();
            }
        });
    }

    /**
     * Handle navigation between pages
     * @param {string} page - Page to navigate to
     */
    handleNavigation(page) {
        AppStateInstance.navigateTo(page);
    }

    /**
 * Handle theme toggle
 */
handleThemeToggle() {
    const currentTheme = AppStateInstance.getState().settings.theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Update settings without showing notification
    AppStateInstance.updateSettings({ theme: newTheme });
    
    // Apply theme immediately
    this.applyTheme(newTheme);
}

/**
 * Apply theme to document
 */
applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update theme toggle button appearance
    const themeToggle = this.elements.themeToggle;
    const moonIcon = themeToggle.querySelector('.moon-icon');
    const sunIcon = themeToggle.querySelector('.sun-icon');

    if (theme === 'dark') {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
        themeToggle.setAttribute('aria-label', 'Switch to light mode');
    } else {
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
        themeToggle.setAttribute('aria-label', 'Switch to dark mode');
    }
}

    /**
     * Handle file import
     * @param {Event} e - File input event
     */
    handleFileImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                AppStateInstance.importData(event.target.result);
            } catch (error) {
                AppStateInstance.showNotification('Failed to import file: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);

        // Reset file input
        e.target.value = '';
    }

    /**
     * Handle global keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardShortcuts(e) {
        // Only handle shortcuts when no input is focused
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
            return;
        }

        const ctrlKey = e.ctrlKey || e.metaKey;

        switch (e.key) {
            case '1':
                if (ctrlKey) {
                    e.preventDefault();
                    this.handleNavigation('home');
                }
                break;
            case '2':
                if (ctrlKey) {
                    e.preventDefault();
                    this.handleNavigation('dashboard');
                }
                break;
            case '3':
                if (ctrlKey) {
                    e.preventDefault();
                    this.handleNavigation('records');
                }
                break;
            case '4':
                if (ctrlKey) {
                    e.preventDefault();
                    this.handleNavigation('settings');
                }
                break;
            case 'Escape':
                AppStateInstance.cancelEditing();
                AppStateInstance.hideNotification();
                break;
            case '/':
                if (!e.ctrlKey) {
                    e.preventDefault();
                    const searchInput = document.querySelector('#searchInput');
                    if (searchInput) {
                        searchInput.focus();
                    }
                }
                break;
        }
    }

    /**
     * Render methods for each page
     */
    renderHomePage() {
        const html = `
            <div class="page-home">
                <section class="hero">
                    <h2 id="homeTitle">Welcome to Student Finance Tracker</h2>
                    <p class="lead">
                        A professional, accessible tool designed to help students manage their spending effectively.
                        Track transactions, set budgets, analyze spending patterns, and maintain financial awareness.
                    </p>
                </section>

                <section class="features">
                    <h3>Key Features</h3>
                    <div class="grid grid-2">
                        <div class="feature-card card">
                            <h4>Transaction Management</h4>
                            <p>Add, edit, and delete transactions with comprehensive categorization and validation.</p>
                        </div>
                        <div class="feature-card card">
                            <h4>Financial Dashboard</h4>
                            <p>View spending summaries, top categories, and weekly trends at a glance.</p>
                        </div>
                        <div class="feature-card card">
                            <h4>Advanced Search</h4>
                            <p>Use regex patterns to filter and find specific transactions with highlighted matches.</p>
                        </div>
                        <div class="feature-card card">
                            <h4>Data Management</h4>
                            <p>Import and export your data in JSON format for backup and portability.</p>
                        </div>
                    </div>
                </section>

                <section class="about">
                    <h3>About This Application</h3>
                    <p>
                        Built with vanilla JavaScript, HTML, and CSS, this application prioritizes accessibility,
                        performance, and user experience. All data is stored locally in your browser, ensuring
                        privacy and offline functionality.
                    </p>
                    <div class="contact">
                        <strong>Developer Contact:</strong> 
                        <a href="https://github.com/Darlene250" target="_blank" rel="noopener noreferrer">GitHub</a> | 
                        <a href="mailto:d.ayinkamiy@alustudent.com">d.ayinkamiy@alustudent.com</a>
                    </div>
                </section>
            </div>
        `;

        this.elements.pageHome.innerHTML = html;
    }

    renderDashboardPage(state) {
        const stats = AppStateInstance.getDashboardStats();
        const categories = ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other'];

        const html = `
            <div class="page-dashboard">
                <div class="page-header">
                    <h2 id="dashboardTitle">Financial Dashboard</h2>
                    <button class="btn btn-primary" id="addTransactionBtn">
                        <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                        </svg>
                        Add Transaction
                    </button>
                </div>

                <div id="transactionFormContainer"></div>

                <div class="grid grid-2">
                    <div class="stat-card">
                        <div class="stat-label">Total Transactions</div>
                        <div class="stat-value">${stats.totalCount}</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-label">Total Spent</div>
                        <div class="stat-value">${state.settings.baseCurrency} ${stats.totalSpent.toFixed(2)}</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-label">Top Category</div>
                        <div class="stat-value">${stats.topCategory}</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-label">Budget Status</div>
                        <div class="stat-value" style="color: ${stats.budgetStatus === 'over' ? 'var(--danger)' : 'var(--success)'}">
                            ${stats.budgetStatus === 'over' ? '-' : '+'}${Math.abs(stats.budgetRemaining).toFixed(2)}
                        </div>
                        <div class="stat-label" role="status" aria-live="${stats.budgetStatus === 'over' ? 'assertive' : 'polite'}">
                            ${stats.budgetStatus === 'over' ? 'Over budget' : 'Under budget'}
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h3 class="card-title">Spending Trend (Last 7 Days)</h3>
                    <div class="chart" role="img" aria-label="Spending trend for the last 7 days">
                        ${stats.dailyTotals.map(({ date, total }) => `
                            <div class="chart-bar">
                                <div 
                                    class="chart-bar-fill" 
                                    style="height: ${(total / stats.maxDaily) * 100}%"
                                    aria-label="${new Date(date).toLocaleDateString()}: ${state.settings.baseCurrency} ${total.toFixed(2)}"
                                ></div>
                                <div class="chart-label">${new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                <div class="chart-value">${total.toFixed(0)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="card">
                    <h3 class="card-title">Spending by Category</h3>
                    <div class="chart" style="height: 300px; flex-direction: row; align-items: flex-end;">
                        ${Object.entries(stats.categoryTotals)
                            .sort(([,a], [,b]) => b - a)
                            .map(([category, amount]) => {
                                const maxAmount = Math.max(...Object.values(stats.categoryTotals));
                                return `
                                    <div class="chart-bar">
                                        <div 
                                            class="chart-bar-fill" 
                                            style="height: ${(amount / maxAmount) * 100}%"
                                            aria-label="${category}: ${state.settings.baseCurrency} ${amount.toFixed(2)}"
                                        ></div>
                                        <div class="chart-label">${category}</div>
                                        <div class="chart-value">${amount.toFixed(0)}</div>
                                    </div>
                                `;
                            }).join('')}
                    </div>
                </div>
            </div>
        `;

        this.elements.pageDashboard.innerHTML = html;

        // Add event listeners for dashboard
        const addTransactionBtn = document.getElementById('addTransactionBtn');
        if (addTransactionBtn) {
            addTransactionBtn.addEventListener('click', () => {
                this.renderTransactionForm();
            });
        }
    }

    renderRecordsPage(state) {
        const transactions = AppStateInstance.getFilteredTransactions();
        const sortConfig = state.sortConfig;

        const html = `
            <div class="page-records">
                <div class="page-header">
                    <h2 id="recordsTitle">Transaction Records</h2>
                </div>

                <div class="search-bar card">
                    <label for="searchInput" class="form-label">
                        Search Transactions (Regex supported)
                    </label>
                    <div class="search-input-wrapper">
                        <input
                            id="searchInput"
                            type="text"
                            class="form-input search-input"
                            placeholder="e.g., coffee|tea or \.d{2}\b for amounts with cents"
                            value="${state.searchTerm}"
                            aria-describedby="searchHint"
                        />
                    </div>
                    <p id="searchHint" class="search-hint">
                        Try patterns like: <code>\\.\\d{2}\\b</code> for cents, <code>(coffee|tea)</code> for keywords
                    </p>
                </div>

                ${transactions.length === 0 ? `
                    <div class="card">
                        <p class="empty-state">
                            ${state.searchTerm ? 'No transactions match your search. Try adjusting your search terms.' : 'No transactions found. Add your first transaction from the Dashboard.'}
                        </p>
                    </div>
                ` : `
                    <div class="table-wrapper desktop-only">
                        <table class="table" aria-label="Transaction records">
                            <thead>
                                <tr>
                                    <th tabindex="0" onclick="AppStateInstance.setSortConfig('date')" onkeypress="if(event.key==='Enter') AppStateInstance.setSortConfig('date')">
                                        Date ${this.getSortIcon('date', sortConfig)}
                                    </th>
                                    <th tabindex="0" onclick="AppStateInstance.setSortConfig('description')" onkeypress="if(event.key==='Enter') AppStateInstance.setSortConfig('description')">
                                        Description ${this.getSortIcon('description', sortConfig)}
                                    </th>
                                    <th tabindex="0" onclick="AppStateInstance.setSortConfig('category')" onkeypress="if(event.key==='Enter') AppStateInstance.setSortConfig('category')">
                                        Category ${this.getSortIcon('category', sortConfig)}
                                    </th>
                                    <th tabindex="0" onclick="AppStateInstance.setSortConfig('amount')" onkeypress="if(event.key==='Enter') AppStateInstance.setSortConfig('amount')">
                                        Amount ${this.getSortIcon('amount', sortConfig)}
                                    </th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${transactions.map(transaction => `
                                    <tr key="${transaction.id}">
                                        ${state.editingId === transaction.id ? 
                                            this.renderEditRow(transaction) : 
                                            this.renderViewRow(transaction, state)
                                        }
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div class="mobile-cards mobile-only">
                        ${transactions.map(transaction => `
                            <div class="card transaction-card">
                                ${state.editingId === transaction.id ? 
                                    this.renderEditCard(transaction) : 
                                    this.renderViewCard(transaction, state)
                                }
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;

        this.elements.pageRecords.innerHTML = html;

        // Add event listeners
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                AppStateInstance.setSearchTerm(e.target.value);
            });
        }
    }

    renderSettingsPage(state) {
        const settings = state.settings;
        const currencyKeys = Object.keys(settings.currencies || {});

        const html = `
            <div class="page-settings">
                <h2 id="settingsTitle">Settings</h2>

                <div class="card">
                    <h3 class="card-title">Currency Settings</h3>
                    
                    <div class="form-group">
                        <label for="base-currency" class="form-label">Base Currency</label>
                        <input
                            id="base-currency"
                            type="text"
                            class="form-input"
                            value="${settings.baseCurrency || 'USD'}"
                            maxlength="3"
                            pattern="[A-Z]{3}"
                            title="3 uppercase letters (e.g., USD, EUR, GBP)"
                        />
                        <div class="form-hint">3 uppercase letters (e.g., USD, EUR, GBP)</div>
                    </div>

                    ${currencyKeys.map((currency, index) => `
                        <div class="form-group">
                            <label for="currency-${index}" class="form-label">${currency} to ${settings.baseCurrency} Rate</label>
                            <input
                                id="currency-${index}"
                                type="number"
                                step="0.0001"
                                class="form-input"
                                value="${settings.currencies[currency]}"
                            />
                        </div>
                    `).join('')}
                </div>

                <div class="card">
                    <h3 class="card-title">Budget Cap</h3>
                    
                    <div class="form-group">
                        <label for="budget-cap" class="form-label">Monthly Budget Limit (${settings.baseCurrency})</label>
                        <input
                            id="budget-cap"
                            type="number"
                            step="0.01"
                            class="form-input"
                            value="${settings.budgetCap || 500}"
                        />
                    </div>
                </div>

                <div class="card">
                    <h3 class="card-title">Data Management</h3>
                    
                    <div class="settings-actions">
                        <button class="btn btn-primary" id="exportBtn">
                            <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                            </svg>
                            Export Data (JSON)
                        </button>
                        
                        <button class="btn btn-secondary" id="importBtn">
                            <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
                            </svg>
                            Import Data (JSON)
                        </button>
                        
                        <button class="btn btn-danger" id="clearDataBtn">
                            <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                            Clear All Data
                        </button>
                    </div>
                </div>

                <div class="card">
                    <button class="btn btn-primary btn-block" id="saveSettingsBtn">
                        Save Settings
                    </button>
                </div>
            </div>
        `;

        this.elements.pageSettings.innerHTML = html;

        // Add event listeners
        document.getElementById('exportBtn')?.addEventListener('click', () => {
            AppStateInstance.exportData();
        });

        document.getElementById('importBtn')?.addEventListener('click', () => {
            this.elements.fileImport.click();
        });

        document.getElementById('clearDataBtn')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                AppStateInstance.clearAllData();
            }
        });

        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
            this.handleSaveSettings();
        });
    }

    /**
     * Helper methods for rendering
     */
    renderViewRow(transaction, state) {
        return `
            <td>${transaction.date}</td>
            <td>${SearchEngine.highlightMatches(transaction.description, state.searchTerm)}</td>
            <td>${SearchEngine.highlightMatches(transaction.category, state.searchTerm)}</td>
            <td>${SearchEngine.highlightMatches(transaction.amount.toFixed(2), state.searchTerm)}</td>
            <td>
                <div class="action-buttons">
                    <button 
                        class="btn btn-sm btn-secondary" 
                        onclick="AppStateInstance.startEditing('${transaction.id}')"
                        aria-label="Edit ${transaction.description}"
                    >
                        <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                    </button>
                    <button 
                        class="btn btn-sm btn-danger" 
                        onclick="deleteTransaction('${transaction.id}')"
                        aria-label="Delete ${transaction.description}"
                    >
                        <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
    }

    renderEditRow(transaction) {
        const categories = ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other'];
        
        // Initialize edit data with current transaction values
        if (!window.editData) {
            window.editData = {
                date: transaction.date,
                description: transaction.description,
                category: transaction.category,
                amount: transaction.amount.toString()
            };
        }
        
        return `
            <td>
                <input
                    type="date"
                    class="form-input"
                    value="${transaction.date}"
                    onchange="handleEditChange('date', this.value)"
                />
            </td>
            <td>
                <input
                    type="text"
                    class="form-input"
                    value="${transaction.description}"
                    onchange="handleEditChange('description', this.value)"
                />
            </td>
            <td>
                <select
                    class="form-select"
                    onchange="handleEditChange('category', this.value)"
                >
                    ${categories.map(cat => `
                        <option value="${cat}" ${cat === transaction.category ? 'selected' : ''}>${cat}</option>
                    `).join('')}
                </select>
            </td>
            <td>
                <input
                    type="text"
                    class="form-input"
                    value="${transaction.amount}"
                    onchange="handleEditChange('amount', this.value)"
                />
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="saveEdit('${transaction.id}')">
                        <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="AppStateInstance.cancelEditing()">
                        <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
    }

    renderViewCard(transaction, state) {
        return `
            <div class="transaction-header">
                <div class="transaction-description">
                    ${SearchEngine.highlightMatches(transaction.description, state.searchTerm)}
                </div>
                <div class="transaction-amount">
                    ${SearchEngine.highlightMatches(transaction.amount.toFixed(2), state.searchTerm)}
                </div>
            </div>
            <div class="transaction-meta">
                <span>${SearchEngine.highlightMatches(transaction.category, state.searchTerm)}</span>
                <span>${transaction.date}</span>
            </div>
            <div class="action-buttons">
                <button class="btn btn-sm btn-secondary" onclick="AppStateInstance.startEditing('${transaction.id}')">
                    <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                    Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteTransaction('${transaction.id}')">
                    <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                    Delete
                </button>
            </div>
        `;
    }

    renderEditCard(transaction) {
        const categories = ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other'];
        
        // Initialize edit data with current transaction values
        if (!window.editData) {
            window.editData = {
                date: transaction.date,
                description: transaction.description,
                category: transaction.category,
                amount: transaction.amount.toString()
            };
        }
        
        return `
            <div class="form-group">
                <label class="form-label">Date</label>
                <input
                    type="date"
                    class="form-input"
                    value="${transaction.date}"
                    onchange="handleEditChange('date', this.value)"
                />
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <input
                    type="text"
                    class="form-input"
                    value="${transaction.description}"
                    onchange="handleEditChange('description', this.value)"
                />
            </div>
            <div class="form-group">
                <label class="form-label">Category</label>
                <select
                    class="form-select"
                    onchange="handleEditChange('category', this.value)"
                >
                    ${categories.map(cat => `
                        <option value="${cat}" ${cat === transaction.category ? 'selected' : ''}>${cat}</option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Amount</label>
                <input
                    type="text"
                    class="form-input"
                    value="${transaction.amount}"
                    onchange="handleEditChange('amount', this.value)"
                />
            </div>
            <div class="action-buttons">
                <button class="btn btn-primary" onclick="saveEdit('${transaction.id}')">
                    <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Save
                </button>
                <button class="btn btn-secondary" onclick="AppStateInstance.cancelEditing()">
                    <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                    Cancel
                </button>
            </div>
        `;
    }

    renderTransactionForm() {
        const html = `
            <div class="card">
                <h3 class="card-title">New Transaction</h3>
                <form id="transactionForm">
                    <div class="grid grid-2">
                        <div class="form-group">
                            <label for="description" class="form-label">Description</label>
                            <input
                                id="description"
                                type="text"
                                class="form-input"
                                required
                                aria-describedby="description-error"
                            />
                            <div id="description-error" class="form-error" role="alert" aria-live="polite"></div>
                        </div>

                        <div class="form-group">
                            <label for="amount" class="form-label">Amount</label>
                            <input
                                id="amount"
                                type="text"
                                class="form-input"
                                required
                                aria-describedby="amount-error"
                            />
                            <div id="amount-error" class="form-error" role="alert" aria-live="polite"></div>
                        </div>

                        <div class="form-group">
                            <label for="category" class="form-label">Category</label>
                            <select id="category" class="form-select" required>
                                <option value="Food">Food</option>
                                <option value="Books">Books</option>
                                <option value="Transport">Transport</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Fees">Fees</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="date" class="form-label">Date</label>
                            <input
                                id="date"
                                type="date"
                                class="form-input"
                                required
                                value="${new Date().toISOString().split('T')[0]}"
                                aria-describedby="date-error"
                            />
                            <div id="date-error" class="form-error" role="alert" aria-live="polite"></div>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Add Transaction</button>
                        <button type="button" class="btn btn-secondary" id="cancelFormBtn">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        const container = document.getElementById('transactionFormContainer');
        if (container) {
            container.innerHTML = html;

            // Add event listeners
            const form = document.getElementById('transactionForm');
            const cancelBtn = document.getElementById('cancelFormBtn');
            
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleAddTransaction();
                });
            }

            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    container.innerHTML = '';
                });
            }

            // Real-time validation
            ['description', 'amount', 'date'].forEach(field => {
                const fieldEl = document.getElementById(field);
                if (fieldEl) {
                    fieldEl.addEventListener('blur', (e) => {
                        this.validateFormField(field, e.target.value);
                    });
                }
            });
        }
    }

    /**
     * Form handling methods
     */
// Transaction management
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
    handleAddTransaction() {
        const descriptionEl = document.getElementById('description');
        const amountEl = document.getElementById('amount');
        const categoryEl = document.getElementById('category');
        const dateEl = document.getElementById('date');

        if (!descriptionEl || !amountEl || !categoryEl || !dateEl) {
            AppStateInstance.showNotification('Form elements not found', 'error');
            return;
        }

        const formData = {
            description: descriptionEl.value.trim(),
            amount: amountEl.value.trim(),
            category: categoryEl.value,
            date: dateEl.value
        };

        // Validate all fields
        let isValid = true;
        Object.keys(formData).forEach(field => {
            if (!this.validateFormField(field, formData[field])) {
                isValid = false;
            }
        });

        if (!isValid) {
            AppStateInstance.showNotification('Please fix validation errors', 'error');
            return;
        }

        const result = AppStateInstance.addTransaction({
            ...formData,
            amount: parseFloat(formData.amount)
        });

        if (result.success) {
            const container = document.getElementById('transactionFormContainer');
            if (container) {
                container.innerHTML = '';
            }
        }
    }

    validateFormField(field, value) {
        const errorElement = document.getElementById(`${field}-error`);
        const inputElement = document.getElementById(field);

        if (!errorElement || !inputElement) return true;

        const error = validateField(field, value);
        
        if (error) {
            errorElement.textContent = error;
            inputElement.classList.add('error');
            return false;
        } else {
            errorElement.textContent = '';
            inputElement.classList.remove('error');
            return true;
        }
    }

    handleSaveSettings() {
        const baseCurrency = document.getElementById('base-currency').value.toUpperCase();
        const budgetCap = parseFloat(document.getElementById('budget-cap').value);
        
        const currencyKeys = Object.keys(AppStateInstance.getState().settings.currencies || {});
        const currencies = {};
        
        currencyKeys.forEach((currency, index) => {
            const rate = parseFloat(document.getElementById(`currency-${index}`).value);
            if (!isNaN(rate)) {
                currencies[currency] = rate;
            }
        });

        const updates = {
            baseCurrency,
            budgetCap,
            currencies
        };

        AppStateInstance.updateSettings(updates);
    }

    /**
     * Notification rendering
     */
    renderNotification(notification) {
        if (!notification) {
            this.elements.notification.hidden = true;
            return;
        }

        this.elements.notification.hidden = false;
        this.elements.notification.className = `notification ${notification.type}`;
        this.elements.notification.textContent = notification.message;
    }

    /**
     * Navigation rendering
     */
    updateNavigation(currentPage) {
        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeNav = document.querySelector(`[data-page="${currentPage}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }

        // Update page visibility
        document.querySelectorAll('.page').forEach(page => {
            page.hidden = true;
            page.classList.remove('active');
        });

        const activePage = document.getElementById(`page${currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}`);
        if (activePage) {
            activePage.hidden = false;
            activePage.classList.add('active');
        }
    }

    /**
     * Theme rendering
     */
    updateTheme(theme) {
        const themeToggle = this.elements.themeToggle;
        const moonIcon = themeToggle.querySelector('.moon-icon');
        const sunIcon = themeToggle.querySelector('.sun-icon');

        if (theme === 'dark') {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'block';
            themeToggle.setAttribute('aria-label', 'Switch to light mode');
        } else {
            moonIcon.style.display = 'block';
            sunIcon.style.display = 'none';
            themeToggle.setAttribute('aria-label', 'Switch to dark mode');
        }
    }

    /**
     * Utility methods
     */
    getSortIcon(key, sortConfig) {
        if (sortConfig.key !== key) return '↕';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    }

    /**
     * Global UI update method
     */
    updateUI(state) {
        // Update navigation
        this.updateNavigation(state.currentPage);

        // Update theme toggle
        this.updateTheme(state.settings.theme);

        // Update notification
        this.renderNotification(state.notification);

        // Update current page content
        switch (state.currentPage) {
            case 'home':
                // Home page is static, only render once
                break;
            case 'dashboard':
                this.renderDashboardPage(state);
                break;
            case 'records':
                this.renderRecordsPage(state);
                break;
            case 'settings':
                this.renderSettingsPage(state);
                break;
        }
    }
}

// Create global UI instance
const UIInstance = new UI();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIInstance;
}