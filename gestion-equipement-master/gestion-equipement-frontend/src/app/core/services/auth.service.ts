import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RoleEmploye } from '../models/employe.model';

const STORAGE_KEY = 'gestion-equipement.currentUser';
export const TOKEN_STORAGE_KEY = 'gestion-equipement.token';

export interface AuthenticatedUser {
  id: string;
  nom: string;
  email: string;
  role: RoleEmploye;
}

interface LoginResponse extends AuthenticatedUser {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private currentUserSignal = signal<AuthenticatedUser | null>(this.readFromStorage());
  readonly user = this.currentUserSignal.asReadonly();

  constructor(private http: HttpClient) {}

  currentUser(): AuthenticatedUser | null {
    return this.currentUserSignal();
  }

  isLoggedIn(): boolean {
    return this.currentUserSignal() !== null;
  }

  hasRole(...roles: RoleEmploye[]): boolean {
    const user = this.currentUserSignal();
    return !!user && roles.includes(user.role);
  }

  login(email: string, motDePasse: string): Observable<AuthenticatedUser> {
    return this.http.post<LoginResponse>('/api/auth/login', { email, motDePasse }).pipe(
      map(({ token, ...user }) => {
        this.currentUserSignal.set(user);
        if (this.isBrowser) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          localStorage.setItem(TOKEN_STORAGE_KEY, token);
        }
        return user;
      })
    );
  }

  logout(): void {
    this.currentUserSignal.set(null);
    if (this.isBrowser) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }

  private readFromStorage(): AuthenticatedUser | null {
    if (!this.isBrowser) {
      return null;
    }

    if (!localStorage.getItem(TOKEN_STORAGE_KEY)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthenticatedUser) : null;
  }
}
