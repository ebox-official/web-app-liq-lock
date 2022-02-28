import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ToasterService, ToastObject } from './toaster.service';

@Component({
  selector: 'app-toaster',
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.scss']
})
export class ToasterComponent implements OnInit {

  @ViewChild("anchor") anchor: ElementRef;

  constructor(
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.toasterService.toast$.subscribe((toast) => this.placeToast(toast));
  }

  placeToast(toast: ToastObject) {

    // Create the toast
    const div = document.createElement("DIV");
    div.innerHTML = `
    <div class="toast align-items-center ${toast.background} ${toast.color} border-0 mb-3" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body fs-5">
          ${toast.message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
    `;

    // Place the toast inside its container
    const toastEl: any = div.firstElementChild;
    this.anchor.nativeElement.appendChild(toastEl);

    // Initialize it and show it
    const bootstrapToast = new (window as any).bootstrap.Toast(toastEl);
    bootstrapToast.show();

    // On toast hidden remove it from document flow
    toastEl.addEventListener("hidden.bs.toast", () =>
      toastEl.style.display = "none"
    );
  }

}
