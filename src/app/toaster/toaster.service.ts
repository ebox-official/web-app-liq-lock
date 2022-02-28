import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export enum ToastColor {
  primary = "bg-primary;text-white",
  success = "bg-success;text-white",
  warning = "bg-warning;text-dark",
  danger = "bg-danger;text-dark"
}

export interface ToastObject {
  background: string;
  color: string;
  message: string;
  time: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToasterService {

  toast$ = new Subject<ToastObject>();

  constructor() { }

  publish(toastColor: ToastColor, message: string, time = 3000) {
    let [background, color] = toastColor.split(";");
    this.toast$.next({ background, color, message, time });
  }

}
