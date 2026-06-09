import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/constants/api.config';
import {
  AccountType,
  Category,
  ContactType,
  Currency,
  TransactionType
} from '../models/catalog.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly baseUrl = `${API_BASE_URL}/api/catalogs`;

  constructor(private readonly http: HttpClient) {}

  getCurrencies(): Observable<Currency[]> {
    return this.http.get<Currency[]>(`${this.baseUrl}/currencies`);
  }

  getAccountTypes(): Observable<AccountType[]> {
    return this.http.get<AccountType[]>(`${this.baseUrl}/account-types`);
  }

  getContactTypes(): Observable<ContactType[]> {
    return this.http.get<ContactType[]>(`${this.baseUrl}/contact-types`);
  }

  getTransactionTypes(): Observable<TransactionType[]> {
    return this.http.get<TransactionType[]>(`${this.baseUrl}/transaction-types`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }
}
