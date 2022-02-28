import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Lock } from 'src/app/services/liquidity-locker.service';

@Component({
  selector: 'app-lock-list-item',
  templateUrl: './lock-list-item.component.html',
  styleUrls: ['./lock-list-item.component.scss']
})
export class LockListItemComponent implements OnInit {

  @Input("lock") lock: Lock;
  @Output("viewInitialized") viewInitialized = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.viewInitialized.emit(true);
  }

}
