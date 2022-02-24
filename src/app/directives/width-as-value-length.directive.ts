import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appWidthAsValueLength]'
})
export class WidthAsValueLengthDirective {

  constructor(private elRef: ElementRef) { }

  @HostListener("input")
  adjustWidth() {
    const el = this.elRef.nativeElement;
    const pl = window.getComputedStyle(el, null).getPropertyValue("padding-right");
    const pr = window.getComputedStyle(el, null).getPropertyValue("padding-left");
    el.style.fontFamily = "monospace";
    el.style.width = `calc(2px + ${pl} + ${pr} + ${el.value.length}ch)`;
  }

  ngOnInit() {
    this.adjustWidth();
  }

}
