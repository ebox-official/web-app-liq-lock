import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConnectComponent } from './cards/connect/connect.component';
import { CreateLockComponent } from './cards/create-lock/create-lock.component';
import { HomeComponent } from './cards/home/home.component';
import { LockListShellComponent } from './cards/lock-list-shell/lock-list-shell.component';
import { LockListComponent } from './cards/lock-list-shell/lock-list/lock-list.component';
import { LockComponent } from './cards/lock-list-shell/lock/lock.component';
import { NotFoundComponent } from './cards/not-found/not-found.component';
import { PleaseConnectComponent } from './cards/please-connect/please-connect.component';
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
      { path: "", redirectTo: "general", pathMatch: "full"},
      { path: "general", component: LockListComponent, data: { viewMode: "general" } },
      { path: "personal", component: LockListComponent, data: { viewMode: "personal" } }
    ]
  },
  { path: "lock-list/general/:index", component: LockComponent, canActivate: [ConnectGuard] },
  { path: "lock-list/personal/:index", component: LockComponent, canActivate: [ConnectGuard] },
  { path: "create-lock", component: CreateLockComponent, canActivate: [ConnectGuard] },
  { path: "**", component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
