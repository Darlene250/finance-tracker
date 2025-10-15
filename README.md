# Student Finance Tracker

A professional and accessible finance tracking web application built with vanilla JavaScript, designed specifically for students to manage their expenses effectively.

---

## Live Demo

**GitHub Pages URL:** [https://darlene250.github.io/finance-tracker](https://darlene250.github.io/finance-tracker)

---

## Features

### Core Functionality
- **Transaction Management**: Add, edit, delete, and categorize expenses.  
- **Financial Dashboard**: Visual overview of spending patterns and budget status.  
- **Advanced Search**: Regex-powered search with match highlighting.  
- **Data Import/Export**: JSON-based data portability.  
- **Responsive Design**: Mobile-first responsive layout.  
- **Dark/Light Theme**: Accessible theme switching.  

### Advanced Features
- **Comprehensive Regex Validators** with safety checks.  
- **Full Keyboard Navigation** with screen reader support.  
- **Local Storage Persistence** with error recovery.  
- **Real-time Form Validation** with accessible error messages.  
- **Progressive Web App** capabilities.  

---

## Regex Catalog

The application implements four distinct regex validation patterns.

### 1. Description Validation
```regex
/^\S(?:.*\S)?$/
````

Ensures no leading/trailing spaces. Minimum 2 characters, letters, numbers, punctuation.

### 2. Amount Validation (Advanced with Lookahead)

```regex
/^(?=.*\d)\d*(?:\.\d{0,2})?$/
```

Validates positive currency amounts with up to 2 decimal places.

### 3. Date Validation with Back-Reference

```regex
/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
```

Validates `YYYY-MM-DD` format and ensures realistic dates.

### 4. Category Validation with Word Boundaries

```regex
/^(?!.*[ -]{2})[A-Za-z]+(?:[ -][A-Za-z]+)*$/
```

Validates category names: letters, spaces, hyphens only; no consecutive special characters.

---

## Keyboard Navigation

| Shortcut     | Action                              |
| ------------ | ----------------------------------- |
| Ctrl/Cmd + 1 | Navigate to Home                    |
| Ctrl/Cmd + 2 | Dashboard                           |
| Ctrl/Cmd + 3 | Records                             |
| Ctrl/Cmd + 4 | Settings                            |
| /            | Focus search input                  |
| Escape       | Cancel editing / Close notification |

---

## Accessibility Features

* **Landmarks & Semantic HTML:** main, nav, banner, contentinfo; proper heading hierarchy.
* **ARIA:** aria-label, aria-describedby, aria-live, aria-hidden.
* **Screen Reader Support:** Live updates, skip links, logical tab order.
* **Color & Contrast:** WCAG AA compliant, theme switching, high contrast and reduced motion support.

---

## Browser Support

* Chrome 80+
* Firefox 75+
* Safari 13+
* Edge 80+

---

## Installation

1. Clone or download the repository.
2. Open `index.html` in your browser.

No server setup is required.

---

## File Structure

```
finance-tracker/
├── index.html           # Main application entry point
├── styles/
│   └── main.css         # Responsive styles
├── scripts/
│   ├── main.js          # App initialization
│   ├── state.js         # Centralized state management
│   ├── storage.js       # Local storage and import/export
│   ├── ui.js            # DOM rendering & interactions
│   ├── validators.js    # Regex validation logic
│   └── search.js        # Advanced regex search
├── tests.html           # Validation test page
├── seed.json            # Sample data
└── README.md            # This file
```

---

## Data Structure

### Transaction Object

```javascript
{
  id: "txn_123456789",
  description: "Lunch",
  amount: 15.50,
  category: "Food",
  date: "2024-01-15",
  createdAt: "2024-01-15T10:30:00.000Z",
  updatedAt: "2024-01-15T10:30:00.000Z"
}
```

### Settings Object

```javascript
{
  baseCurrency: "USD",
  currencies: { EUR: 0.85, GBP: 0.73, JPY: 110.0 },
  budgetCap: 500,
  theme: "light",
  dateFormat: "YYYY-MM-DD",
  decimalPlaces: 2
}
```

---

## API Reference

### State Management

```javascript
AppStateInstance.subscribe(state => console.log('State updated:', state));
AppStateInstance.addTransaction(transactionData);
AppStateInstance.updateSettings(newSettings);
AppStateInstance.exportData();
```

### Validation

```javascript
validateField('amount', '15.50');
validateTransaction(transactionData);
```

### Search

```javascript
SearchEngine.searchTransactions(transactions, 'coffee');
SearchEngine.advancedSearch(transactions, { term: 'food', minAmount: 10, categories: ['Food'] });
```

---

## Testing

* Transaction CRUD operations
* Form validations and regex tests
* Search functionality
* Data persistence
* Responsive design
* Keyboard navigation
* Screen reader support
* Data import/export

### Regex Test Cases

```javascript
const testCases = {
  description: ["Lunch", "Textbooks", "Bus fare"],
  amount: ["15.50", "100", "0.99", "1234.56"],
  date: ["2024-01-15", "2023-12-31"],
  category: ["Food", "Transport", "Entertainment"],
  search: ["coffee", "\\.\\d{2}", "food|transport"]
};
```

---

## Performance Considerations

* Debounced search
* Virtual scrolling (planned)
* Lazy loading components
* Proper memory management

---

## Security

* XSS prevention
* Regex safety with timeout
* Input sanitization
* Local storage isolation

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Ensure validations/tests pass
4. Submit a pull request

---

## License

Built for educational and organizational use.
Please attribute appropriately when using or modifying this project.

---

## Support

* GitHub: [github.com/darlene](https://github.com/darlene)
* Email: [d.ayinkamiy@alustudent.com](mailto:d.ayinkamiy@alustudent.com)
