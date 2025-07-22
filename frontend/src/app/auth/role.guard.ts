import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserProfile } from './auth.service';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

export const RoleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const expectedRole = route.data['role'];

  return auth.getProfile().pipe(
    map((user: UserProfile) => {
      if (user.role === expectedRole) {
        return true;
      }
      let target = '/auth/login';
      if (user.role === 'doctor') target = '/dashboard/doctor';
      else if (user.role === 'admin') target = '/dashboard/admin';
      else if (user.role === 'patient') target = '/dashboard/patient';
      snackBar.open('No tienes permiso para acceder a esta sección', 'Cerrar', {
        duration: 3000,
        panelClass: ['bg-danger', 'text-white'],
      });
      return router.createUrlTree([target]);
    }),
    catchError((err) => {
      console.error('[RoleGuard] Error en getProfile:', err);
      snackBar.open('Debes iniciar sesión para acceder', 'Cerrar', {
        duration: 3000,
        panelClass: ['bg-danger', 'text-white'],
      });
      return of(router.createUrlTree(['/auth/login']));
    })
  );
};
