import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin, switchMap, timeout } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

import { CurrentUserService } from '../../../../core/services/current-user.service';
import { Account } from '../../../accounts/models/account.model';
import { AccountService } from '../../../accounts/services/account.service';
import {
  Category,
  Currency,
  TransactionType
} from '../../../catalogs/models/catalog.model';
import { CatalogService } from '../../../catalogs/services/catalog.service';
import { Contact } from '../../../contacts/models/contact.model';
import { ContactService } from '../../../contacts/services/contact.service';
import {
  SaveTransactionRequest,
  Transaction,
  TransactionTypeCode
} from '../../models/transaction.model';
import { TransactionService } from '../../services/transaction.service';
import { getErrorMessage } from '../../../../shared/utils/error-message';

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule
  ],
  templateUrl: './transactions-page.component.html',
  styleUrl: './transactions-page.component.css'
})
export class TransactionsPageComponent {
  private readonly currentUserService = inject(CurrentUserService);
  private readonly accountService = inject(AccountService);
  private readonly catalogService = inject(CatalogService);
  private readonly contactService = inject(ContactService);
  private readonly transactionService = inject(TransactionService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly displayedColumns = [
    'date',
    'type',
    'description',
    'accounts',
    'amount',
    'actions'
  ];

  accounts: Account[] = [];
  categories: Category[] = [];
  contacts: Contact[] = [];
  currencies: Currency[] = [];
  transactionTypes: TransactionType[] = [];
  transactions: Transaction[] = [];
  editingTransaction: Transaction | null = null;
  errorMessage = '';
  loading = true;
  saving = false;
  userId!: number;

  readonly form = inject(FormBuilder).group({
    transactionTypeCode: ['EXPENSE' as TransactionTypeCode, Validators.required],
    categoryId: [null as number | null],
    sourceAccountId: [null as number | null],
    destinationAccountId: [null as number | null],
    sourceContactId: [null as number | null],
    destinationContactId: [null as number | null],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    currencyId: [null as number | null, Validators.required],
    transactionDate: [this.todayAsDate(), Validators.required],
    description: [''],
    referenceCode: ['']
  });

  ngOnInit(): void {
    this.form.controls.transactionTypeCode.valueChanges.subscribe(() => {
      this.applyTypeDefaults();
    });
    this.loadData();
  }

  get typeCode(): TransactionTypeCode {
    return this.form.controls.transactionTypeCode.value ?? 'EXPENSE';
  }

  get filteredCategories(): Category[] {
    return this.categories.filter(
      (category) => category.transactionTypeCode === this.typeCode
    );
  }

  get filteredAccounts(): Account[] {
    const currencyId = this.form.controls.currencyId.value;
    return currencyId
      ? this.accounts.filter((account) => account.currencyId === currencyId)
      : this.accounts;
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

  edit(transaction: Transaction): void {
    this.editingTransaction = transaction;
    this.form.patchValue({
      transactionTypeCode: transaction.transactionTypeCode,
      categoryId: transaction.categoryId,
      sourceAccountId: transaction.sourceAccountId,
      destinationAccountId: transaction.destinationAccountId,
      sourceContactId: transaction.sourceContactId,
      destinationContactId: transaction.destinationContactId,
      amount: transaction.amount,
      currencyId: transaction.currencyId,
      transactionDate: this.parseDate(transaction.transactionDate),
      description: transaction.description ?? '',
      referenceCode: transaction.referenceCode ?? ''
    });
  }

  cancelEdit(): void {
    this.editingTransaction = null;
    this.form.reset({
      transactionTypeCode: 'EXPENSE',
      categoryId: null,
      sourceAccountId: null,
      destinationAccountId: null,
      sourceContactId: null,
      destinationContactId: null,
      amount: 0,
      currencyId: this.defaultCurrencyId(),
      transactionDate: this.todayAsDate(),
      description: '',
      referenceCode: ''
    });
    this.applyTypeDefaults();
  }

  save(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.buildRequest();
    const validationMessage = this.validateTransaction(request);

    if (validationMessage) {
      this.snackBar.open(validationMessage, 'Cerrar', { duration: 3500 });
      return;
    }

    this.saving = true;
    const request$ = this.editingTransaction
      ? this.transactionService.updateTransaction(this.editingTransaction.id, request)
      : this.transactionService.createTransaction(request);

    request$.subscribe({
      next: () => {
        this.snackBar.open('Transaccion guardada', 'Cerrar', { duration: 2500 });
        this.cancelEdit();
        this.loadOperationalData();
        this.cdr.detectChanges();
      },
      error: (error) => this.showError(error),
      complete: () => {
        this.saving = false;
      }
    });
  }

  delete(transaction: Transaction): void {
    if (!confirm('Eliminar esta transaccion?')) {
      return;
    }

    this.transactionService.deleteTransaction(transaction.id).subscribe({
      next: () => {
        this.snackBar.open('Transaccion eliminada', 'Cerrar', { duration: 2500 });
        this.loadOperationalData();
        this.cdr.detectChanges();
      },
      error: (error) => this.showError(error)
    });
  }

  private loadData(): void {
    this.loading = true;
    this.currentUserService
      .getCurrentUser()
      .pipe(
        switchMap((user) => {
          this.userId = user.id;
          return forkJoin({
            accounts: this.accountService.getAccounts(user.id),
            categories: this.catalogService.getCategories(),
            contacts: this.contactService.getContacts(user.id),
            currencies: this.catalogService.getCurrencies(),
            transactionTypes: this.catalogService.getTransactionTypes(),
            transactions: this.transactionService.getTransactions(user.id)
          });
        }),
        timeout(8000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.accounts = data.accounts;
          this.categories = data.categories;
          this.contacts = data.contacts;
          this.currencies = data.currencies;
          this.transactionTypes = data.transactionTypes;
          this.transactions = data.transactions;
          this.cancelEdit();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = getErrorMessage(error);
          this.showError(error);
          this.cdr.detectChanges();
        }
      });
  }

  private loadOperationalData(): void {
    forkJoin({
      accounts: this.accountService.getAccounts(this.userId),
      transactions: this.transactionService.getTransactions(this.userId)
    }).subscribe({
      next: ({ accounts, transactions }) => {
        this.accounts = accounts;
        this.transactions = transactions;
        this.cdr.detectChanges();
      },
      error: (error) => this.showError(error)
    });
  }

  private applyTypeDefaults(): void {
    const type = this.typeCode;

    if (type === 'INCOME') {
      this.form.patchValue({
        sourceAccountId: null,
        destinationContactId: null
      });
      return;
    }

    if (type === 'EXPENSE') {
      this.form.patchValue({
        destinationAccountId: null,
        sourceContactId: null
      });
      return;
    }

    this.form.patchValue({
      sourceContactId: null,
      destinationContactId: null
    });
  }

  private buildRequest(): SaveTransactionRequest {
    const raw = this.form.getRawValue();

    return {
      userId: this.userId,
      transactionTypeCode: raw.transactionTypeCode ?? 'EXPENSE',
      categoryId: raw.categoryId ? Number(raw.categoryId) : null,
      sourceAccountId: raw.sourceAccountId ? Number(raw.sourceAccountId) : null,
      destinationAccountId: raw.destinationAccountId
        ? Number(raw.destinationAccountId)
        : null,
      sourceContactId: raw.sourceContactId ? Number(raw.sourceContactId) : null,
      destinationContactId: raw.destinationContactId
        ? Number(raw.destinationContactId)
        : null,
      amount: Number(raw.amount ?? 0),
      currencyId: Number(raw.currencyId),
      transactionDate: this.formatDate(raw.transactionDate),
      description: raw.description || null,
      referenceCode: raw.referenceCode || null
    };
  }

  private validateTransaction(request: SaveTransactionRequest): string | null {
    if (request.transactionTypeCode === 'INCOME' && !request.destinationAccountId) {
      return 'Un ingreso requiere una cuenta destino.';
    }

    if (request.transactionTypeCode === 'EXPENSE' && !request.sourceAccountId) {
      return 'Un gasto requiere una cuenta origen.';
    }

    if (request.transactionTypeCode === 'INTERNAL_TRANSFER') {
      if (!request.sourceAccountId || !request.destinationAccountId) {
        return 'Una transferencia requiere cuenta origen y destino.';
      }

      if (request.sourceAccountId === request.destinationAccountId) {
        return 'La cuenta origen y destino deben ser diferentes.';
      }
    }

    return null;
  }

  private defaultCurrencyId(): number | null {
    return this.currencies.find((currency) => currency.code === 'PEN')?.id ?? null;
  }

  private todayAsDate(): Date {
    return this.parseDate(new Date().toISOString().slice(0, 10));
  }

  private parseDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private formatDate(value: Date | string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    if (typeof value === 'string') {
      return value;
    }

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private showError(error: unknown): void {
    this.saving = false;
    this.snackBar.open(this.extractMessage(error), 'Cerrar', { duration: 4500 });
    this.cdr.detectChanges();
  }

  private extractMessage(error: any): string {
    return getErrorMessage(error);
  }
}
