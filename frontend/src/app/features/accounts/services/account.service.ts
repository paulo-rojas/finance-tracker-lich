import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/constants/api.config';
import {
  Account,
  CreateAccountRequest,
  UpdateAccountRequest
} from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly baseUrl = `${API_BASE_URL}/api/accounts`;

  constructor(private readonly http: HttpClient) {}

  createAccount(request: CreateAccountRequest): Observable<Account> {
    return this.http.post<Account>(this.baseUrl, request);
  }

  getAccounts(userId: number): Observable<Account[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<Account[]>(this.baseUrl, { params });
  }

  getAccount(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/${id}`);
  }

  updateAccount(id: number, request: UpdateAccountRequest): Observable<Account> {
    return this.http.put<Account>(`${this.baseUrl}/${id}`, request);
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
