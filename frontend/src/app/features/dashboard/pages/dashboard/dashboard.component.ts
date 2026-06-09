import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, forkJoin, switchMap, timeout } from 'rxjs';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';

import { CurrentUserService } from '../../../../core/services/current-user.service';
import { Account } from '../../../accounts/models/account.model';
import { AccountService } from '../../../accounts/services/account.service';
import {
  Transaction,
  TransactionTypeCode
} from '../../../transactions/models/transaction.model';
import { TransactionService } from '../../../transactions/services/transaction.service';
import { getErrorMessage } from '../../../../shared/utils/error-message';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('dailyChartCanvas')
  private dailyChartCanvas?: ElementRef<HTMLCanvasElement>;

  readonly displayedColumns = ['date', 'type', 'description', 'amount'];
  readonly expenseChartColors = [
    '#ef4444',
    '#6366f1',
    '#14b8a6',
    '#f59e0b',
    '#ec4899'
  ];
  readonly transactionTypeColors: Record<TransactionTypeCode, string> = {
    EXPENSE: '#dc2626',
    INTERNAL_TRANSFER: '#f59e0b',
    INCOME: '#16a34a'
  };
  readonly transactionTypeFilters: Array<{
    label: string;
    value: TransactionTypeCode | null;
  }> = [
    { label: 'Todos', value: null },
    { label: 'Ingresos', value: 'INCOME' },
    { label: 'Gastos', value: 'EXPENSE' },
    { label: 'Transferencias internas', value: 'INTERNAL_TRANSFER' }
  ];

  accounts: Account[] = [];
  balanceView: 'currency' | 'account' = 'currency';
  selectedAccountId: number | null = null;
  selectedTransactionTypeCode: TransactionTypeCode | null = null;
  allTransactions: Transaction[] = [];
  transactions: Transaction[] = [];
  errorMessage = '';
  loading = true;
  transactionsLoading = false;
  userId!: number;
  private dailyChart?: Chart;
  private viewInitialized = false;

  constructor(
    private readonly currentUserService: CurrentUserService,
    private readonly accountService: AccountService,
    private readonly transactionService: TransactionService,
    private readonly snackBar: MatSnackBar,
    private readonly cdr: ChangeDetectorRef
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.currentUserService
      .getCurrentUser()
      .pipe(
        switchMap((user) => {
          this.userId = user.id;
          return forkJoin({
            accounts: this.accountService.getAccounts(user.id),
            transactions: this.transactionService.getTransactions({ userId: user.id })
          });
        }),
        timeout(8000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: ({ accounts, transactions }) => {
          this.accounts = accounts;
          this.allTransactions = transactions;
          this.transactions = transactions.slice(0, 8);
          this.cdr.detectChanges();
          this.scheduleDailyChartRender();
        },
        error: (error) => {
          this.errorMessage = getErrorMessage(error);
          this.snackBar.open(this.errorMessage, 'Cerrar', { duration: 4000 });
          this.cdr.detectChanges();
        }
      });
  }

  onTransactionFilterChange(): void {
    if (!this.userId) {
      return;
    }

    this.transactionsLoading = true;
    this.transactionService
      .getTransactions({
        userId: this.userId,
        accountId: this.selectedAccountId,
        transactionTypeCode: this.selectedTransactionTypeCode
      })
      .pipe(
        timeout(8000),
        finalize(() => {
          this.transactionsLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (transactions) => {
          this.allTransactions = transactions;
          this.transactions = transactions.slice(0, 8);
          this.cdr.detectChanges();
          this.scheduleDailyChartRender();
        },
        error: (error) => {
          const message = getErrorMessage(error);
          this.snackBar.open(message, 'Cerrar', { duration: 4000 });
          this.cdr.detectChanges();
        }
      });
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.renderDailyChart();
  }

  ngOnDestroy(): void {
    this.dailyChart?.destroy();
  }

  balanceByCurrency(): Array<{ currencyCode: string; total: number }> {
    const totals = new Map<string, number>();

    for (const account of this.accounts) {
      totals.set(
        account.currencyCode,
        (totals.get(account.currencyCode) ?? 0) + Number(account.currentBalance)
      );
    }

    return Array.from(totals.entries()).map(([currencyCode, total]) => ({
      currencyCode,
      total
    }));
  }

  accountBalanceBars(): Array<{
    account: Account;
    percent: number;
  }> {
    const maxBalance = Math.max(
      ...this.accounts.map((account) => Math.abs(Number(account.currentBalance))),
      1
    );

    return this.accounts.map((account) => ({
      account,
      percent: Math.min(
        (Math.abs(Number(account.currentBalance)) / maxBalance) * 100,
        100
      )
    }));
  }

  accountShareByCurrency(): Array<{
    currencyCode: string;
    total: number;
    accounts: Array<{
      account: Account;
      percent: number;
    }>;
  }> {
    const groups = new Map<string, Account[]>();

    for (const account of this.accounts) {
      const accounts = groups.get(account.currencyCode) ?? [];
      accounts.push(account);
      groups.set(account.currencyCode, accounts);
    }

    return Array.from(groups.entries()).map(([currencyCode, accounts]) => {
      const total = accounts.reduce(
        (sum, account) => sum + Math.max(Number(account.currentBalance), 0),
        0
      );

      return {
        currencyCode,
        total,
        accounts: accounts.map((account) => ({
          account,
          percent: total
            ? (Math.max(Number(account.currentBalance), 0) / total) * 100
            : 0
        }))
      };
    });
  }

  incomeExpenseBreakdown(): Array<{
    typeCode: 'INCOME' | 'EXPENSE';
    label: string;
    total: number;
    count: number;
    percent: number;
    color: string;
  }> {
    const totals = new Map<'INCOME' | 'EXPENSE', { total: number; count: number }>();

    for (const transaction of this.allTransactions) {
      if (transaction.transactionTypeCode === 'INTERNAL_TRANSFER') {
        continue;
      }

      const current = totals.get(transaction.transactionTypeCode) ?? {
        total: 0,
        count: 0
      };

      current.total += Number(transaction.amount);
      current.count += 1;
      totals.set(transaction.transactionTypeCode, current);
    }

    const grandTotal = Array.from(totals.values()).reduce(
      (sum, item) => sum + item.total,
      0
    );

    return (['INCOME', 'EXPENSE'] as Array<'INCOME' | 'EXPENSE'>)
      .map((typeCode) => {
        const item = totals.get(typeCode) ?? { total: 0, count: 0 };

        return {
          typeCode,
          label: this.transactionTypeLabel(typeCode),
          total: item.total,
          count: item.count,
          percent: grandTotal ? (item.total / grandTotal) * 100 : 0,
          color: this.transactionTypeColors[typeCode]
        };
      })
      .filter((item) => item.count > 0);
  }

  incomeExpenseDonut(): string {
    const breakdown = this.incomeExpenseBreakdown();

    if (breakdown.length === 0) {
      return '#e2e8f0';
    }

    let cursor = 0;
    const stops = breakdown.map((item) => {
      const start = cursor;
      cursor += item.percent;
      return `${item.color} ${start}% ${cursor}%`;
    });

    return `conic-gradient(${stops.join(', ')})`;
  }

  dailyIncomeExpenseBars(): Array<{
    date: string;
    income: number;
    expense: number;
    incomePercent: number;
    expensePercent: number;
  }> {
    const totals = new Map<string, { income: number; expense: number }>();

    for (const transaction of this.allTransactions) {
      if (transaction.transactionTypeCode === 'INTERNAL_TRANSFER') {
        continue;
      }

      const day = totals.get(transaction.transactionDate) ?? {
        income: 0,
        expense: 0
      };

      if (transaction.transactionTypeCode === 'INCOME') {
        day.income += Number(transaction.amount);
      } else {
        day.expense += Number(transaction.amount);
      }

      totals.set(transaction.transactionDate, day);
    }

    const entries = this.dailyChartDateRange().map((date) => [
      date,
      totals.get(date) ?? { income: 0, expense: 0 }
    ] as const);
    const maxAmount = Math.max(
      ...entries.flatMap(([, item]) => [item.income, item.expense]),
      1
    );

    return entries.map(([date, item]) => ({
      date,
      income: item.income,
      expense: item.expense,
      incomePercent: (item.income / maxAmount) * 100,
      expensePercent: (item.expense / maxAmount) * 100
    }));
  }

  dailyIncomeExpenseChart(): Array<{
    date: string;
    label: string;
    income: number;
    expense: number;
    x: number;
    incomeY: number;
    expenseY: number;
    incomeHeight: number;
    expenseHeight: number;
  }> {
    const days = this.dailyIncomeExpenseBars();

    return days.map((day, index) => {
      const x = days.length === 1 ? 50 : 10 + (index / (days.length - 1)) * 80;
      const incomeHeight = (day.incomePercent / 100) * 58;
      const expenseHeight = (day.expensePercent / 100) * 58;

      return {
        ...day,
        label: this.shortDate(day.date),
        x,
        incomeY: 72 - incomeHeight,
        expenseY: 72 - expenseHeight,
        incomeHeight,
        expenseHeight
      };
    });
  }

  dailyIncomeLinePoints(): string {
    return this.dailyLinePoints('incomeY');
  }

  dailyExpenseLinePoints(): string {
    return this.dailyLinePoints('expenseY');
  }

  movementRows(transaction: Transaction): Array<{
    label: string;
    accountName: string;
    amount: number;
    currencyCode: string;
    direction: 'in' | 'out';
  }> {
    if (transaction.transactionTypeCode === 'INTERNAL_TRANSFER') {
      return [
        {
          label: 'Sale de',
          accountName: transaction.sourceAccountName || '-',
          amount: Number(transaction.amount),
          currencyCode: transaction.currencyCode,
          direction: 'out'
        },
        {
          label: 'Entra a',
          accountName: transaction.destinationAccountName || '-',
          amount: Number(transaction.amount),
          currencyCode: transaction.currencyCode,
          direction: 'in'
        }
      ];
    }

    if (transaction.transactionTypeCode === 'INCOME') {
      return [
        {
          label: 'Entra a',
          accountName: transaction.destinationAccountName || '-',
          amount: Number(transaction.amount),
          currencyCode: transaction.currencyCode,
          direction: 'in'
        }
      ];
    }

    return [
      {
        label: 'Sale de',
        accountName: transaction.sourceAccountName || '-',
        amount: Number(transaction.amount),
        currencyCode: transaction.currencyCode,
        direction: 'out'
      }
    ];
  }

  expenseCategoryBreakdown(): Array<{
    name: string;
    total: number;
    percent: number;
    color: string;
  }> {
    const totals = new Map<string, number>();

    for (const transaction of this.allTransactions) {
      if (transaction.transactionTypeCode !== 'EXPENSE') {
        continue;
      }

      const name = transaction.categoryName || 'Sin categoria';
      totals.set(name, (totals.get(name) ?? 0) + Number(transaction.amount));
    }

    const entries = Array.from(totals.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    const maxTotal = Math.max(...entries.map((entry) => entry.total), 1);

    return entries.map((entry, index) => ({
      ...entry,
      percent: Math.min((entry.total / maxTotal) * 100, 100),
      color: this.expenseChartColors[index % this.expenseChartColors.length]
    }));
  }

  expenseCategoryTotal(): number {
    return this.expenseCategoryBreakdown().reduce(
      (sum, category) => sum + category.total,
      0
    );
  }

  expenseCategoryPie(): string {
    const categories = this.expenseCategoryBreakdown();
    const total = this.expenseCategoryTotal();

    if (categories.length === 0 || total === 0) {
      return '#e2e8f0';
    }

    let cursor = 0;
    const stops = categories.map((category) => {
      const start = cursor;
      const end = cursor + (category.total / total) * 100;
      cursor = end;
      return `${category.color} ${start}% ${end}%`;
    });

    return `conic-gradient(${stops.join(', ')})`;
  }

  currencySymbol(currencyCode: string): string {
    const symbols: Record<string, string> = {
      PEN: 'S/.',
      USD: '$',
      EUR: '€'
    };

    return symbols[currencyCode] ?? currencyCode;
  }

  formatMoney(currencyCode: string, amount: number): string {
    return `${this.currencySymbol(currencyCode)} ${Number(amount).toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  formatCompactMoney(currencyCode: string, amount: number): string {
    const value = Number(amount);

    if (Math.abs(value) >= 1000) {
      return `${this.currencySymbol(currencyCode)} ${(value / 1000).toLocaleString('es-PE', {
        maximumFractionDigits: 1
      })}k`;
    }

    return `${this.currencySymbol(currencyCode)} ${value.toLocaleString('es-PE', {
      maximumFractionDigits: 0
    })}`;
  }

  private scheduleDailyChartRender(): void {
    window.setTimeout(() => this.renderDailyChart());
  }

  private renderDailyChart(): void {
    if (!this.viewInitialized || !this.dailyChartCanvas) {
      return;
    }

    const days = this.dailyIncomeExpenseChart();
    const currencyCode = this.primaryCurrencyCode();
    const ctx = this.dailyChartCanvas.nativeElement;
    const labels = days.map((day) => day.label);
    const incomeValues = days.map((day) => day.income);
    const expenseValues = days.map((day) => day.expense);

    this.dailyChart?.destroy();

    const config: ChartConfiguration<'bar' | 'line', number[], string> = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Ingresos',
            data: incomeValues,
            backgroundColor: 'rgba(22, 163, 74, 0.78)',
            borderColor: '#15803d',
            borderRadius: 8,
            borderSkipped: false,
            maxBarThickness: 34,
            order: 2
          },
          {
            type: 'bar',
            label: 'Gastos',
            data: expenseValues,
            backgroundColor: 'rgba(220, 38, 38, 0.72)',
            borderColor: '#b91c1c',
            borderRadius: 8,
            borderSkipped: false,
            maxBarThickness: 34,
            order: 2
          },
          {
            type: 'line',
            label: 'Tendencia ingresos',
            data: incomeValues,
            borderColor: '#16a34a',
            backgroundColor: '#16a34a',
            borderWidth: 3,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#16a34a',
            pointBorderWidth: 2,
            pointRadius: 4,
            tension: 0.35,
            order: 1
          },
          {
            type: 'line',
            label: 'Tendencia gastos',
            data: expenseValues,
            borderColor: '#dc2626',
            backgroundColor: '#dc2626',
            borderWidth: 3,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#dc2626',
            pointBorderWidth: 2,
            pointRadius: 4,
            tension: 0.35,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            labels: {
              boxHeight: 10,
              boxWidth: 18,
              color: '#475569',
              font: {
                size: 12,
                weight: 700
              },
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.dataset.label}: ${this.formatMoney(
                  currencyCode,
                  Number(context.raw ?? 0)
                )}`
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#64748b',
              font: {
                size: 12,
                weight: 700
              }
            }
          },
          y: {
            beginAtZero: true,
            border: {
              display: false
            },
            grid: {
              color: '#e2e8f0'
            },
            ticks: {
              color: '#64748b',
              callback: (value) => this.formatCompactMoney(currencyCode, Number(value))
            }
          }
        }
      }
    };

    this.dailyChart = new Chart(ctx, config);
  }

  primaryCurrencyCode(): string {
    if (this.selectedAccountId) {
      return (
        this.accounts.find((account) => account.id === this.selectedAccountId)
          ?.currencyCode ?? 'PEN'
      );
    }

    return this.allTransactions[0]?.currencyCode ?? this.accounts[0]?.currencyCode ?? 'PEN';
  }

  transactionTypeLabel(typeCode: TransactionTypeCode): string {
    const labels: Record<TransactionTypeCode, string> = {
      EXPENSE: 'Gasto',
      INTERNAL_TRANSFER: 'Transferencia interna',
      INCOME: 'Ingreso'
    };

    return labels[typeCode];
  }

  transactionTypeChipClass(typeCode: TransactionTypeCode): string {
    return `transaction-chip transaction-chip-${typeCode.toLowerCase().replace('_', '-')}`;
  }

  private dailyLinePoints(field: 'incomeY' | 'expenseY'): string {
    const days = this.dailyIncomeExpenseChart();

    if (days.length === 0) {
      return '';
    }

    return days
      .map((day) => `${day.x},${day[field]}`)
      .join(' ');
  }

  private shortDate(date: string): string {
    const [, month, day] = date.split('-');
    return `${day}/${month}`;
  }

  private dailyChartDateRange(): string[] {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - 4 + index);
      return this.formatDateKey(date);
    });
  }

  private formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
