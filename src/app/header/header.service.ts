import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  isDarkmode$ = new BehaviorSubject<boolean>(false);

  constructor() { }
  
}
