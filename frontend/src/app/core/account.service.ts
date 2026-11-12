import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { appEnvironment } from './environment';

export interface SavedCalculation {
  id: string;
  toolSlug: string;
  title: string;
  inputs: Record<string, unknown>;
  result: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
interface AuthResponse {
  token: string;
  email: string;
}
@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly apiBase = appEnvironment.apiBaseUrl;
  private readonly emailSubject = new BehaviorSubject<string | null>(this.readEmail());
  readonly email$ = this.emailSubject.asObservable();
  get signedIn() {
    return !!this.readToken();
  }
  private readToken() {
    return this.browser ? sessionStorage.getItem('bt_access_token') : null;
  }
  private readEmail() {
    return this.browser ? sessionStorage.getItem('bt_account_email') : null;
  }
  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.readToken()}` });
  }
  register(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.apiBase}/auth/register`, { email, password })
      .pipe(tap((r) => this.accept(r)));
  }
  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.apiBase}/auth/login`, { email, password })
      .pipe(tap((r) => this.accept(r)));
  }
  private accept(r: AuthResponse) {
    if (this.browser) {
      sessionStorage.setItem('bt_access_token', r.token);
      sessionStorage.setItem('bt_account_email', r.email);
    }
    this.emailSubject.next(r.email);
  }
  logout() {
    if (this.browser) {
      sessionStorage.removeItem('bt_access_token');
      sessionStorage.removeItem('bt_account_email');
    }
    this.emailSubject.next(null);
  }
  save(payload: { toolSlug: string; title: string; inputs: object; result: object }) {
    return this.http.post(`${this.apiBase}/saved-calculations`, payload, {
      headers: this.headers(),
    });
  }
  list(): Observable<SavedCalculation[]> {
    return this.http.get<SavedCalculation[]>(`${this.apiBase}/saved-calculations`, {
      headers: this.headers(),
    });
  }
  rename(id: string, title: string) {
    return this.http.patch(
      `${this.apiBase}/saved-calculations/${id}`,
      { title },
      { headers: this.headers() },
    );
  }
  remove(id: string) {
    return this.http.delete(`${this.apiBase}/saved-calculations/${id}`, {
      headers: this.headers(),
    });
  }
}
