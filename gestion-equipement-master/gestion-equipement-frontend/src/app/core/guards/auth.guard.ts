import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleEmploye } from '../models/employe.model';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    return true;
  }
  return router.parseUrl('/login');
};

/** Factory: restricts a route to one or more roles, e.g. roleGuard(RoleEmploye.ADMINISTRATEUR) */
export function roleGuard(...roles: RoleEmploye[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.hasRole(...roles)) {
      return true;
    }
    return router.parseUrl('/dashboard');
  };
}
