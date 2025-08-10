import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { ConfigService } from '../../config/config.service';

export interface WalletAccount {
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

export interface Transaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  category: string;
  date: Date;
  balanceAfter: number;
}

export interface WalletSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  accountCount: number;
  currency: string;
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private readonly API_URL: string;
  
  private accountsSubject = new BehaviorSubject<WalletAccount[]>([]);
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  private summarySubject = new BehaviorSubject<WalletSummary | null>(null);

  public accounts$ = this.accountsSubject.asObservable();
  public transactions$ = this.transactionsSubject.asObservable();
  public summary$ = this.summarySubject.asObservable();

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.API_URL = this.configService.getApiUrl();
    this.loadInitialData();
  }

  // Load initial data from localStorage or API
  private loadInitialData(): void {
    const storedAccounts = this.getStoredAccounts();
    const storedTransactions = this.getStoredTransactions();
    
    if (storedAccounts.length > 0) {
      this.accountsSubject.next(storedAccounts);
      this.updateSummary();
    }
    
    if (storedTransactions.length > 0) {
      this.transactionsSubject.next(storedTransactions);
    }
  }

  // Account Management
  getAccounts(): Observable<WalletAccount[]> {
    return this.http.get<WalletAccount[]>(`${this.API_URL}/wallet/accounts`)
      .pipe(
        tap(accounts => {
          this.accountsSubject.next(accounts);
          this.storeAccounts(accounts);
          this.updateSummary();
        }),
        catchError(error => {
          console.error('Error fetching accounts:', error);
          return of(this.getStoredAccounts());
        })
      );
  }

  getAccountById(id: string): Observable<WalletAccount | null> {
    const account = this.accountsSubject.value.find(acc => acc.id === id);
    if (account) {
      return of(account);
    }
    
    return this.http.get<WalletAccount>(`${this.API_URL}/wallet/accounts/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching account:', error);
          return of(null);
        })
      );
  }

  createAccount(account: Omit<WalletAccount, 'id' | 'createdAt' | 'updatedAt'>): Observable<WalletAccount> {
    return this.http.post<WalletAccount>(`${this.API_URL}/wallet/accounts`, account)
      .pipe(
        tap(newAccount => {
          const currentAccounts = this.accountsSubject.value;
          this.accountsSubject.next([...currentAccounts, newAccount]);
          this.storeAccounts([...currentAccounts, newAccount]);
          this.updateSummary();
        })
      );
  }

  updateAccount(id: string, updates: Partial<WalletAccount>): Observable<WalletAccount> {
    return this.http.put<WalletAccount>(`${this.API_URL}/wallet/accounts/${id}`, updates)
      .pipe(
        tap(updatedAccount => {
          const currentAccounts = this.accountsSubject.value;
          const updatedAccounts = currentAccounts.map(acc => 
            acc.id === id ? { ...acc, ...updatedAccount, updatedAt: new Date() } : acc
          );
          this.accountsSubject.next(updatedAccounts);
          this.storeAccounts(updatedAccounts);
          this.updateSummary();
        })
      );
  }

  deleteAccount(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/wallet/accounts/${id}`)
      .pipe(
        tap(() => {
          const currentAccounts = this.accountsSubject.value;
          const filteredAccounts = currentAccounts.filter(acc => acc.id !== id);
          this.accountsSubject.next(filteredAccounts);
          this.storeAccounts(filteredAccounts);
          this.updateSummary();
        })
      );
  }

  // Transaction Management
  getTransactions(accountId?: string): Observable<Transaction[]> {
    const url = accountId 
      ? `${this.API_URL}/wallet/transactions?accountId=${accountId}`
      : `${this.API_URL}/wallet/transactions`;
    
    return this.http.get<Transaction[]>(url)
      .pipe(
        tap(transactions => {
          this.transactionsSubject.next(transactions);
          this.storeTransactions(transactions);
        }),
        catchError(error => {
          console.error('Error fetching transactions:', error);
          return of(this.getStoredTransactions());
        })
      );
  }

  addTransaction(transaction: Omit<Transaction, 'id' | 'balanceAfter'>): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.API_URL}/wallet/transactions`, transaction)
      .pipe(
        tap(newTransaction => {
          const currentTransactions = this.transactionsSubject.value;
          this.transactionsSubject.next([newTransaction, ...currentTransactions]);
          this.storeTransactions([newTransaction, ...currentTransactions]);
          this.updateAccountBalance(newTransaction.accountId, newTransaction.amount, newTransaction.type);
        })
      );
  }

  // Helper Methods
  private updateAccountBalance(accountId: string, amount: number, type: 'income' | 'expense' | 'transfer'): void {
    const currentAccounts = this.accountsSubject.value;
    const accountIndex = currentAccounts.findIndex(acc => acc.id === accountId);
    
    if (accountIndex !== -1) {
      const account = currentAccounts[accountIndex];
      let newBalance = account.balance;
      
      if (type === 'income') {
        newBalance += amount;
      } else if (type === 'expense') {
        newBalance -= amount;
      }
      // For transfers, balance might not change depending on implementation
      
      const updatedAccount = { ...account, balance: newBalance, updatedAt: new Date() };
      currentAccounts[accountIndex] = updatedAccount;
      
      this.accountsSubject.next([...currentAccounts]);
      this.storeAccounts(currentAccounts);
      this.updateSummary();
    }
  }

  private updateSummary(): void {
    const accounts = this.accountsSubject.value;
    const transactions = this.transactionsSubject.value;
    
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const summary: WalletSummary = {
      totalBalance,
      totalIncome,
      totalExpenses,
      accountCount: accounts.length,
      currency: accounts.length > 0 ? accounts[0].currency : 'USD'
    };
    
    this.summarySubject.next(summary);
  }

  // Local Storage Methods
  private storeAccounts(accounts: WalletAccount[]): void {
    localStorage.setItem('wallet_accounts', JSON.stringify(accounts));
  }

  private getStoredAccounts(): WalletAccount[] {
    try {
      const stored = localStorage.getItem('wallet_accounts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private storeTransactions(transactions: Transaction[]): void {
    localStorage.setItem('wallet_transactions', JSON.stringify(transactions));
  }

  private getStoredTransactions(): Transaction[] {
    try {
      const stored = localStorage.getItem('wallet_transactions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Utility Methods
  getAccountBalance(accountId: string): number {
    const account = this.accountsSubject.value.find(acc => acc.id === accountId);
    return account ? account.balance : 0;
  }

  getTotalBalance(): number {
    return this.accountsSubject.value.reduce((sum, acc) => sum + acc.balance, 0);
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
}
