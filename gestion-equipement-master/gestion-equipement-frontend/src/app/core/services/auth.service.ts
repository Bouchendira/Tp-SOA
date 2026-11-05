import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, throwError, of } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';
import { EmployeService } from './employe.service';
import { Employe, RoleEmploye } from '../models/employe.model';

const STORAGE_KEY = 'gestion-equipement.currentUser';

export interface AuthenticatedUser {
  id: string;
  nom: string;
  email: string;
  role: RoleEmploye;
}

/**
 * PROTOTYPE ONLY. Simulates POST /api/auth/login against the local
 * employe mock data instead of calling the real Spring Boot endpoint,
 * and stores a fake "session" in localStorage so a page refresh keeps
 * the user logged in (same UX as the real JWT-based flow will have,
 * just without an actual signed token to validate).
 *
 * SSR NOTE: localStorage does not exist on the server. Every access is
 * guarded behind isPlatformBrowser() so this service is safe to inject
 * during server-side rendering (it just behaves as "logged out" on the
 * server, which is correct - the real session state only matters once
 * the app hydrates in the browser).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private currentUserSignal = signal<AuthenticatedUser | null>(this.readFromStorage());
  readonly user = this.currentUserSignal.asReadonly();

  constructor(private employeService: EmployeService) {}

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
    return this.employeService.load().pipe(
      switchMap(() => {
        const employe: Employe | undefined = this.employeService
          .getAll()
          .find((e) => e.email.toLowerCase() === email.toLowerCase());

        if (!employe || employe.motDePasse !== motDePasse) {
          return throwError(() => new Error('Email ou mot de passe incorrect'));
        }

        const user: AuthenticatedUser = {
          id: employe.id,
          nom: employe.nom,
          email: employe.email,
          role: employe.role,
        };
        return of(user);
      }),
      delay(300),
      map((user) => {
        this.currentUserSignal.set(user);
        if (this.isBrowser) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        }
        return user;
      })
    );
  }

  logout(): void {
    this.currentUserSignal.set(null);
    if (this.isBrowser) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  private readFromStorage(): AuthenticatedUser | null {
    if (!this.isBrowser) {
      return null;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthenticatedUser) : null;
  }
}
