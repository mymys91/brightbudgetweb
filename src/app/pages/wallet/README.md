# Wallet Component & Service

A comprehensive wallet management system for the BrightBudget application that allows users to manage multiple financial accounts, track transactions, and monitor their financial health.

## Features

### 🏦 Account Management
- **Multiple Account Types**: Checking, Savings, Credit, and Investment accounts
- **Account Operations**: Create, read, update, and delete accounts
- **Balance Tracking**: Real-time balance updates with transaction history
- **Account Status**: Active/inactive account management

### 💰 Transaction Management
- **Transaction Types**: Income, Expense, and Transfer
- **Categorization**: Custom categories for better organization
- **Date Tracking**: Transaction date management with date picker
- **Balance Impact**: Automatic balance updates after transactions

### 📊 Financial Summary
- **Overview Dashboard**: Total balance, income, expenses, and account count
- **Visual Indicators**: Color-coded summary cards for quick insights
- **Account Breakdown**: Detailed view of all accounts and balances
- **Real-time Updates**: Live updates as transactions are added

### 🎨 User Interface
- **Tabbed Interface**: Organized sections for Accounts, Transactions, and Summary
- **Responsive Design**: Mobile-friendly layout with adaptive grids
- **Material Design**: Modern UI components using Angular Material
- **Interactive Forms**: Expandable forms for adding/editing data

## Architecture

### Components
- **WalletComponent**: Main wallet interface with tabs and forms
- **Responsive Layout**: Mobile-first design with breakpoint handling

### Services
- **WalletService**: Production service for API integration
- **WalletMockService**: Mock service for development and testing

### Data Models
```typescript
interface WalletAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  accountNumber: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Transaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  category: string;
  date: Date;
  balanceAfter: number;
}

interface WalletSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  accountCount: number;
  currency: string;
}
```

## Usage

### Basic Setup
```typescript
import { WalletComponent } from './pages/wallet';
import { WalletService } from './pages/wallet/wallet.service';

// Add to your module or standalone component imports
@Component({
  imports: [WalletComponent],
  // ... other configuration
})
```

### Service Integration
```typescript
constructor(private walletService: WalletService) {}

// Get all accounts
this.walletService.getAccounts().subscribe(accounts => {
  console.log('Accounts:', accounts);
});

// Add a transaction
const transaction = {
  accountId: 'account-1',
  type: 'expense',
  amount: 50.00,
  description: 'Coffee',
  category: 'Food & Dining',
  date: new Date()
};

this.walletService.addTransaction(transaction).subscribe(result => {
  console.log('Transaction added:', result);
});
```

### Mock Service for Testing
```typescript
import { WalletMockService } from './pages/wallet/wallet.mock.service';

constructor(private mockService: WalletMockService) {}

// Use mock service for development
this.mockService.getAccounts().subscribe(accounts => {
  console.log('Mock accounts:', accounts);
});

// Reset mock data
this.mockService.resetMockData();
```

## Configuration

### Service Selection
The component automatically detects whether to use the mock service or real API service:

```typescript
// In wallet.component.ts
useMockService = true; // Set to false for production API
```

### API Endpoints
The service expects the following API endpoints:

- `GET /wallet/accounts` - Retrieve all accounts
- `GET /wallet/accounts/:id` - Get specific account
- `POST /wallet/accounts` - Create new account
- `PUT /wallet/accounts/:id` - Update account
- `DELETE /wallet/accounts/:id` - Delete account
- `GET /wallet/transactions` - Get transactions (with optional accountId filter)
- `POST /wallet/transactions` - Add new transaction

## Styling

### CSS Classes
- `.wallet-content` - Main container
- `.summary-cards` - Summary dashboard grid
- `.wallet-tabs` - Tab navigation
- `.form-panel` - Expandable form sections
- `.accounts-grid` - Account cards layout
- `.transactions-table` - Transaction data table

### Responsive Breakpoints
- **Desktop**: Full grid layouts and side-by-side forms
- **Tablet**: Adjusted grid columns and form layouts
- **Mobile**: Single-column layouts and stacked form elements

## Dependencies

### Required Angular Material Modules
```typescript
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
```

### Core Dependencies
- `@angular/forms` - Reactive forms
- `@angular/common` - Common directives
- `rxjs` - Observable handling

## Testing

### Mock Data
The mock service provides realistic sample data:
- 4 sample accounts (Checking, Savings, Credit, Investment)
- 6 sample transactions with various types and categories
- Realistic balance calculations and summaries

### Testing Scenarios
- Account creation, editing, and deletion
- Transaction addition and categorization
- Balance updates and summary calculations
- Form validation and error handling
- Responsive design testing

## Future Enhancements

### Planned Features
- **Budget Tracking**: Monthly budget limits and alerts
- **Goal Setting**: Financial goals and progress tracking
- **Reports**: Detailed financial reports and analytics
- **Export**: Data export to CSV/PDF formats
- **Notifications**: Balance alerts and transaction reminders

### Technical Improvements
- **Caching**: Local storage and service worker caching
- **Offline Support**: Offline transaction queuing
- **Real-time Updates**: WebSocket integration for live updates
- **Advanced Filtering**: Date ranges, categories, and amount filters

## Troubleshooting

### Common Issues
1. **Material Icons Not Showing**: Ensure `MatIconModule` is imported
2. **Date Picker Not Working**: Verify `MatDatepickerModule` and `MatNativeDateModule` are imported
3. **Forms Not Validating**: Check that `ReactiveFormsModule` is imported
4. **Styling Issues**: Ensure the component's SCSS file is properly linked

### Debug Mode
Enable debug logging by setting:
```typescript
// In wallet.service.ts
private readonly DEBUG = true;
```

## Contributing

When contributing to the wallet component:

1. **Follow Angular Style Guide**: Use consistent naming and structure
2. **Test Both Services**: Ensure changes work with both mock and real services
3. **Update Documentation**: Keep README and inline comments current
4. **Responsive Design**: Test on multiple screen sizes
5. **Accessibility**: Maintain ARIA labels and keyboard navigation

## License

This component is part of the BrightBudget application and follows the same licensing terms.
