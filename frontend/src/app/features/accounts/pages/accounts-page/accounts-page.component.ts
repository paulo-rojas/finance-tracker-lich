import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin, switchMap, timeout } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

import { CurrentUserService } from '../../../../core/services/current-user.service';
import { Account } from '../../models/account.model';
import { AccountService } from '../../services/account.service';
import { AccountType, Currency } from '../../../catalogs/models/catalog.model';
import { CatalogService } from '../../../catalogs/services/catalog.service';
import { getErrorMessage } from '../../../../shared/utils/error-message';

@Component({
  selector: 'app-accounts-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule
  ],
  templateUrl: './accounts-page.component.html',
  styleUrl: './accounts-page.component.css'
})
export class AccountsPageComponent {
  private readonly currentUserService = inject(CurrentUserService);
  private readonly accountService = inject(AccountService);
  private readonly catalogService = inject(CatalogService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly displayedColumns = [
    'name',
    'type',
    'currency',
    'balance',
    'status',
    'actions'
  ];

  accounts: Account[] = [];
  accountTypes: AccountType[] = [];
  currencies: Currency[] = [];
  editingAccount: Account | null = null;
  errorMessage = '';
  loading = true;
  saving = false;
  userId!: number;

  readonly form = inject(FormBuilder).group({
    accountTypeId: [null as number | null, Validators.required],
    currencyId: [null as number | null, Validators.required],
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    initialBalance: [0, [Validators.required, Validators.min(0)]],
    isActive: [true]
  });

  ngOnInit(): void {
    this.loadData();
  }

  edit(account: Account): void {
    this.editingAccount = account;
    this.form.patchValue({
      accountTypeId: account.accountTypeId,
      currencyId: account.currencyId,
      name: account.name,
      description: account.description ?? '',
      initialBalance: account.initialBalance,
      isActive: account.isActive
    });
    this.form.controls.currencyId.disable();
    this.form.controls.initialBalance.disable();
  }

  cancelEdit(): void {
    this.editingAccount = null;
    this.form.reset({
      accountTypeId: null,
      currencyId: this.defaultCurrencyId(),
      name: '',
      description: '',
      initialBalance: 0,
      isActive: true
    });
    this.form.controls.currencyId.enable();
    this.form.controls.initialBalance.enable();
  }

  save(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const raw = this.form.getRawValue();
    const request$ = this.editingAccount
      ? this.accountService.updateAccount(this.editingAccount.id, {
          accountTypeId: Number(raw.accountTypeId),
          name: raw.name ?? '',
          description: raw.description || null,
          isActive: !!raw.isActive
        })
      : this.accountService.createAccount({
          userId: this.userId,
          accountTypeId: Number(raw.accountTypeId),
          currencyId: Number(raw.currencyId),
          name: raw.name ?? '',
          description: raw.description || null,
          initialBalance: Number(raw.initialBalance ?? 0)
        });

    request$.subscribe({
      next: () => {
        this.snackBar.open('Cuenta guardada', 'Cerrar', { duration: 2500 });
        this.cancelEdit();
        this.loadAccounts();
        this.cdr.detectChanges();
      },
      error: (error) => this.showError(error),
      complete: () => {
        this.saving = false;
      }
    });
  }

  delete(account: Account): void {
    if (!confirm(`Eliminar la cuenta "${account.name}"?`)) {
      return;
    }

    this.accountService.deleteAccount(account.id).subscribe({
      next: () => {
        this.snackBar.open('Cuenta eliminada', 'Cerrar', { duration: 2500 });
        this.loadAccounts();
        this.cdr.detectChanges();
      },
      error: (error) => this.showError(error)
    });
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

  private loadData(): void {
    this.loading = true;
    this.currentUserService
      .getCurrentUser()
      .pipe(
        switchMap((user) => {
          this.userId = user.id;
          return forkJoin({
            accountTypes: this.catalogService.getAccountTypes(),
            currencies: this.catalogService.getCurrencies(),
            accounts: this.accountService.getAccounts(user.id)
          });
        }),
        timeout(8000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: ({ accountTypes, currencies, accounts }) => {
          this.accountTypes = accountTypes;
          this.currencies = currencies;
          this.accounts = accounts;
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

  private loadAccounts(): void {
    this.accountService.getAccounts(this.userId).subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.cdr.detectChanges();
      },
      error: (error) => this.showError(error)
    });
  }

  private defaultCurrencyId(): number | null {
    return this.currencies.find((currency) => currency.code === 'PEN')?.id ?? null;
  }

  private showError(error: unknown): void {
    this.saving = false;
    const message = this.extractMessage(error);
    this.snackBar.open(message, 'Cerrar', { duration: 4000 });
    this.cdr.detectChanges();
  }

  private extractMessage(error: any): string {
    return getErrorMessage(error);
  }
}
