import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-modal-archetype',
  templateUrl: './modal-archetype.component.html'
})
export class ModalArchetypeComponent implements OnInit {

  @ViewChild("modal") modal: ElementRef;
  @Output("dismissed") dismissed = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {

    // Intialize Boostrap modal
    const bootstrapModal = new (window as any).bootstrap.Modal(this.modal.nativeElement, { keyboard: false, backdrop: false });
    bootstrapModal.show();
  }

  emitDismiss() {
    this.dismissed.emit();
  }

  // Dismiss modal by clicking outside it
  checkClick(evt: any) {
    if (evt.target.classList.contains("modal"))
      this.emitDismiss();
  }

}
