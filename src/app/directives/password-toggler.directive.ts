import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appPasswordToggler]'
})
export class PasswordTogglerDirective {

  @Input("appPasswordToggler") toggleTarget: any;

  state = false;

  constructor(private elRef: ElementRef) { }

  @HostListener("click")
  toggleState() {
    if (this.state === false) {
      this.toggleTarget.type = "text";
      this.elRef.nativeElement.classList.add("password-visible");
    }
    else {
      this.toggleTarget.type = "password";
      this.elRef.nativeElement.classList.remove("password-visible");
    }
    this.state = !this.state;
  }

}
