import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LayoutComponent } from '../../shared/layout';
import { WalletService, WalletAccount, Transaction, WalletSummary } from './wallet.service';
import { WalletMockService } from './wallet.mock.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatTabsModule,
    MatExpansionModule,
    MatDividerModule,
    MatListModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    LayoutComponent
  ],
  templateUrl: './wallet.html',
  styleUrl: './wallet.scss'
})
export class WalletComponent implements OnInit, OnDestroy {
  accounts: WalletAccount[] = [];
  transactions: Transaction[] = [];
  summary: WalletSummary | null = null;
  loading = false;
  
  // Forms
  accountForm: FormGroup;
  transactionForm: FormGroup;
  
  // UI State
  showAddAccount = false;
  showAddTransaction = false;
  selectedAccount: WalletAccount | null = null;
  
  // Table data
  displayedColumns: string[] = ['date', 'description', 'category', 'amount', 'type', 'balance'];
  
  // Service selection (for testing)
  useMockService = true; // Set to false to use real API service
  
  private destroy$ = new Subject<void>();

  constructor(
    private walletService: WalletService,
    private walletMockService: WalletMockService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.accountForm = this.fb.group({
      name: ['', Validators.required],
      type: ['checking', Validators.required],
      balance: [0, [Validators.required, Validators.min(0)]],
      currency: ['USD', Validators.required],
      accountNumber: ['', Validators.required]
    });

    this.transactionForm = this.fb.group({
      accountId: ['', Validators.required],
      type: ['expense', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required],
      category: ['', Validators.required],
      date: [new Date(), Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.subscribeToData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.loading = true;
    
    if (this.useMockService) {
      // Use mock service for testing
      this.walletMockService.getAccounts().subscribe(accounts => {
        this.accounts = accounts;
        this.loading = false;
      });
      
      this.walletMockService.getTransactions().subscribe(transactions => {
        this.transactions = transactions;
      });
      
      this.walletMockService.getSummary().subscribe(summary => {
        this.summary = summary;
      });
    } else {
      // Use real API service
      this.walletService.getAccounts().subscribe(() => {
        this.loading = false;
      });
      
      this.walletService.getTransactions().subscribe();
    }
  }

  private subscribeToData(): void {
    if (this.useMockService) {
      // For mock service, we don't have observables, so we'll handle data updates manually
      return;
    }

    this.walletService.accounts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(accounts => {
        this.accounts = accounts;
        this.updateTransactionFormAccounts();
      });

    this.walletService.transactions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(transactions => {
        this.transactions = transactions;
      });

    this.walletService.summary$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.summary = summary;
      });
  }

  private updateTransactionFormAccounts(): void {
    if (this.accounts.length > 0) {
      this.transactionForm.patchValue({
        accountId: this.accounts[0].id
      });
    }
  }

  // Account Management
  addAccount(): void {
    if (this.accountForm.valid) {
      const accountData = this.accountForm.value;
      
      if (this.useMockService) {
        this.walletMockService.createAccount({
          ...accountData,
          isActive: true
        }).subscribe({
          next: (newAccount) => {
            this.accounts.push(newAccount);
            this.updateSummary();
            this.showAddAccount = false;
            this.accountForm.reset({
              type: 'checking',
              balance: 0,
              currency: 'USD'
            });
            this.showSuccessMessage('Account created successfully');
          },
          error: (error) => {
            this.showErrorMessage('Failed to create account');
            console.error('Error creating account:', error);
          }
        });
      } else {
        this.walletService.createAccount({
          ...accountData,
          isActive: true
        }).subscribe({
          next: () => {
            this.showAddAccount = false;
            this.accountForm.reset({
              type: 'checking',
              balance: 0,
              currency: 'USD'
            });
            this.showSuccessMessage('Account created successfully');
          },
          error: (error) => {
            this.showErrorMessage('Failed to create account');
            console.error('Error creating account:', error);
          }
        });
      }
    }
  }

  editAccount(account: WalletAccount): void {
    this.selectedAccount = account;
    this.accountForm.patchValue({
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
      accountNumber: account.accountNumber
    });
    this.showAddAccount = true;
  }

  updateAccount(): void {
    if (this.accountForm.valid && this.selectedAccount) {
      const updates = this.accountForm.value;
      
      if (this.useMockService) {
        this.walletMockService.updateAccount(this.selectedAccount.id, updates).subscribe({
          next: (updatedAccount) => {
            const index = this.accounts.findIndex(acc => acc.id === updatedAccount.id);
            if (index !== -1) {
              this.accounts[index] = updatedAccount;
              this.updateSummary();
            }
            this.showAddAccount = false;
            this.selectedAccount = null;
            this.accountForm.reset({
              type: 'checking',
              balance: 0,
              currency: 'USD'
            });
            this.showSuccessMessage('Account updated successfully');
          },
          error: (error) => {
            this.showErrorMessage('Failed to update account');
            console.error('Error updating account:', error);
          }
        });
      } else {
        this.walletService.updateAccount(this.selectedAccount.id, updates).subscribe({
          next: () => {
            this.showAddAccount = false;
            this.selectedAccount = null;
            this.accountForm.reset({
              type: 'checking',
              balance: 0,
              currency: 'USD'
            });
            this.showSuccessMessage('Account updated successfully');
          },
          error: (error) => {
            this.showErrorMessage('Failed to update account');
            console.error('Error updating account:', error);
          }
        });
      }
    }
  }

  deleteAccount(account: WalletAccount): void {
    if (confirm(`Are you sure you want to delete ${account.name}?`)) {
      if (this.useMockService) {
        this.walletMockService.deleteAccount(account.id).subscribe({
          next: () => {
            this.accounts = this.accounts.filter(acc => acc.id !== account.id);
            this.updateSummary();
            this.showSuccessMessage('Account deleted successfully');
          },
          error: (error) => {
            this.showErrorMessage('Failed to delete account');
            console.error('Error deleting account:', error);
          }
        });
      } else {
        this.walletService.deleteAccount(account.id).subscribe({
          next: () => {
            this.showSuccessMessage('Account deleted successfully');
          },
          error: (error) => {
            this.showErrorMessage('Failed to delete account');
            console.error('Error deleting account:', error);
          }
        });
      }
    }
  }

  // Transaction Management
  addTransaction(): void {
    if (this.transactionForm.valid) {
      const transactionData = this.transactionForm.value;
      
      if (this.useMockService) {
        this.walletMockService.addTransaction(transactionData).subscribe({
          next: (newTransaction) => {
            this.transactions.unshift(newTransaction);
            this.updateAccountBalance(newTransaction.accountId, newTransaction.amount, newTransaction.type);
            this.showAddTransaction = false;
            this.transactionForm.reset({
              type: 'expense',
              amount: 0,
              date: new Date(),
              accountId: this.accounts.length > 0 ? this.accounts[0].id : ''
            });
            this.showSuccessMessage('Transaction added successfully');
          },
          error: (error) => {
            this.showErrorMessage('Failed to add transaction');
            console.error('Error adding transaction:', error);
          }
        });
      } else {
        this.walletService.addTransaction(transactionData).subscribe({
          next: () => {
            this.showAddTransaction = false;
            this.transactionForm.reset({
              type: 'expense',
              amount: 0,
              date: new Date(),
              accountId: this.accounts.length > 0 ? this.accounts[0].id : ''
            });
            this.showSuccessMessage('Transaction added successfully');
          },
          error: (error) => {
            this.showErrorMessage('Failed to add transaction');
            console.error('Error adding transaction:', error);
          }
        });
      }
    }
  }

  // Helper Methods for Mock Service
  private updateAccountBalance(accountId: string, amount: number, type: 'income' | 'expense' | 'transfer'): void {
    const accountIndex = this.accounts.findIndex(acc => acc.id === accountId);
    if (accountIndex !== -1) {
      const account = this.accounts[accountIndex];
      let newBalance = account.balance;
      
      if (type === 'income') {
        newBalance += amount;
      } else if (type === 'expense') {
        newBalance -= amount;
      }
      
      this.accounts[accountIndex] = {
        ...account,
        balance: newBalance,
        updatedAt: new Date()
      };
      
      this.updateSummary();
    }
  }

  private updateSummary(): void {
    const totalBalance = this.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalIncome = this.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    this.summary = {
      totalBalance,
      totalIncome,
      totalExpenses,
      accountCount: this.accounts.length,
      currency: this.accounts.length > 0 ? this.accounts[0].currency : 'USD'
    };
  }

  // UI Helpers
  getAccountIcon(type: string): string {
    const icons: { [key: string]: string } = {
      checking: 'account_balance',
      savings: 'savings',
      credit: 'credit_card',
      investment: 'trending_up'
    };
    return icons[type] || 'account_balance';
  }

  getTransactionIcon(type: string): string {
    const icons: { [key: string]: string } = {
      income: 'trending_up',
      expense: 'trending_down',
      transfer: 'swap_horiz'
    };
    return icons[type] || 'swap_horiz';
  }

  getTransactionColor(type: string): string {
    const colors: { [key: string]: string } = {
      income: 'green',
      expense: 'red',
      transfer: 'blue'
    };
    return colors[type] || 'blue';
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    if (this.useMockService) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    }
    return this.walletService.formatCurrency(amount, currency);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  // Form Helpers
  cancelAccountForm(): void {
    this.showAddAccount = false;
    this.selectedAccount = null;
    this.accountForm.reset({
      type: 'checking',
      balance: 0,
      currency: 'USD'
    });
  }

  cancelTransactionForm(): void {
    this.showAddTransaction = false;
    this.transactionForm.reset({
      type: 'expense',
      amount: 0,
      date: new Date(),
      accountId: this.accounts.length > 0 ? this.accounts[0].id : ''
    });
  }

  // Message Helpers
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  // Getter for form validation
  get isAccountFormValid(): boolean {
    return this.accountForm.valid;
  }

  get isTransactionFormValid(): boolean {
    return this.transactionForm.valid;
  }

  // Testing Helper - Reset Mock Data
  resetMockData(): void {
    if (this.useMockService) {
      this.walletMockService.resetMockData();
      this.loadData();
      this.showSuccessMessage('Mock data reset successfully');
    }
  }
}
