import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BindComponent } from './cards/bind/bind.component';
import { ConnectComponent } from './cards/connect/connect.component';
import { CreateLockComponent } from './cards/create-lock/create-lock.component';
import { HomeComponent } from './cards/home/home.component';
import { FindLockComponent } from './cards/lock-list-shell/find-lock/find-lock.component';
import { LockListShellComponent } from './cards/lock-list-shell/lock-list-shell.component';
import { LockListComponent } from './cards/lock-list-shell/lock-list/lock-list.component';
import { LockComponent } from './cards/lock-list-shell/lock/lock.component';
import { NotFoundComponent } from './cards/not-found/not-found.component';
import { PleaseConnectComponent } from './cards/please-connect/please-connect.component';
import { ReferralComponent } from './cards/referral/referral.component';
import { ConnectGuard } from './guards/connect.guard';

const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },
  { path: "home", component: HomeComponent },
  { path: "connect", component: ConnectComponent },
  { path: "please-connect", component: PleaseConnectComponent },
  { path: "lock-list",
    component: LockListShellComponent,
    canActivate: [ConnectGuard],
    children: [
      { path: "", redirectTo: "find", pathMatch: "full"},
      { path: "find", component: FindLockComponent },
      { path: "personal", component: LockListComponent, data: { viewMode: "personal" } },
      { path: "general", component: LockListComponent, data: { viewMode: "general" } }
    ]
  },
  { path: "lock-list/find/:index", component: LockComponent, canActivate: [ConnectGuard] },
  { path: "lock-list/personal/:index", component: LockComponent, canActivate: [ConnectGuard] },
  { path: "lock-list/general/:index", component: LockComponent, canActivate: [ConnectGuard] },
  { path: "create-lock", component: CreateLockComponent, canActivate: [ConnectGuard] },
  { path: "referral", component: ReferralComponent, canActivate: [ConnectGuard] },
  { path: "ref/:id", component: BindComponent, canActivate: [ConnectGuard] },
  { path: "**", component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
