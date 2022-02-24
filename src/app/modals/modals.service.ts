import { Injectable } from '@angular/core';
import { Routes } from '@angular/router';
import { Subject } from 'rxjs';
import { ChooseNetworkComponent } from './modals/choose-network/choose-network.component';
import { ConfirmComponent } from './modals/confirm/confirm.component';
import { PolkadotProviderComponent } from './modals/polkadot-provider/polkadot-provider.component';

export interface Modal {
  path: string;
  component: any;
  resolve: any;
  reject: any;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class ModalsService {

  modalHasChanged$ = new Subject<Modal>();
  openedModal: Modal | undefined;

  routes: Routes = [
    { path: "confirm", component: ConfirmComponent },
    { path: "choose-network", component: ChooseNetworkComponent },
    { path: "polkadot-provider", component: PolkadotProviderComponent },
  ];

  constructor() { }

  open(path: string, data: any): Promise<any> {
    const route = this.routes.find(x => x.path === path);
    if (!route) throw new Error("Could not find given modal.");

    // Close previous modal if present
    if (this.openedModal) {
      this.openedModal.reject();
      this.openedModal = undefined;
      this.modalHasChanged$.next();
    }

    // Create a promise
    let resolve, reject;
    let promise = new Promise((_resolve, _reject) => {
      resolve = (data: any) => {
        this.modalHasChanged$.next();
        this.openedModal = undefined;
        _resolve(data);
      }
      reject = (data: any) => {
        this.modalHasChanged$.next();
        this.openedModal = undefined;
        _reject(data);
      }
    });

    // Set new opened modal
    this.openedModal = { path, component: route.component, resolve, reject, data };

    // Load component
    this.modalHasChanged$.next(this.openedModal);

    return promise;
  }

}
