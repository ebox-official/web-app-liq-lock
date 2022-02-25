import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ConnectService } from '../cards/connect/connect.service';

@Injectable({
  providedIn: 'root'
})
export class ConnectGuard implements CanActivate {

  constructor(
    private connectService: ConnectService,
    private router: Router
  ) {

  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    
      if (this.connectService.isConnected$.getValue()) {
        return true;
      }

      // Send user to an helper screen with the current URL as returnUrl
      this.router.navigate(["/please-connect"], { queryParams: { returnUrl: state.url } })
      return false;

  }
  
}
