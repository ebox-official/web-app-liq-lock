import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appBsPop]'
})
export class BsPopDirective {

  constructor(private elRef: ElementRef) { }

  ngOnInit() {
    new (window as any).bootstrap.Popover(this.elRef.nativeElement);
  }

}
