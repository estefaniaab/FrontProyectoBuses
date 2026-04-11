import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { SecurityService } from '../services/security.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedGuard implements CanActivate {
  constructor(private securityService:SecurityService, private router:Router) {}
  canActivate(): boolean {
    if (this.securityService.existSession()) {
      return true;
    } else {
      Swal.fire({
        title: 'Sesión expirada o inválida',
        icon: 'error',
        timer: 3000
      });
      this.router.navigate(['/login']);
      return false;
    }
  }

}


