import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-copyright',
  template: '<small class="text-muted">© {{ year }} ebox</small>'
})
export class CopyrightComponent implements OnInit {

  year = new Date().getFullYear();

  constructor() { }

  ngOnInit(): void {
  }

}
