import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-not-found',
  template: `
  <app-card-archetype>
    <ng-container class="card-header-content">
        <div style="height: 1rem"></div>
    </ng-container>
    <ng-container class="card-body-content">
        <div class="p-3 text-center">
            <h2 class="display-1 fw-bolder text-primary">404</h2>
            <p class="mb-1 lead fw-bold">Not found</p>
            <p><small>The resource could not be found.</small></p>
        </div>
    </ng-container>
    <ng-container class="card-footer-content">
        <div style="height: 1rem"></div>
    </ng-container>
  </app-card-archetype>
  `
})
export class NotFoundComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
