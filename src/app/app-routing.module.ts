import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConnectComponent } from './cards/connect/connect.component';
import { CreateLockComponent } from './cards/create-lock/create-lock.component';
import { HomeComponent } from './cards/home/home.component';
import { LockListGeneralComponent } from './cards/lock-list-general/lock-list-general.component';
import { LockListPersonalComponent } from './cards/lock-list-personal/lock-list-personal.component';
import { LockListComponent } from './cards/lock-list/lock-list.component';
import { NotFoundComponent } from './cards/not-found/not-found.component';
import { PleaseConnectComponent } from './cards/please-connect/please-connect.component';
import { ConnectGuard } from './guards/connect.guard';

const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },
  { path: "home", component: HomeComponent },
  { path: "connect", component: ConnectComponent },
  { path: "please-connect", component: PleaseConnectComponent },
  { path: "lock-list",
    component: LockListComponent,
    children: [
      { path: "", redirectTo: "general", pathMatch: "full"},
      { path: "general", component: LockListGeneralComponent },
      { path: "personal", component: LockListPersonalComponent, canActivate: [ConnectGuard] }
    ]
  },
  { path: "create-lock", component: CreateLockComponent, canActivate: [ConnectGuard] },
  { path: "**", component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
