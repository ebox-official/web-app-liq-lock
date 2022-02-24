import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConnectComponent } from './cards/connect/connect.component';
import { HomeComponent } from './cards/home/home.component';
import { LockListGeneralComponent } from './cards/lock-list-general/lock-list-general.component';
import { LockListPersonalComponent } from './cards/lock-list-personal/lock-list-personal.component';
import { LockListComponent } from './cards/lock-list/lock-list.component';
import { NotFoundComponent } from './cards/not-found/not-found.component';

const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },
  { path: "home", component: HomeComponent },
  { path: "connect", component: ConnectComponent },
  { path: "lock-list", component: LockListComponent,
    children: [
      { path: "", redirectTo: "general", pathMatch: "full"},
      { path: "general", component: LockListGeneralComponent },
      { path: "personal", component: LockListPersonalComponent }
    ]
  },
  { path: "**", component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
