import { Component, Input, OnInit } from '@angular/core';
import { ModalComponent } from '../../modals.component';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html'
})
export class ConfirmComponent implements OnInit, ModalComponent {

  @Input() data: any;
  @Input() resolve: Function;
  @Input() reject: Function;

  constructor() { }

  ngOnInit(): void {
  }

  onResolve() {
    this.resolve(true);
  }

  onDismiss() {
    this.resolve(false);
  }

}
