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
import { ContactType } from '../../../catalogs/models/catalog.model';
import { CatalogService } from '../../../catalogs/services/catalog.service';
import { Contact } from '../../models/contact.model';
import { ContactService } from '../../services/contact.service';
import { getErrorMessage } from '../../../../shared/utils/error-message';

@Component({
  selector: 'app-contacts-page',
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
  templateUrl: './contacts-page.component.html',
  styleUrl: './contacts-page.component.css'
})
export class ContactsPageComponent {
  private readonly currentUserService = inject(CurrentUserService);
  private readonly catalogService = inject(CatalogService);
  private readonly contactService = inject(ContactService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly displayedColumns = ['name', 'type', 'phone', 'email', 'status', 'actions'];

  contacts: Contact[] = [];
  contactTypes: ContactType[] = [];
  editingContact: Contact | null = null;
  errorMessage = '';
  loading = true;
  saving = false;
  userId!: number;

  readonly form = inject(FormBuilder).group({
    contactTypeId: [null as number | null, Validators.required],
    name: ['', [Validators.required, Validators.maxLength(120)]],
    phone: [''],
    email: ['', Validators.email],
    notes: [''],
    isActive: [true]
  });

  ngOnInit(): void {
    this.loadData();
  }

  edit(contact: Contact): void {
    this.editingContact = contact;
    this.form.patchValue({
      contactTypeId: contact.contactTypeId,
      name: contact.name,
      phone: contact.phone ?? '',
      email: contact.email ?? '',
      notes: contact.notes ?? '',
      isActive: contact.isActive
    });
  }

  cancelEdit(): void {
    this.editingContact = null;
    this.form.reset({
      contactTypeId: this.defaultContactTypeId(),
      name: '',
      phone: '',
      email: '',
      notes: '',
      isActive: true
    });
  }

  save(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const raw = this.form.getRawValue();
    const payload = {
      contactTypeId: Number(raw.contactTypeId),
      name: raw.name ?? '',
      phone: raw.phone || null,
      email: raw.email || null,
      notes: raw.notes || null
    };

    const request$ = this.editingContact
      ? this.contactService.updateContact(this.editingContact.id, {
          ...payload,
          isActive: !!raw.isActive
        })
      : this.contactService.createContact({
          ...payload,
          userId: this.userId
        });

    request$.subscribe({
      next: () => {
        this.snackBar.open('Contacto guardado', 'Cerrar', { duration: 2500 });
        this.cancelEdit();
        this.loadContacts();
        this.cdr.detectChanges();
      },
      error: (error) => this.showError(error),
      complete: () => {
        this.saving = false;
      }
    });
  }

  delete(contact: Contact): void {
    if (!confirm(`Eliminar el contacto "${contact.name}"?`)) {
      return;
    }

    this.contactService.deleteContact(contact.id).subscribe({
      next: () => {
        this.snackBar.open('Contacto eliminado', 'Cerrar', { duration: 2500 });
        this.loadContacts();
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
            contactTypes: this.catalogService.getContactTypes(),
            contacts: this.contactService.getContacts(user.id)
          });
        }),
        timeout(8000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: ({ contactTypes, contacts }) => {
          this.contactTypes = contactTypes;
          this.contacts = contacts;
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

  private loadContacts(): void {
    this.contactService.getContacts(this.userId).subscribe({
      next: (contacts) => {
        this.contacts = contacts;
        this.cdr.detectChanges();
      },
      error: (error) => this.showError(error)
    });
  }

  private defaultContactTypeId(): number | null {
    return this.contactTypes.find((type) => type.code === 'PERSON')?.id ?? null;
  }

  private showError(error: unknown): void {
    this.saving = false;
    this.snackBar.open(this.extractMessage(error), 'Cerrar', { duration: 4000 });
    this.cdr.detectChanges();
  }

  private extractMessage(error: any): string {
    return getErrorMessage(error);
  }
}
