import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/constants/api.config';
import {
  Contact,
  CreateContactRequest,
  UpdateContactRequest
} from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly baseUrl = `${API_BASE_URL}/api/contacts`;

  constructor(private readonly http: HttpClient) {}

  createContact(request: CreateContactRequest): Observable<Contact> {
    return this.http.post<Contact>(this.baseUrl, request);
  }

  getContacts(userId: number): Observable<Contact[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<Contact[]>(this.baseUrl, { params });
  }

  getContact(id: number): Observable<Contact> {
    return this.http.get<Contact>(`${this.baseUrl}/${id}`);
  }

  updateContact(id: number, request: UpdateContactRequest): Observable<Contact> {
    return this.http.put<Contact>(`${this.baseUrl}/${id}`, request);
  }

  deleteContact(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
