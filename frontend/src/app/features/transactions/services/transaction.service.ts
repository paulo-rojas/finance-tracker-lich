import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/constants/api.config';
import {
  SaveTransactionRequest,
  Transaction,
  TransactionTypeCode
} from '../models/transaction.model';

export interface TransactionFilters {
  userId?: number;
  accountId?: number | null;
  transactionTypeCode?: TransactionTypeCode | null;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly baseUrl = `${API_BASE_URL}/api/transactions`;

  constructor(private readonly http: HttpClient) {}

  createTransaction(request: SaveTransactionRequest): Observable<Transaction> {
    return this.http.post<Transaction>(this.baseUrl, request);
  }

  getTransactions(filters?: number | TransactionFilters): Observable<Transaction[]> {
    let params = new HttpParams();

    if (typeof filters === 'number') {
      params = params.set('userId', filters);
    } else if (filters) {
      if (filters.userId) {
        params = params.set('userId', filters.userId);
      }

      if (filters.accountId) {
        params = params.set('accountId', filters.accountId);
      }

      if (filters.transactionTypeCode) {
        params = params.set('transactionTypeCode', filters.transactionTypeCode);
      }
    }

    return this.http.get<Transaction[]>(this.baseUrl, { params });
  }

  getTransaction(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.baseUrl}/${id}`);
  }

  updateTransaction(
    id: number,
    request: SaveTransactionRequest
  ): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.baseUrl}/${id}`, request);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
