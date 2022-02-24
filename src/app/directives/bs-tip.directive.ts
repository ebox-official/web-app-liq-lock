import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appBsTip]'
})
export class BsTipDirective {

  constructor(private elRef: ElementRef) { }

  ngOnInit() {
    new (window as any).bootstrap.Tooltip(this.elRef.nativeElement);
  }

}
