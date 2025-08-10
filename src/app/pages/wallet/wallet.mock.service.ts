import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { WalletAccount, Transaction, WalletSummary } from './wallet.service';

@Injectable({
  providedIn: 'root'
})
export class WalletMockService {
  private mockAccounts: WalletAccount[] = [
    {
      id: '1',
      name: 'Main Checking',
      type: 'checking',
      balance: 2450.75,
      currency: 'USD',
      accountNumber: '****1234',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Savings Account',
      type: 'savings',
      balance: 12500.00,
      currency: 'USD',
      accountNumber: '****5678',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '3',
      name: 'Credit Card',
      type: 'credit',
      balance: -1250.50,
      currency: 'USD',
      accountNumber: '****9012',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '4',
      name: 'Investment Portfolio',
      type: 'investment',
      balance: 45000.00,
      currency: 'USD',
      accountNumber: '****3456',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    }
  ];

  private mockTransactions: Transaction[] = [
    {
      id: '1',
      accountId: '1',
      type: 'expense',
      amount: 125.50,
      description: 'Grocery shopping',
      category: 'Food & Dining',
      date: new Date('2024-01-15'),
      balanceAfter: 2325.25
    },
    {
      id: '2',
      accountId: '1',
      type: 'income',
      amount: 2500.00,
      description: 'Salary deposit',
      category: 'Income',
      date: new Date('2024-01-14'),
      balanceAfter: 2450.75
    },
    {
      id: '3',
      accountId: '2',
      type: 'income',
      amount: 500.00,
      description: 'Interest earned',
      category: 'Interest',
      date: new Date('2024-01-13'),
      balanceAfter: 12500.00
    },
    {
      id: '4',
      accountId: '3',
      type: 'expense',
      amount: 89.99,
      description: 'Online purchase',
      category: 'Shopping',
      date: new Date('2024-01-12'),
      balanceAfter: -1250.50
    },
    {
      id: '5',
      accountId: '1',
      type: 'expense',
      amount: 45.00,
      description: 'Gas station',
      category: 'Transportation',
      date: new Date('2024-01-11'),
      balanceAfter: -54.25
    },
    {
      id: '6',
      accountId: '4',
      type: 'income',
      amount: 1500.00,
      description: 'Dividend payment',
      category: 'Investment',
      date: new Date('2024-01-10'),
      balanceAfter: 45000.00
    }
  ];

  getAccounts(): Observable<WalletAccount[]> {
    return of([...this.mockAccounts]).pipe(delay(500));
  }

  getAccountById(id: string): Observable<WalletAccount | null> {
    const account = this.mockAccounts.find(acc => acc.id === id);
    return of(account || null).pipe(delay(300));
  }

  createAccount(account: Omit<WalletAccount, 'id' | 'createdAt' | 'updatedAt'>): Observable<WalletAccount> {
    const newAccount: WalletAccount = {
      ...account,
      id: (this.mockAccounts.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.mockAccounts.push(newAccount);
    return of(newAccount).pipe(delay(800));
  }

  updateAccount(id: string, updates: Partial<WalletAccount>): Observable<WalletAccount> {
    const index = this.mockAccounts.findIndex(acc => acc.id === id);
    if (index !== -1) {
      this.mockAccounts[index] = {
        ...this.mockAccounts[index],
        ...updates,
        updatedAt: new Date()
      };
      return of(this.mockAccounts[index]).pipe(delay(600));
    }
    return of(this.mockAccounts[0]); // Fallback
  }

  deleteAccount(id: string): Observable<void> {
    this.mockAccounts = this.mockAccounts.filter(acc => acc.id !== id);
    return of(void 0).pipe(delay(500));
  }

  getTransactions(accountId?: string): Observable<Transaction[]> {
    let transactions = [...this.mockTransactions];
    if (accountId) {
      transactions = transactions.filter(t => t.accountId === accountId);
    }
    return of(transactions).pipe(delay(400));
  }

  addTransaction(transaction: Omit<Transaction, 'id' | 'balanceAfter'>): Observable<Transaction> {
    const newTransaction: Transaction = {
      ...transaction,
      id: (this.mockTransactions.length + 1).toString(),
      balanceAfter: 0 // This would be calculated in a real implementation
    };
    
    this.mockTransactions.unshift(newTransaction);
    return of(newTransaction).pipe(delay(700));
  }

  getSummary(): Observable<WalletSummary> {
    const totalBalance = this.mockAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalIncome = this.mockTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = this.mockTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const summary: WalletSummary = {
      totalBalance,
      totalIncome,
      totalExpenses,
      accountCount: this.mockAccounts.length,
      currency: 'USD'
    };

    return of(summary).pipe(delay(300));
  }

  // Utility method to reset mock data
  resetMockData(): void {
    // Reset to original mock data
    this.mockAccounts = [
      {
        id: '1',
        name: 'Main Checking',
        type: 'checking',
        balance: 2450.75,
        currency: 'USD',
        accountNumber: '****1234',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Savings Account',
        type: 'savings',
        balance: 12500.00,
        currency: 'USD',
        accountNumber: '****5678',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '3',
        name: 'Credit Card',
        type: 'credit',
        balance: -1250.50,
        currency: 'USD',
        accountNumber: '****9012',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '4',
        name: 'Investment Portfolio',
        type: 'investment',
        balance: 45000.00,
        currency: 'USD',
        accountNumber: '****3456',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      }
    ];

    this.mockTransactions = [
      {
        id: '1',
        accountId: '1',
        type: 'expense',
        amount: 125.50,
        description: 'Grocery shopping',
        category: 'Food & Dining',
        date: new Date('2024-01-15'),
        balanceAfter: 2325.25
      },
      {
        id: '2',
        accountId: '1',
        type: 'income',
        amount: 2500.00,
        description: 'Salary deposit',
        category: 'Income',
        date: new Date('2024-01-14'),
        balanceAfter: 2450.75
      },
      {
        id: '3',
        accountId: '2',
        type: 'income',
        amount: 500.00,
        description: 'Interest earned',
        category: 'Interest',
        date: new Date('2024-01-13'),
        balanceAfter: 12500.00
      },
      {
        id: '4',
        accountId: '3',
        type: 'expense',
        amount: 89.99,
        description: 'Online purchase',
        category: 'Shopping',
        date: new Date('2024-01-12'),
        balanceAfter: -1250.50
      },
      {
        id: '5',
        accountId: '1',
        type: 'expense',
        amount: 45.00,
        description: 'Gas station',
        category: 'Transportation',
        date: new Date('2024-01-11'),
        balanceAfter: -54.25
      },
      {
        id: '6',
        accountId: '4',
        type: 'income',
        amount: 1500.00,
        description: 'Dividend payment',
        category: 'Investment',
        date: new Date('2024-01-10'),
        balanceAfter: 45000.00
      }
    ];
  }
}
