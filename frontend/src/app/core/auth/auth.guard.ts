import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (await auth.isAuthenticated()) {
    return true;
  }

  // Sin sesión: se muestra la página de login (con el botón hacia Cognito)
  return router.createUrlTree(['/login']);
};