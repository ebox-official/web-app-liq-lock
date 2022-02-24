import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingIndicatorService {

  indicators: any = {};

  constructor() { }

  on(uniqueId: string) {
    if (!(uniqueId in this.indicators)) this.indicators[uniqueId] = true;
  }

  off(uniqueId: string) {
    if (uniqueId in this.indicators) delete this.indicators[uniqueId];
  }
}
